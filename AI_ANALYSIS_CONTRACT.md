# AI analysis of submitted applications: what the ML service must do

When a job seeker submits an application, the backend sends it to the ML service,
stores the answer, and shows it **to the recruiters of the job's company only**.
Job seekers never receive it (the field is not even present in their responses).

The backend side is done. This page is the exact contract the ML service must meet.

## 1. Turn it on

Set these environment variables on the Django backend (Render, `.env`, ...):

| Variable | Meaning |
|---|---|
| `ML_SERVICE_URL` | Full URL of the endpoint below, e.g. `https://ml.example.com/api/v1/ai/analyze-application/` |
| `ML_SERVICE_API_KEY` | Optional. Sent as `Authorization: Bearer <key>` |
| `ML_SERVICE_TIMEOUT` | Seconds to wait for an answer (default `90`) |

While `ML_SERVICE_URL` is empty, every application is marked **unavailable**: nothing fails,
and recruiters see "AI analysis isn't available yet".

Applications submitted *before* the model went live can be analysed afterwards:

```bash
python manage.py run_ai_analysis          # everything without a completed analysis
python manage.py run_ai_analysis --all    # re-run everything
```

Recruiters can also press **Run AI analysis / Retry** on a candidate's page.

## 2. Request the backend sends

`POST {ML_SERVICE_URL}` as `multipart/form-data`:

| Field | Type | Content |
|---|---|---|
| `application_id` | text | Our id, for your logs |
| `resume` | file | PDF or DOCX, max 5 MB |
| `cover_letter` | file | Optional, PDF or DOCX |
| `job` | text (JSON) | `{"id", "title", "description", "requirements", "location", "job_type", "company"}` |
| `applicant` | text (JSON) | `{"years_of_experience", "education", "location", "nationality", "institution_or_company", "bio"}` |

## 3. Response the ML service returns

`200` with a JSON object. Everything is optional **except that there must be a score or a summary**.

```json
{
  "match_score": 85,
  "recommendation": "Strong match - recommend for interview",
  "summary": "Experienced backend developer with a strong skills match.",
  "matched_skills": ["Python", "Django", "PostgreSQL"],
  "missing_skills": ["Docker"],
  "strengths": ["Exceeds the experience requirement by 2 years"],
  "weaknesses": ["No container orchestration experience"],
  "experience_match": {"required_years": 3, "candidate_years": 5, "verdict": "exceeds"},
  "education_match": {"required": "Bachelor's degree", "candidate": "BSc Computer Science", "verdict": "matches"},
  "score_breakdown": {"skills": 75, "experience": 95, "education": 90, "overall": 85},
  "next_steps": "Schedule a technical interview focused on cloud skills",
  "model_version": "v1.2"
}
```

* `match_score` is a number 0-100 (also accepted: `score`, `overall_score`, or `score_breakdown.overall`).
* Unknown extra keys are stored and ignored; missing keys are simply not shown.
* Any non-2xx answer, timeout or invalid JSON marks the analysis **failed** (the recruiter sees the reason and can retry). The applicant's submission is never affected.

## 4. Quick test

```bash
curl -X POST "$ML_SERVICE_URL" \
  -H "Authorization: Bearer $ML_SERVICE_API_KEY" \
  -F application_id=1 \
  -F resume=@cv.pdf \
  -F 'job={"id":1,"title":"Backend Developer","description":"...","requirements":"Python, Django","location":"Kigali","job_type":"full_time","company":"Acme"}' \
  -F 'applicant={"years_of_experience":3,"education":"BSc","location":"Kigali"}'
```
