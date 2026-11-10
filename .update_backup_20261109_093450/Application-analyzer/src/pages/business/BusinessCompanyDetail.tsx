import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { businessService, Company } from "../../api/services";
import TeamManager from "../../components/TeamManager";
import { apiError } from "../../utils/errors";

/** /business/companies/:id — company details and its recruiters. */
export default function BusinessCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);

  const team = useMemo(() => businessService.team(companyId), [companyId]);

  const load = async () => {
    try {
      const c = await businessService.getCompany(companyId);
      setCompany(c);
      setForm(c);
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await businessService.updateCompany(companyId, {
        name: form.name,
        location: form.location,
        contact_email: form.contact_email,
        website: form.website || null,
        description: form.description,
      });
      setCompany((prev) => (prev ? { ...prev, ...updated } : updated));
      setEditing(false);
      toast.success("Company updated");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!company) return;
    const next = !company.is_active;
    const warning = next
      ? `Reactivate ${company.name}?`
      : `Deactivate ${company.name}? Its recruiters will not be able to log in and its jobs will be hidden from job seekers. Nothing is deleted.`;
    if (!window.confirm(warning)) return;
    try {
      const updated = await businessService.updateCompany(companyId, { is_active: next });
      setCompany((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success(next ? "Company reactivated" : "Company deactivated");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center text-gray-500 shadow-sm">
        <i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
        <p className="mb-4 text-gray-600">Company not found.</p>
        <Link to="/business" className="font-semibold text-green-600 hover:underline">Back to companies</Link>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="space-y-6">
      <ToastContainer />
      <Link to="/business" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600">
        <i className="fa-solid fa-chevron-left"></i>All companies
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {editing ? (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className={input} required placeholder="Company name" value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} placeholder="Location" value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input className={input} type="email" placeholder="Contact email" value={form.contact_email ?? ""}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <input className={input} type="url" placeholder="Website" value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <textarea className={input} rows={3} placeholder="About the company" value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setEditing(false); setForm(company); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
              <button type="submit" disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">{company.name}</h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${company.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {company.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {[company.location, company.contact_email].filter(Boolean).join(" · ") || "No contact details yet"}
              </p>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline">{company.website}</a>
              )}
              {company.description && <p className="mt-3 max-w-2xl text-sm text-gray-600">{company.description}</p>}
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <span><strong className="text-gray-800">{company.recruiter_count ?? 0}</strong> recruiters</span>
                <span><strong className="text-gray-800">{company.job_count ?? 0}</strong> jobs</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <i className="fa-solid fa-pen mr-2"></i>Edit
              </button>
              <button onClick={toggleActive}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${company.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
                {company.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        )}
      </div>

      <TeamManager api={team} canManage onChanged={load} />
    </div>
  );
}
