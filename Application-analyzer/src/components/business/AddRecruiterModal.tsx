import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { businessService, NewRecruiter, RecruiterCredentials } from "../../api/services";
import { apiError } from "../../utils/errors";
import CredentialsModal from "../CredentialsModal";

interface Props {
  company: { id: number; name: string };
  onClose: () => void;
  /** called once the recruiter exists and the credentials dialog has been closed */
  onCreated: () => void;
}

const EMPTY: NewRecruiter = { first_name: "", last_name: "", email: "", is_company_admin: false };

/** Quick "add a recruiter to this company" form, usable from any business screen. */
export default function AddRecruiterModal({ company, onClose, onCreated }: Props) {
  const [form, setForm] = useState<NewRecruiter>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<RecruiterCredentials | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setCredentials(await businessService.team(company.id).add(form));
    } catch (err) {
      toast.error(apiError(err, "Could not add the recruiter"));
    } finally {
      setSaving(false);
    }
  };

  if (credentials) {
    return <CredentialsModal credentials={credentials} onClose={() => { onCreated(); onClose(); }} />;
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Add a recruiter</h3>
          <p className="text-sm text-gray-500">to <strong>{company.name}</strong></p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="First name" required value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input className={input} placeholder="Last name" required value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <input className={input} type="email" placeholder="Work email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600"
            checked={form.is_company_admin}
            onChange={(e) => setForm({ ...form, is_company_admin: e.target.checked })} />
          Can manage the team
        </label>
        <p className="text-xs text-gray-500">
          A temporary password is generated and emailed to them; they must change it on first login.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
