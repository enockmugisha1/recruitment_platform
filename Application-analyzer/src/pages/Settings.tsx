import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../api/services";
import { getCurrentUser, clearSession } from "../utils/auth";

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [firstName, setFirstName] = useState(currentUser?.first_name || "");
  const [lastName, setLastName] = useState(currentUser?.last_name || "");
  const [saving, setSaving] = useState(false);

  const isRecruiter = currentUser?.role === "recruiter";
  const roleLabel = isRecruiter ? "Recruiter" : "Job Seeker";
  const accentClass = isRecruiter
    ? "focus:border-green-500 focus:ring-green-200"
    : "focus:border-emerald-500 focus:ring-emerald-200";
  const buttonClass = isRecruiter
    ? "bg-green-600 hover:bg-green-700"
    : "bg-emerald-600 hover:bg-emerald-700";

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateUser({
        first_name: firstName,
        last_name: lastName,
      });

      // Keep the cached user in sync so the header/sidebar reflect the change
      const storedStr = localStorage.getItem("user");
      const stored = storedStr && storedStr !== "undefined" ? JSON.parse(storedStr) : {};
      localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input
                className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none transition focus:ring-2 ${accentClass}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input
                className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none transition focus:ring-2 ${accentClass}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none"
              value={currentUser?.email || ""}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Type</label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none"
              value={roleLabel}
              disabled
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg text-white font-semibold transition ${buttonClass} disabled:opacity-60`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          To change your password, use the password reset flow.
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          Reset Password
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Log Out</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sign out of your account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
