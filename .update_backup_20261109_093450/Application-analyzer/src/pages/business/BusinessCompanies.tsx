import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { businessService, Company } from "../../api/services";
import { apiError } from "../../utils/errors";

const EMPTY = { name: "", location: "", contact_email: "", website: "", description: "" };

/** /business — every company registered on the platform, and a form to add one. */
export default function BusinessCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async (q = search) => {
    try {
      setCompanies(await businessService.listCompanies({ search: q || undefined }));
    } catch (err) {
      toast.error(apiError(err, "Failed to load companies"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Company> = { ...form, website: form.website || null };
      const company = await businessService.createCompany(payload);
      toast.success(`${company.name} registered. Now add its recruiters.`);
      navigate(`/business/companies/${company.id}`);
    } catch (err) {
      toast.error(apiError(err, "Could not register the company"));
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
          <p className="text-sm text-gray-500">
            Register a company, then add its recruiters. They get a temporary password by email.
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">
          <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-plus"} mr-2`}></i>
          {showForm ? "Cancel" : "Add company"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">New company</h2>
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
          <textarea className={input} rows={3} placeholder="About the company" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Registering..." : "Register company"}
            </button>
          </div>
        </form>
      )}

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="max-w-md">
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
          <i className="fa-solid fa-search text-gray-400"></i>
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Search companies..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </form>

      {loading ? (
        <div className="rounded-2xl bg-white p-16 text-center text-gray-500 shadow-sm">
          <i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading...
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl bg-white p-16 text-center text-gray-500 shadow-sm">
          <i className="fa-solid fa-building mb-3 text-4xl text-gray-300"></i>
          <p>{search ? "No companies match your search." : "No companies yet. Add the first one."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} to={`/business/companies/${c.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-lg font-bold text-green-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="font-bold text-gray-800">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.location || "No location"}</p>
              <div className="mt-4 flex gap-5 border-t border-gray-100 pt-3 text-sm text-gray-600">
                <span><strong className="text-gray-800">{c.recruiter_count ?? 0}</strong> recruiters</span>
                <span><strong className="text-gray-800">{c.job_count ?? 0}</strong> jobs</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
