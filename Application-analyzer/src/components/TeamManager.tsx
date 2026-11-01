import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NewRecruiter, RecruiterCredentials, RecruiterMember, TeamApi } from "../api/services";
import { apiError } from "../utils/errors";
import CredentialsModal from "./CredentialsModal";

interface Props {
  api: TeamApi;
  /** may this viewer add / change recruiters? (business, or a company admin) */
  canManage: boolean;
  /** the logged-in user's email, so they can't deactivate/demote/reset themselves */
  selfEmail?: string;
  /** called after the list changes so a parent can refresh its counts */
  onChanged?: () => void;
}

const EMPTY: NewRecruiter = { first_name: "", last_name: "", email: "", is_company_admin: false };

/**
 * The recruiters of one company. Used by the business (any company) and by a
 * company admin (their own company) — the `api` prop decides which.
 */
export default function TeamManager({ api, canManage, selfEmail, onChanged }: Props) {
  const [members, setMembers] = useState<RecruiterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewRecruiter>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [credentials, setCredentials] = useState<{ data: RecruiterCredentials; reset: boolean } | null>(null);

  const load = async () => {
    try {
      setMembers(await api.list());
    } catch (err) {
      toast.error(apiError(err, "Failed to load the team"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    await load();
    onChanged?.();
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await api.add(form);
      setCredentials({ data: result, reset: false });
      setForm(EMPTY);
      setShowForm(false);
      await refresh();
    } catch (err) {
      toast.error(apiError(err, "Could not add the recruiter"));
    } finally {
      setSaving(false);
    }
  };

  const change = async (m: RecruiterMember, patch: Partial<Pick<RecruiterMember, "is_active" | "is_company_admin">>, ok: string) => {
    setBusyId(m.id);
    try {
      await api.update(m.id, patch);
      toast.success(ok);
      await refresh();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const reset = async (m: RecruiterMember) => {
    if (!window.confirm(`Reset the password for ${m.first_name} ${m.last_name}? They will have to choose a new one at their next login.`)) return;
    setBusyId(m.id);
    try {
      const result = await api.resetPassword(m.id);
      setCredentials({ data: result, reset: true });
      await refresh();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Recruiters</h2>
          <p className="text-sm text-gray-500">
            Every recruiter here can see and manage this company's jobs and applications.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-user-plus"} mr-2`}></i>
            {showForm ? "Cancel" : "Add recruiter"}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form onSubmit={handleAdd} className="space-y-4 border-b border-gray-100 bg-gray-50 px-6 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input className={input} placeholder="First name" required value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className={input} placeholder="Last name" required value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <input className={input} type="email" placeholder="Work email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600"
              checked={form.is_company_admin}
              onChange={(e) => setForm({ ...form, is_company_admin: e.target.checked })} />
            Can manage the team (add and manage other recruiters)
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              A temporary password is generated and emailed to them. They must change it when they first log in.
            </p>
            <button type="submit" disabled={saving}
              className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <i className="fa-solid fa-spinner loading-spinner mr-2 text-green-500"></i>Loading team...
        </div>
      ) : members.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <i className="fa-solid fa-user-group mb-3 text-3xl text-gray-300"></i>
          <p>No recruiters yet.{canManage ? " Add the first one above." : ""}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-bold">Recruiter</th>
                <th className="px-6 py-3 text-left font-bold">Access</th>
                <th className="px-6 py-3 text-left font-bold">Status</th>
                <th className="px-6 py-3 text-center font-bold">Jobs posted</th>
                {canManage && <th className="px-6 py-3 text-right font-bold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => {
                const isSelf = !!selfEmail && m.email.toLowerCase() === selfEmail.toLowerCase();
                const busy = busyId === m.id;
                return (
                  <tr key={m.id} className={m.is_active ? "" : "bg-gray-50 text-gray-400"}>
                    <td className="px-6 py-3">
                      <p className="font-semibold text-gray-800">
                        {m.first_name} {m.last_name} {isSelf && <span className="text-xs font-normal text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.is_company_admin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.is_company_admin ? "Team manager" : "Recruiter"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {!m.is_active ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Deactivated</span>
                      ) : m.password_change_pending ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Awaiting first login</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">{m.jobs_posted}</td>
                    {canManage && (
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button disabled={busy || isSelf} onClick={() => reset(m)}
                            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                            Reset password
                          </button>
                          <button disabled={busy || isSelf}
                            onClick={() => change(m, { is_company_admin: !m.is_company_admin }, m.is_company_admin ? "Team manager access removed" : "Can now manage the team")}
                            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                            {m.is_company_admin ? "Remove manager" : "Make manager"}
                          </button>
                          <button disabled={busy || isSelf}
                            onClick={() => change(m, { is_active: !m.is_active }, m.is_active ? "Recruiter deactivated" : "Recruiter reactivated")}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${m.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
                            {m.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {credentials && (
        <CredentialsModal credentials={credentials.data} reset={credentials.reset} onClose={() => setCredentials(null)} />
      )}
    </div>
  );
}
