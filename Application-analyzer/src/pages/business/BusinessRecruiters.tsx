import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RecruiterCredentials, RecruiterMember, businessService } from "../../api/services";
import CredentialsModal from "../../components/CredentialsModal";
import { apiError } from "../../utils/errors";

const TABS = [
  { key: "", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Not logged in yet" },
  { key: "frozen", label: "Frozen" },
] as const;

/** /business/recruiters: every recruiter on the platform, freeze or unfreeze them from here. */
export default function BusinessRecruiters() {
  const [rows, setRows] = useState<RecruiterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [credentials, setCredentials] = useState<RecruiterCredentials | null>(null);

  const load = useCallback(async (q = search, s = status) => {
    try {
      setRows(await businessService.listRecruiters({ search: q || undefined, status: s || undefined }));
    } catch (err) {
      toast.error(apiError(err, "Failed to load recruiters"));
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load(search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const act = async (id: number, work: () => Promise<unknown>, ok?: string) => {
    setBusyId(id);
    try {
      await work();
      if (ok) toast.success(ok);
      await load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const reset = (r: RecruiterMember) => {
    if (!window.confirm(`Reset the password for ${r.first_name} ${r.last_name}?`)) return;
    act(r.id, async () => setCredentials(await businessService.resetRecruiterPassword(r.id)));
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Recruiters</h1>
        <p className="text-sm text-gray-500">
          Everyone who recruits on the platform. To add a recruiter, open their company.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setStatus(t.key)}
                className={`px-3 py-1.5 font-semibold ${status === t.key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); load(); }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
            <i className="fa-solid fa-search text-gray-400"></i>
            <input className="w-56 bg-transparent text-sm outline-none" placeholder="Name, email or company..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500"><i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading...</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <i className="fa-solid fa-user-group mb-3 text-3xl text-gray-300"></i><p>No recruiters match.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Recruiter</th>
                  <th className="px-4 py-3 text-left font-bold">Company</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="px-4 py-3 text-left font-bold">Last login</th>
                  <th className="px-4 py-3 text-center font-bold">Jobs</th>
                  <th className="px-6 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className={r.is_active ? "" : "bg-blue-50/40"}>
                    <td className="px-6 py-3">
                      <p className="font-semibold text-gray-800">{r.first_name} {r.last_name}
                        {r.is_company_admin && <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">Team manager</span>}
                      </p>
                      <p className="text-xs text-gray-500">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/business/companies/${r.company_id}`} className="text-gray-800 hover:text-green-600">{r.company_name}</Link>
                      {r.company_is_active === false && <span className="ml-2 text-xs text-blue-600">(company frozen)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!r.is_active ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Frozen</span>
                        : r.password_change_pending ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Not logged in yet</span>
                        : <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.last_login ? new Date(r.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                    </td>
                    <td className="px-4 py-3 text-center">{r.jobs_posted}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button disabled={busyId === r.id} onClick={() => reset(r)}
                          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">Reset password</button>
                        <button disabled={busyId === r.id}
                          onClick={() => act(r.id, () => businessService.updateRecruiter(r.id, { is_company_admin: !r.is_company_admin }),
                            r.is_company_admin ? "Team manager access removed" : "Can now manage the team")}
                          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                          {r.is_company_admin ? "Remove manager" : "Make manager"}</button>
                        <button disabled={busyId === r.id}
                          onClick={() => act(r.id, () => businessService.updateRecruiter(r.id, { is_active: !r.is_active }),
                            r.is_active ? "Recruiter frozen" : "Recruiter unfrozen")}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40 ${r.is_active ? "bg-blue-500 hover:bg-blue-600" : "bg-green-600 hover:bg-green-700"}`}>
                          <i className={`fa-solid ${r.is_active ? "fa-snowflake" : "fa-sun"} mr-1`}></i>{r.is_active ? "Freeze" : "Unfreeze"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {credentials && <CredentialsModal credentials={credentials} reset onClose={() => setCredentials(null)} />}
    </div>
  );
}
