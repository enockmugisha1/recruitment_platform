import { ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BusinessDashboard as DashboardData, RecruiterCredentials, businessService } from "../../api/services";
import AddRecruiterModal from "../../components/business/AddRecruiterModal";
import CompaniesPanel from "../../components/business/CompaniesPanel";
import TrendChart from "../../components/business/TrendChart";
import CredentialsModal from "../../components/CredentialsModal";
import { apiError } from "../../utils/errors";

const PIPELINE = [
  { key: "submitted", label: "Submitted", bar: "bg-blue-500" },
  { key: "under_review", label: "Under review", bar: "bg-amber-400" },
  { key: "shortlisted", label: "Shortlisted", bar: "bg-purple-500" },
  { key: "accepted", label: "Accepted", bar: "bg-green-500" },
  { key: "rejected", label: "Rejected", bar: "bg-red-400" },
] as const;

function Kpi({ icon, tone, label, value, children }: { icon: string; tone: string; label: string; value: number; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><i className={`fa-solid ${icon}`}></i></span>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">{children}</div>
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="mb-4 text-sm text-gray-500">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

/** /business: how the whole platform is doing, and what needs the business's attention. */
export default function BusinessDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addingTo, setAddingTo] = useState<{ id: number; name: string } | null>(null);
  const [credentials, setCredentials] = useState<RecruiterCredentials | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await businessService.dashboard());
      setError(false);
    } catch (err) {
      setError(true);
      toast.error(apiError(err, "Failed to load the dashboard"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // anything changed on this page: refresh the numbers and the companies table
  const changed = () => {
    load();
    setRefreshKey((k) => k + 1);
  };

  const unfreeze = async (id: number) => {
    setBusyId(id);
    try {
      await businessService.updateRecruiter(id, { is_active: true });
      toast.success("Recruiter unfrozen");
      changed();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const reset = async (id: number) => {
    if (!window.confirm("Reset this recruiter's password and send them a new temporary one?")) return;
    setBusyId(id);
    try {
      setCredentials(await businessService.resetRecruiterPassword(id));
      changed();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-20 text-center text-gray-500 shadow-sm">
        {error ? (
          <>
            <i className="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500"></i>
            <p className="mb-3">The dashboard couldn't be loaded.</p>
            <button onClick={load} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">Try again</button>
          </>
        ) : (
          <><i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading dashboard...</>
        )}
      </div>
    );
  }

  const { companies, recruiters, jobs, applications, job_seekers: seekers, ai, attention } = data;
  const maxStatus = Math.max(1, ...Object.values(applications.by_status));
  const attentionTotal =
    attention.companies_without_recruiters.count + attention.awaiting_first_login.count + attention.frozen_recruiters.count;

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            The whole platform at a glance · updated {new Date(data.generated_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <i className="fa-solid fa-rotate mr-2"></i>Refresh
          </button>
          <Link to="/business/companies?new=1" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <i className="fa-solid fa-plus mr-2"></i>Add company
          </Link>
        </div>
      </div>

      {/* Overall numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon="fa-building" tone="bg-green-100 text-green-600" label="Companies" value={companies.total}>
          <span><strong className="text-green-600">{companies.active}</strong> active</span>
          <span><strong className="text-blue-600">{companies.frozen}</strong> frozen</span>
        </Kpi>
        <Kpi icon="fa-user-tie" tone="bg-purple-100 text-purple-600" label="Recruiters" value={recruiters.total}>
          <span><strong className="text-green-600">{recruiters.active}</strong> active</span>
          <span><strong className="text-blue-600">{recruiters.frozen}</strong> frozen</span>
          <span><strong className="text-amber-600">{recruiters.awaiting_first_login}</strong> not logged in yet</span>
        </Kpi>
        <Kpi icon="fa-briefcase" tone="bg-blue-100 text-blue-600" label="Jobs" value={jobs.total}>
          <span><strong className="text-green-600">{jobs.open}</strong> open</span>
          <span><strong>{jobs.expired}</strong> closed</span>
          <span><strong>{jobs.posted_last_30_days}</strong> new in 30 days</span>
        </Kpi>
        <Kpi icon="fa-file-lines" tone="bg-amber-100 text-amber-600" label="Applications" value={applications.total}>
          <span><strong>{applications.last_7_days}</strong> this week</span>
          <span><strong>{applications.last_30_days}</strong> in 30 days</span>
        </Kpi>
        <Kpi icon="fa-users" tone="bg-rose-100 text-rose-600" label="Job seekers" value={seekers.total}>
          <span><strong className="text-green-600">+{seekers.new_last_30_days}</strong> in 30 days</span>
        </Kpi>
      </div>

      {/* Trend + pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Last 30 days" subtitle="Applications received and jobs posted each day" className="lg:col-span-2">
          <TrendChart data={data.trend} />
        </Card>
        <div className="space-y-6">
          <Card title="Application pipeline" subtitle="Where every application stands right now">
            <div className="space-y-3">
              {PIPELINE.map((step) => {
                const n = applications.by_status[step.key];
                return (
                  <div key={step.key}>
                    <div className="mb-1 flex justify-between text-sm"><span className="text-gray-600">{step.label}</span><strong>{n}</strong></div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className={`h-2 rounded-full ${step.bar}`} style={{ width: `${(n / maxStatus) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="AI analysis" subtitle="How the ML model is doing">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Analysed</p><p className="text-xl font-bold text-gray-800">{ai.completed}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Average match</p><p className="text-xl font-bold text-gray-800">{ai.average_score ?? "—"}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">In progress</p><p className="text-xl font-bold text-gray-800">{ai.pending + ai.processing}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Failed / not run</p><p className="text-xl font-bold text-gray-800">{ai.failed + ai.unavailable}</p></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Needs attention + top companies */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Needs your attention" subtitle={attentionTotal === 0 ? "Nothing right now. All good." : `${attentionTotal} item${attentionTotal === 1 ? "" : "s"} to look at`} className="lg:col-span-2">
          {attentionTotal === 0 ? (
            <p className="py-6 text-center text-gray-400"><i className="fa-solid fa-circle-check mr-2 text-green-500"></i>Every company has recruiters and everyone has logged in.</p>
          ) : (
            <div className="space-y-5">
              {attention.companies_without_recruiters.count > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Companies with no recruiters ({attention.companies_without_recruiters.count})</p>
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {attention.companies_without_recruiters.items.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <Link to={`/business/companies/${c.id}`} className="font-semibold text-gray-800 hover:text-green-600">{c.name}</Link>
                        {c.is_active ? (
                          <button onClick={() => setAddingTo(c)} className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700">Add recruiter</button>
                        ) : <span className="text-xs text-blue-600">Frozen</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {attention.awaiting_first_login.count > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Haven't logged in yet ({attention.awaiting_first_login.count})</p>
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {attention.awaiting_first_login.items.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span><span className="font-semibold text-gray-800">{r.name}</span> <span className="text-gray-500">· {r.company_name}</span>
                          <span className="block text-xs text-gray-400">{r.email} · added {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></span>
                        <button onClick={() => reset(r.id)} disabled={busyId === r.id}
                          className="shrink-0 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">Resend password</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {attention.frozen_recruiters.count > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Frozen recruiters ({attention.frozen_recruiters.count})</p>
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {attention.frozen_recruiters.items.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span><span className="font-semibold text-gray-800">{r.name}</span> <span className="text-gray-500">· {r.company_name}</span></span>
                        <button onClick={() => unfreeze(r.id)} disabled={busyId === r.id}
                          className="shrink-0 rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40">Unfreeze</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Most active companies" subtitle="By applications received">
          {data.top_companies.length === 0 ? (
            <p className="py-6 text-center text-gray-400">No companies yet.</p>
          ) : (
            <ol className="space-y-3">
              {data.top_companies.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/business/companies/${c.id}`} className="block truncate text-sm font-semibold text-gray-800 hover:text-green-600">{c.name}</Link>
                    <p className="text-xs text-gray-500">{c.jobs} job{c.jobs === 1 ? "" : "s"}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{c.applications}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* Companies: add recruiters / freeze */}
      <CompaniesPanel limit={6} onChanged={load} refreshKey={refreshKey} />

      {addingTo && <AddRecruiterModal company={addingTo} onClose={() => setAddingTo(null)} onCreated={changed} />}
      {credentials && <CredentialsModal credentials={credentials} reset onClose={() => setCredentials(null)} />}
    </div>
  );
}
