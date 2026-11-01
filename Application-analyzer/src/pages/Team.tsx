import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { companyService, Company } from "../api/services";
import TeamManager from "../components/TeamManager";
import { getCurrentUser } from "../utils/auth";
import { apiError } from "../utils/errors";

type MyCompany = Company & { is_company_admin: boolean };

/**
 * /team — your company and its recruiters. Everyone at the company can see
 * the team; company admins (team managers) can also add recruiters.
 */
export default function Team() {
  const [company, setCompany] = useState<MyCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  const selfEmail = getCurrentUser()?.email;

  const load = async () => {
    try {
      const c = await companyService.getMine();
      setCompany(c);
      setForm(c);
    } catch (err) {
      toast.error(apiError(err, "Failed to load your company"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyService.updateMine({
        location: form.location,
        contact_email: form.contact_email,
        website: form.website || null,
        description: form.description,
      });
      await load();
      setEditing(false);
      toast.success("Company details updated");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-16 text-center text-gray-500 shadow-sm">
        <i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading...
      </div>
    );
  }
  if (!company) return null;

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {editing ? (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
              <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {[company.location, company.contact_email].filter(Boolean).join(" · ") || "No contact details yet"}
              </p>
              {company.description && <p className="mt-3 max-w-2xl text-sm text-gray-600">{company.description}</p>}
              <div className="mt-3 flex gap-6 text-sm text-gray-600">
                <span><strong className="text-gray-800">{company.recruiter_count ?? 0}</strong> recruiters</span>
                <span><strong className="text-gray-800">{company.job_count ?? 0}</strong> jobs</span>
              </div>
            </div>
            {company.is_company_admin && (
              <button onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <i className="fa-solid fa-pen mr-2"></i>Edit details
              </button>
            )}
          </div>
        )}
      </div>

      <TeamManager api={companyService.team} canManage={company.is_company_admin} selfEmail={selfEmail} onChanged={load} />
    </div>
  );
}
