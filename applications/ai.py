"""
Sending a submitted application to the ML service and storing what it says.

The ML model itself lives in its own service (see AI_ANALYSIS_CONTRACT.md for
exactly what it receives and returns). This module:
  * queues an analysis as soon as an application is submitted,
  * calls the service with the resume + job + applicant details,
  * saves the result so RECRUITERS can read it on the candidate page.

If ML_SERVICE_URL is empty the analysis is marked "unavailable" (not failed),
and can be run later from the candidate page or with
`python manage.py run_ai_analysis` once the model is deployed.
"""
import json
import logging
import mimetypes
import os
from datetime import timedelta

try:
    import requests
except ImportError:  # the app must still start if the package isn't installed yet
    requests = None
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from recruitment_platform.background import run_in_background
from .models import ApplicationAIAnalysis, JobSeekerApplication

logger = logging.getLogger(__name__)

# a "processing" row older than this is assumed to have died with its worker
STALE_AFTER = timedelta(minutes=5)


def ml_is_configured():
    return bool(settings.ML_SERVICE_URL)


def _is_busy(analysis):
    return analysis.status in ('pending', 'processing') and analysis.updated_at > timezone.now() - STALE_AFTER


def queue_analysis(application, force=False):
    """
    Create/refresh the analysis row and start the ML call in the background.
    Returns the ApplicationAIAnalysis. Safe to call repeatedly.
    """
    analysis, _ = ApplicationAIAnalysis.objects.get_or_create(application=application)

    if not ml_is_configured():
        if analysis.status != 'completed':
            analysis.status = 'unavailable'
            analysis.save(update_fields=['status', 'updated_at'])
        return analysis

    if not force and _is_busy(analysis) and analysis.attempts > 0:
        return analysis  # already running

    analysis.status = 'pending'
    analysis.error = ''
    analysis.save(update_fields=['status', 'error', 'updated_at'])
    # only start once the application row is really committed
    transaction.on_commit(lambda: run_in_background(analyze_application, application.pk))
    return analysis


def _number(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return max(0, min(100, round(number)))


def _extract_score(result):
    for path in (('match_score',), ('score',), ('overall_score',), ('score_breakdown', 'overall')):
        value = result
        for key in path:
            value = value.get(key) if isinstance(value, dict) else None
        score = _number(value)
        if score is not None:
            return score
    return None


def _build_request(application):
    job, profile = application.job, application.applicant
    company = job.company.name if job.company_id else job.recruiter.company_name
    payload = {
        'application_id': application.pk,
        'job': {
            'id': job.pk, 'title': job.title, 'description': job.description,
            'requirements': job.requirements, 'location': job.location,
            'job_type': job.job_type, 'company': company,
        },
        'applicant': {
            'years_of_experience': profile.years_of_experience, 'education': profile.education,
            'location': profile.location, 'nationality': profile.nationality,
            'institution_or_company': profile.institution_or_company, 'bio': profile.bio,
        },
    }
    headers = {'Accept': 'application/json'}
    if settings.ML_SERVICE_API_KEY:
        headers['Authorization'] = f"Bearer {settings.ML_SERVICE_API_KEY}"
    return payload, headers


def analyze_application(application_id, force=False):
    """Call the ML service for one application and store the outcome."""
    try:
        application = JobSeekerApplication.objects.select_related(
            'job__company', 'job__recruiter', 'applicant__user').get(pk=application_id)
    except JobSeekerApplication.DoesNotExist:
        return None

    analysis, _ = ApplicationAIAnalysis.objects.get_or_create(application=application)

    if not ml_is_configured():
        analysis.status = 'unavailable'
        analysis.save(update_fields=['status', 'updated_at'])
        return analysis

    if requests is None:
        analysis.status = 'failed'
        analysis.error = "The 'requests' package is not installed on the server (pip install requests)."
        analysis.save(update_fields=['status', 'error', 'updated_at'])
        return analysis

    analysis.status = 'processing'
    analysis.attempts += 1
    analysis.error = ''
    analysis.save(update_fields=['status', 'attempts', 'error', 'updated_at'])

    opened = []
    try:
        payload, headers = _build_request(application)
        files = {}
        for field in ('resume', 'cover_letter'):
            stored = getattr(application, field)
            if stored:
                handle = stored.open('rb')
                opened.append(handle)
                name = os.path.basename(stored.name)
                files[field] = (name, handle, mimetypes.guess_type(name)[0] or 'application/octet-stream')

        response = requests.post(
            settings.ML_SERVICE_URL,
            data={'application_id': payload['application_id'],
                  'job': json.dumps(payload['job']),
                  'applicant': json.dumps(payload['applicant'])},
            files=files, headers=headers, timeout=settings.ML_SERVICE_TIMEOUT,
        )
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, dict):
            raise ValueError("The ML service did not return a JSON object.")

        score = _extract_score(result)
        summary = str(result.get('summary') or result.get('explanation') or '')
        if score is None and not summary and not result:
            raise ValueError("The ML service returned an empty result.")

        analysis.status = 'completed'
        analysis.match_score = score
        analysis.recommendation = str(result.get('recommendation') or '')[:255]
        analysis.summary = summary
        analysis.result = result
        analysis.analyzed_at = timezone.now()
        analysis.error = ''
    except requests.Timeout:
        analysis.status, analysis.error = 'failed', 'The ML service took too long to respond.'
    except requests.ConnectionError:
        analysis.status, analysis.error = 'failed', 'Could not reach the ML service.'
    except requests.HTTPError as exc:
        analysis.status, analysis.error = 'failed', f"The ML service returned HTTP {exc.response.status_code}."
    except FileNotFoundError:
        analysis.status, analysis.error = 'failed', "The applicant's resume file could not be found."
    except Exception as exc:
        logger.exception("AI analysis of application %s failed", application_id)
        analysis.status, analysis.error = 'failed', f"Analysis failed: {exc}"[:500]
    finally:
        for handle in opened:
            try:
                handle.close()
            except Exception:
                pass

    analysis.save()
    return analysis
