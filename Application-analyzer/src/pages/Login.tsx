import { FormEvent, useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/login/', {
        email,
        password
      });

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

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-64 h-64 corner-decoration opacity-40">
        <div className="star-pattern w-full h-full transform rotate-45"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 corner-decoration opacity-40">
        <div className="star-pattern w-full h-full transform -rotate-45"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 max-w-md md:max-w-lg lg:max-w-xl w-full relative z-10 transition-all duration-300">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-1 text-lg font-bold">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-1 transition-all ${activeTab === "admin"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-400"
                }`}
            >
              Admin
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 py-1 transition-all ${activeTab === "user"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-400"
                }`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Login Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-green-600">Login</span>
            <span className="text-gray-400 ml-2">
              <Link to="/signup" className="hover:text-green-600 transition">Sign Up</Link>
            </span>
          </h1>
        </div>

        <form className="space-y-5">
          {/* Username/Email Field */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              type="email"
              placeholder="Username"
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
            onClick={handleLogin}
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

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="mb-1">
            <a href="#" className="hover:text-green-600 transition">Release Notes</a>
          </p>
          <p>Copyright © 2023 ThinkGreen Afrika</p>
        </div>
      </div>
    </div>
  );
}