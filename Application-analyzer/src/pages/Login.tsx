import { FormEvent, useRef, useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { toast } from 'react-toastify';
import { homeForRole, saveSession } from "../utils/auth";

type Role = "job_seeker" | "recruiter";

const ROLE_TABS: { key: Role; label: string }[] = [
  { key: "job_seeker", label: "Job Seeker" },
  { key: "recruiter", label: "Recruiter" },
];

const ROLE_COPY: Record<Role, { emailPlaceholder: string; emailType: string }> = {
  job_seeker: { emailPlaceholder: "Email Address", emailType: "email" },
  recruiter: { emailPlaceholder: "Work Email Address", emailType: "email" },
};

function roleLabel(role: string) {
  if (role === "recruiter") return "Recruiter";
  if (role === "business") return "Business";
  return "Job Seeker";
}

export default function Login() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<Role>("job_seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const copy = ROLE_COPY[activeRole];

  function switchRole(role: Role) {
    if (role === activeRole) return;
    setActiveRole(role);
    // Clear form state between tabs so nothing leaks across roles
    setEmail("");
    setPassword("");
    setRememberMe(false);
    setRoleError(null);
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Guards against a double-click/double-Enter firing this twice before
    // the `loading` state (which is async) has a chance to disable the button.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setRoleError(null);

    try {
      const response = await axios.post('/auth/login/', { email, password });
      const { access, refresh, user_data: user } = response.data;

      // The account's real role comes from the server. If it doesn't match the
      // tab that was picked, don't let them in on the wrong tab.
      if (user.role !== activeRole) {
        const message =
          user.role === "business"
            ? "This is a ThinkGreen Afrika business account. Please use the Business login page."
            : `This account is registered as a ${roleLabel(user.role)}. Please use the ${roleLabel(user.role)} tab instead.`;
        setRoleError(message);
        toast.error(message, { position: "top-right", autoClose: 5000 });
        submittingRef.current = false;
        return;
      }

      saveSession({ access, refresh, user_data: user }, rememberMe);

      // New recruiters arrive with a temporary password and must choose their own
      if (user.must_change_password) {
        toast.info('Please choose a new password to continue.', { position: "top-right", autoClose: 4000 });
        navigate('/change-password', { replace: true });
        return;
      }

      toast.success('Login successful!', { position: "top-right", autoClose: 3000 });
      handleAuth(e);
      navigate(homeForRole(user.role), { replace: true });
    } catch (err: any) {
      const data = err.response?.data;
      const errorMessage = data?.error || data?.detail || "Login failed";
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  function togglePass(e: React.MouseEvent<HTMLElement>) {
    const iEl = e.target as HTMLElement;
    const input = iEl.parentElement?.querySelector("input") as HTMLInputElement;
    input.type = input.type === "password" ? "text" : "password";
    iEl.classList.toggle("fa-eye-slash");
    iEl.classList.toggle("fa-eye");
  }

  return (
    <div className="pt-6 sm:pt-8 pb-2">

      {/* Role Tabs — Job Seeker / Recruiter. The Login/Sign Up switch above is handled by AuthLayout's nav. */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div
          role="tablist"
          aria-label="Login role"
          className="inline-flex w-full max-w-sm gap-1 rounded-xl bg-gray-100 p-1"
        >
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeRole === tab.key}
              onClick={() => switchRole(tab.key)}
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
                activeRole === tab.key
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role error — shown when credentials are valid but belong to the other role */}
      {roleError && (
        <div className="max-w-sm mx-auto mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
          <span>{roleError}</span>
        </div>
      )}

      {/* Dynamic form area — only this block changes between tabs */}
      <div key={activeRole} className="animate-fadein">
        <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
          {/* Email / Work Email field */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              type={copy.emailType}
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition pr-10"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className="fa-solid fa-eye-slash text-sm text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600"
              onClick={togglePass}
            ></i>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex flex-wrap gap-2 justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-gray-700">Remember</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-green-600 hover:text-green-700 hover:underline font-medium"
            >
              Forget Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-orange w-full"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner loading-spinner mr-2"></i>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            className="btn-teal w-full flex items-center justify-center gap-3"
          >
            Login with Google
            <i className="fab fa-google text-xl"></i>
          </button>
        </form>

        {/* Sign-up is for job seekers only; recruiters are created by their company */}
        {activeRole === "job_seeker" ? (
          <p className="text-center text-sm text-gray-600 mt-6">
            New here?{" "}
            <Link to="/signup" className="text-green-600 font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-600 mt-6">
            Recruiter accounts are created by your company. Use the email and temporary
            password sent to you; you'll choose your own on first login.
          </p>
        )}
        <p className="text-center text-xs text-gray-400 mt-3">
          ThinkGreen Afrika staff?{" "}
          <Link to="/business/login" className="text-green-600 hover:underline">
            Business login
          </Link>
        </p>
      </div>
    </div>
  );
}