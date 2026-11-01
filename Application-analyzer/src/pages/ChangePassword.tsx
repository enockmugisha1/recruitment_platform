import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../api/axios";
import { apiError } from "../utils/errors";
import { clearSession, getCurrentUser, homeForRole, loginForRole, updateStoredUser, CurrentUser } from "../utils/auth";

/**
 * Change your own password. New recruiters land here straight after their
 * first login with the temporary password and can't use anything else until
 * they've set their own (the server enforces that too).
 */
export default function ChangePassword() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return null;
  const forced = !!user.must_change_password;

  const rules = [
    { ok: next.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(next), text: "An uppercase letter" },
    { ok: /[a-z]/.test(next), text: "A lowercase letter" },
    { ok: /\d/.test(next), text: "A number" },
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) return setError("The new passwords do not match.");
    if (rules.some((r) => !r.ok)) return setError("Your new password doesn't meet all the requirements.");

    setSaving(true);
    try {
      await axios.post("/auth/password/change/", {
        current_password: current,
        new_password: next,
        password_confirm: confirm,
      });
      updateStoredUser({ must_change_password: false });
      toast.success("Password changed.");
      navigate(homeForRole(user.role), { replace: true });
    } catch (err) {
      setError(apiError(err, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    const to = loginForRole(user.role);
    clearSession();
    navigate(to, { replace: true });
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <ToastContainer />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i className="fa-solid fa-lock text-lg"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{forced ? "Choose your password" : "Change password"}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {forced
              ? "You're using a temporary password. Choose your own to continue to ThinkGreen Afrika."
              : "Enter your current password and pick a new one."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input className={input} type="password" required autoComplete="current-password"
            placeholder={forced ? "Temporary password" : "Current password"}
            value={current} onChange={(e) => setCurrent(e.target.value)} />
          <input className={input} type="password" required autoComplete="new-password"
            placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} />
          <input className={input} type="password" required autoComplete="new-password"
            placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {rules.map((r) => (
              <li key={r.text} className={r.ok ? "text-green-600" : "text-gray-400"}>
                <i className={`fa-solid ${r.ok ? "fa-circle-check" : "fa-circle"} mr-1.5`}></i>
                {r.text}
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={saving}
            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save new password"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          {!forced ? (
            <Link to={homeForRole(user.role)} className="text-gray-500 hover:text-gray-700">Cancel</Link>
          ) : <span />}
          <button onClick={logout} className="text-gray-500 hover:text-red-600">Log out</button>
        </div>
      </div>
    </div>
  );
}
