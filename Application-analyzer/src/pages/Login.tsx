import { FormEvent, useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Role = "job_seeker" | "recruiter" | "admin";

const ROLE_TABS: { key: Role; label: string }[] = [
  { key: "job_seeker", label: "Job Seeker" },
  { key: "recruiter", label: "Recruiter" },
  { key: "admin", label: "Admin" },
];

const ROLE_COPY: Record<
  Role,
  {
    emailLabel: string;
    emailPlaceholder: string;
    emailType: string;
    showSecurityToken: boolean;
    footerPromptLabel?: string;
    footerLinkText?: string;
    footerLinkTo?: string;
  }
> = {
  job_seeker: {
    emailLabel: "Email Address",
    emailPlaceholder: "Email Address",
    emailType: "email",
    showSecurityToken: false,
    footerPromptLabel: "New here?",
    footerLinkText: "Create an Account",
    footerLinkTo: "/signup",
  },
  recruiter: {
    emailLabel: "Work Email Address",
    emailPlaceholder: "Work Email Address",
    emailType: "email",
    showSecurityToken: false,
    footerPromptLabel: "Hiring?",
    footerLinkText: "Register as an Employer / Post a Job",
    footerLinkTo: "/signup?role=recruiter",
  },
  admin: {
    emailLabel: "Admin ID / Username",
    emailPlaceholder: "Admin ID / Username",
    emailType: "text",
    showSecurityToken: true,
  },
};

export default function Login() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<Role>("job_seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const copy = ROLE_COPY[activeRole];

  function switchRole(role: Role) {
    if (role === activeRole) return;
    setActiveRole(role);
    // Clear form state between tabs so nothing leaks across roles
    setEmail("");
    setPassword("");
    setSecurityToken("");
    setRememberMe(false);
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, string> = {
        email,
        password,
        role: activeRole,
      };
      if (activeRole === "admin" && securityToken) {
        payload.security_token = securityToken;
      }

      const response = await axios.post('/auth/login/', payload);

      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('email', user?.email || email);
      localStorage.setItem('user', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('refreshToken', refresh);
      } else {
        sessionStorage.setItem('refreshToken', refresh);
      }

      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 3000,
      });

      handleAuth(e);

      setTimeout(() => {
        if (user?.role === 'recruiter') {
          navigate('/', { replace: true });
        } else if (user?.role === 'job_seeker') {
          navigate('/dashboard', { replace: true });
        } else if (user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Login failed";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer />

      {/* Decorative corner elements — static across tab switches */}
      <div className="absolute top-0 left-0 w-64 h-64 corner-decoration opacity-40">
        <div className="star-pattern w-full h-full transform rotate-45"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 corner-decoration opacity-40">
        <div className="star-pattern w-full h-full transform -rotate-45"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 max-w-md md:max-w-lg lg:max-w-xl w-full relative z-10 transition-all duration-300">
        {/* Role Tabs */}
        <div className="flex justify-center mb-8">
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

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">Login</h1>
        </div>

        {/* Dynamic form area — only this block changes between tabs */}
        <div
          key={activeRole}
          className="animate-fadein"
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email / Username / Admin ID field */}
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

            {/* Admin-only 2FA / security token field */}
            {copy.showSecurityToken && (
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  type="text"
                  inputMode="numeric"
                  placeholder="Security Token / 2FA Code"
                  value={securityToken}
                  onChange={(e) => setSecurityToken(e.target.value)}
                  maxLength={6}
                />
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
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

            {/* Google Login Button — not shown for Admin */}
            {activeRole !== "admin" && (
              <button
                type="button"
                className="btn-teal w-full flex items-center justify-center gap-3"
              >
                Login with Google
                <i className="fab fa-google text-xl"></i>
              </button>
            )}
          </form>

          {/* Role-specific sign-up / register prompt */}
          {copy.footerLinkText && copy.footerLinkTo && (
            <p className="text-center text-sm text-gray-600 mt-6">
              {copy.footerPromptLabel}{" "}
              <Link
                to={copy.footerLinkTo}
                className="text-green-600 font-semibold hover:underline"
              >
                {copy.footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}