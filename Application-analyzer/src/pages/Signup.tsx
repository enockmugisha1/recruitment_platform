import { FormEvent, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/register/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        role: formData.role
      });

      toast.success('Account created successfully! Please login.', {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        "Signup failed";
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

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full relative z-10">
        {/* Illustration area */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-32 bg-blue-100 rounded-2xl flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-20 h-20">
              <circle cx="50" cy="35" r="15" fill="#4CAF50" opacity="0.3" />
              <circle cx="50" cy="35" r="10" fill="#4CAF50" />
              <rect x="35" y="55" width="30" height="35" rx="5" fill="#66BB6A" opacity="0.4" />
              <rect x="30" y="50" width="10" height="15" fill="#81C784" />
              <rect x="60" y="50" width="10" height="15" fill="#81C784" />
            </svg>
          </div>
        </div>

        {/* Signup Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-gray-400 mr-2">
              <Link to="/login" className="hover:text-green-600 transition">Login</Link>
            </span>
            <span className="text-green-600">Sign Up</span>
          </h1>
          <p className="text-xs text-green-600 mt-1 uppercase tracking-wide font-semibold">Admin</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="recruiter">Recruiter / Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition pr-10"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i
              className="fa-solid fa-eye-slash text-sm text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600"
              onClick={togglePass}
            ></i>
          </div>

          {/* Re-enter Password */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition pr-10"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-orange w-full mt-6"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner loading-spinner mr-2"></i>
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Google Signup Button */}
          <button
            type="button"
            className="btn-teal w-full flex items-center justify-center gap-3"
          >
            Sign Up with Google
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