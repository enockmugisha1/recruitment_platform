import { FormEvent, useRef, useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { toast } from 'react-toastify';
import { clearSession } from "../utils/auth";

type Role = "job_seeker" | "recruiter";

const ROLE_TABS: { key: Role; label: string }[] = [
  { key: "job_seeker", label: "Job Seeker" },
  { key: "recruiter", label: "Recruiter" },
];

const ROLE_COPY: Record<
  Role,
  {
    emailPlaceholder: string;
    emailType: string;
    footerPromptLabel: string;
    footerLinkText: string;
    footerLinkTo: string;
  }
> = {
  job_seeker: {
    emailPlaceholder: "Email Address",
    emailType: "email",
    footerPromptLabel: "New here?",
    footerLinkText: "Create an Account",
    footerLinkTo: "/signup",
  },
  recruiter: {
    emailPlaceholder: "Work Email Address",
    emailType: "email",
    footerPromptLabel: "Hiring?",
    footerLinkText: "Register as an Employer / Post a Job",
    footerLinkTo: "/signup?role=recruiter",
  },
};

function roleLabel(role: Role) {
  return role === "recruiter" ? "Recruiter" : "Job Seeker";
}

/**
 * Fallback only: `user_data.role` from /auth/login/ is now the primary
 * source of truth for a user's real role (see handleLogin). This only
 * gets called if that's ever missing, by checking which of the two
 * profile-list endpoints actually has this user's data in it — those are
 * scoped server-side to the requesting user, so whichever one comes back
 * non-empty tells us their real role. This only works once someone has
 * created a profile; a brand-new user with no profile yet is
 * indistinguishable from this check alone, so the caller falls back to
 * the chosen tab in that case (this function returns null).
 */
async function detectRealRole(): Promise<Role | null> {
  const [seekerResult, recruiterResult] = await Promise.allSettled([
    axios.get('/profile/job/seeker/'),
    axios.get('/profile/job/recruiter/'),
  ]);

  const asList = (data: unknown): unknown[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
      return (data as { results: unknown[] }).results;
    }
    return [];
  };

  const hasSeekerProfile =
    seekerResult.status === 'fulfilled' && asList(seekerResult.value.data).length > 0;
  const hasRecruiterProfile =
    recruiterResult.status === 'fulfilled' && asList(recruiterResult.value.data).length > 0;

  if (hasRecruiterProfile && !hasSeekerProfile) return 'recruiter';
  if (hasSeekerProfile && !hasRecruiterProfile) return 'job_seeker';

  // Both empty (new user, no profile yet) or both non-empty (shouldn't
  // happen, but don't guess if it does) — nothing conclusive either way.
  return null;
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
    // the `loading` state (which is async) has a chance to disable the
    // button — submittingRef flips synchronously, so the second call bails
    // out immediately instead of kicking off a second request/navigation.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setRoleError(null);

    try {
      const payload: Record<string, string> = {
        email,
        password,
        role: activeRole,
      };

      const response = await axios.post('/auth/login/', payload);
      // The backend returns the logged-in user's info under `user_data`
      // (confirmed directly from users/views.py) — NOT `user`. That
      // mismatch was the actual root cause of every role mix-up: role was
      // being sent back correctly on every login, the frontend was just
      // reading a key (`user`) that never existed, so it silently fell
      // back to whatever tab was selected every single time.
      const { access, refresh, user_data: userFromServer } = response.data;

      // Store the token before anything else — the fallback role probe
      // below needs to make authenticated requests, and the axios
      // interceptor reads this token straight out of localStorage.
      localStorage.setItem('accessToken', access);
      if (rememberMe) {
        localStorage.setItem('refreshToken', refresh);
      } else {
        sessionStorage.setItem('refreshToken', refresh);
      }

      // user_data.role is now the real source of truth. The profile-probe
      // fallback only kicks in if that's ever missing (e.g. a future
      // backend change), so this keeps working even if that regresses.
      const detectedRole = userFromServer?.role ?? (await detectRealRole());
      const realRole = detectedRole ?? activeRole;

      // Someone can have valid credentials for an account whose real role
      // doesn't match the tab they picked (e.g. a recruiter account while
      // "Job Seeker" was active). The backend doesn't enforce this, so we
      // do it here: don't let them in on the wrong tab — kick them back
      // to the login screen for their actual role instead.
      const roleMismatch = detectedRole !== null && detectedRole !== activeRole;

      if (roleMismatch) {
        clearSession();
        const message = `This account is registered as a ${roleLabel(realRole)}. Please use the ${roleLabel(realRole)} login tab instead.`;
        setRoleError(message);
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
        });
        submittingRef.current = false;
        return;
      }

      const user = {
        ...userFromServer,
        role: realRole,
      };

      localStorage.setItem('email', user.email || email);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 3000,
      });

      handleAuth(e);

      navigate(user.role === 'recruiter' ? '/' : '/dashboard', { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Login failed";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
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

        {/* Role-specific sign-up / register prompt */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {copy.footerPromptLabel}{" "}
          <Link
            to={copy.footerLinkTo}
            className="text-green-600 font-semibold hover:underline"
          >
            {copy.footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}