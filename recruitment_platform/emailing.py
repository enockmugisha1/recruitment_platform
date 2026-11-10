"""
One place that sends the platform's emails, always from the ThinkGreen Afrika
no-reply address (DEFAULT_FROM_EMAIL) with the display name EMAIL_FROM_NAME.
"""
import logging
from html import escape

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def from_address():
    """'ThinkGreen Afrika <no-reply@...>' (unless DEFAULT_FROM_EMAIL already has a name)."""
    address = settings.DEFAULT_FROM_EMAIL
    if '<' in address:
        return address
    return f"{settings.EMAIL_FROM_NAME} <{address}>"


def render_html(title, paragraphs, details=None, button=None):
    """A small, mail-client-safe HTML layout (inline styles, no external assets)."""
    body = "".join(f'<p style="margin:0 0 14px;line-height:1.55">{escape(p)}</p>' for p in paragraphs)
    rows = ""
    if details:
        rows = (
            '<table role="presentation" style="width:100%;border-collapse:collapse;margin:6px 0 18px;'
            'background:#f6faf7;border-radius:8px">'
            + "".join(
                f'<tr><td style="padding:8px 14px;color:#667;font-size:13px;width:38%">{escape(k)}</td>'
                f'<td style="padding:8px 14px;font-size:14px;font-weight:600;color:#1f2d24">{escape(v)}</td></tr>'
                for k, v in details
            )
            + "</table>"
        )
    cta = ""
    if button:
        label, url = button
        cta = (
            f'<p style="margin:20px 0"><a href="{escape(url)}" style="background:#16a34a;color:#fff;'
            f'text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">'
            f'{escape(label)}</a></p>'
        )
    return (
        '<div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f2d24">'
        '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">'
        '<div style="background:#16a34a;color:#fff;padding:18px 24px;font-size:18px;font-weight:700">'
        'ThinkGreen Afrika</div>'
        f'<div style="padding:24px"><h2 style="margin:0 0 16px;font-size:20px">{escape(title)}</h2>'
        f'{body}{rows}{cta}'
        '<p style="margin:22px 0 0;font-size:12px;color:#889;line-height:1.5">This is an automated message '
        'from a no-reply address, so please don&rsquo;t reply to it.</p>'
        '</div></div></div>'
    )


def send_platform_email(subject, text_body, to, html_body=None):
    """Send one email. Returns True if the mail backend accepted it, never raises."""
    recipients = [to] if isinstance(to, str) else list(to)
    try:
        message = EmailMultiAlternatives(subject, text_body, from_address(), recipients)
        # tell auto-responders / mail clients this is a machine-generated message
        message.extra_headers['Auto-Submitted'] = 'auto-generated'
        if html_body:
            message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        return True
    except Exception as exc:  # SMTP down, bad credentials, rejected sender, ...
        logger.error("Could not send email %r to %s: %s", subject, recipients, exc)
        return False
