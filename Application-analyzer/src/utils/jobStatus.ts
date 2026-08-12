/**
 * The frontend's `Job` type has an `is_active` field, but the backend's
 * Job model doesn't — it only has `deadline` (checked directly against the
 * models.py in the backend repo: recruiter, title, description,
 * requirements, location, job_type, salary_range, deadline, created_at,
 * updated_at — no is_active anywhere). Every API response therefore has
 * `job.is_active === undefined`, which is falsy, so anything that checked
 * `job.is_active` was unconditionally treating every job as closed.
 *
 * The backend's own `active_only` query filter on GET /access/jobs/
 * defines "active" as deadline >= today, so this mirrors that same rule
 * client-side for anywhere that needs to display or reason about a job's
 * open/closed state without an extra request.
 */
export function isJobActive(job: { deadline?: string | null }): boolean {
    if (!job.deadline) return false;
    const deadline = new Date(job.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() >= today.getTime();
  }