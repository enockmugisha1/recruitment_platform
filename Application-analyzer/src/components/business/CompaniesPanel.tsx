import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { businessService, Company } from "../../api/services";
import { apiError } from "../../utils/errors";
import AddRecruiterModal from "./AddRecruiterModal";

interface Props {
  /** show only the first N companies (dashboard) and a "view all" link */
  limit?: number;
  /** called after anything changed, so a parent (the dashboard) can refresh its numbers */
  onChanged?: () => void;
  /** refetch whenever this value changes */
  refreshKey?: number;
}

const EMPTY = { name: "", location: "", contact_email: "", website: "", description: "" };

/**
 * Every company, with what the business needs to act on: add a recruiter,
 * freeze / unfreeze the whole company, or open it to manage its team.
 */
export default function CompaniesPanel({ limit, onChanged, refreshKey = 0 }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "frozen">("all");
  const [showForm, setShowForm] = useState(params.get("new") === "1");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState<Company | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async (q?: string) => {
    try {
      setCompanies(await businessService.listCompanies({ search: q || undefined }));
    } catch (err) {
      toast.error(apiError(err, "Failed to load companies"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, refreshKey]);

  const changed = async () => {
    await load(search);
    onChanged?.();
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const company = await businessService.createCompany({ ...form, website: form.website || null });
      toast.success(`${company.name} registered. Now add its recruiters.`);
      navigate(`/business/companies/${company.id}`);
    } catch (err) {
      toast.error(apiError(err, "Could not register the company"));
    } finally {
      setSaving(false);
    }
  };

  const toggleFreeze = async (c: Company) => {
    const freezing = c.is_active;
    const warning = freezing
      ? `Freeze ${c.name}? Its recruiters will be locked out immediately (even if logged in) and its jobs hidden from job seekers. Nothing is deleted and you can unfreeze it any time.`
      : `Unfreeze ${c.name}?`;
    if (!window.confirm(warning)) return;
    setBusyId(c.id);
    try {
      await businessService.updateCompany(c.id, { is_active: !freezing });
      toast.success(freezing ? `${c.name} frozen` : `${c.name} unfrozen`);
      await changed();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const visible = companies
    .filter((c) => (filter === "all" ? true : filter === "active" ? c.is_active : !c.is_active))
    .slice(0, limit ?? companies.length);

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Companies</h2>
          <p className="text-sm text-gray-500">Add recruiters, or freeze a company to lock everyone at it out.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!limit && (
            <form onSubmit={(e) => { e.preventDefault(); load(search); }}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
              <i className="fa-solid fa-search text-gray-400"></i>
              <input className="w-40 bg-transparent text-sm outline-none" placeholder="Search..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </form>
          )}
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
            {(["all", "active", "frozen"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 font-semibold capitalize ${filter === f ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {f}
              </button>
            ))}
          </div>
          {limit ? (
            <Link to="/business/companies" className="text-sm font-semibold text-green-600 hover:underline">View all</Link>
          ) : (
            <button onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-plus"} mr-2`}></i>{showForm ? "Cancel" : "Add company"}
            </button>
          )}
        </div>
      </div>

      {showForm && !limit && (
        <form onSubmit={create} className="space-y-3 border-b border-gray-100 bg-gray-50 px-6 py-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className={input} placeholder="Company name *" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={input} placeholder="Location (e.g. Kigali, Rwanda)" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input className={input} type="email" placeholder="Contact email" value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            <input className={input} type="url" placeholder="Website (https://...)" value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <textarea className={input} rows={2} placeholder="About the company" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Registering..." : "Register company"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading...
        </div>
      ) : visible.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <i className="fa-solid fa-building mb-3 text-3xl text-gray-300"></i>
          <p>{companies.length === 0 ? "No companies yet. Add the first one." : "No companies match."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-bold">Company</th>
                <th className="px-4 py-3 text-left font-bold">Status</th>
                <th className="px-4 py-3 text-center font-bold">Recruiters</th>
                <th className="px-4 py-3 text-center font-bold">Jobs (open / total)</th>
                <th className="px-4 py-3 text-center font-bold">Applications</th>
                <th className="px-6 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((c) => (
                <tr key={c.id} className={c.is_active ? "" : "bg-red-50/40"}>
                  <td className="px-6 py-3">
                    <Link to={`/business/companies/${c.id}`} className="font-semibold text-gray-800 hover:text-green-600">{c.name}</Link>
                    <p className="text-xs text-gray-500">{c.location || "No location"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {c.is_active ? "Active" : "Frozen"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <strong>{c.active_recruiter_count ?? 0}</strong>
                    {(c.frozen_recruiter_count ?? 0) > 0 && <span className="ml-1 text-xs text-blue-600">+{c.frozen_recruiter_count} frozen</span>}
                    {(c.recruiter_count ?? 0) === 0 && <span className="ml-1 text-xs text-amber-600">none yet</span>}
                  </td>
                  <td className="px-4 py-3 text-center"><strong>{c.open_job_count ?? 0}</strong> / {c.job_count ?? 0}</td>
                  <td className="px-4 py-3 text-center font-semibold">{c.application_count ?? 0}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button onClick={() => setAdding(c)} disabled={!c.is_active}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                        <i className="fa-solid fa-user-plus mr-1"></i>Add recruiter
                      </button>
                      <button onClick={() => toggleFreeze(c)} disabled={busyId === c.id}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40 ${c.is_active ? "bg-blue-500 hover:bg-blue-600" : "bg-green-600 hover:bg-green-700"}`}>
                        <i className={`fa-solid ${c.is_active ? "fa-snowflake" : "fa-sun"} mr-1`}></i>{c.is_active ? "Freeze" : "Unfreeze"}
                      </button>
                      <Link to={`/business/companies/${c.id}`}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Manage</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && <AddRecruiterModal company={adding} onClose={() => setAdding(null)} onCreated={changed} />}
    </div>
  );
}
