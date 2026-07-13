import { FormEvent, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "recruiter" ? "recruiter" : "job_seeker";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole
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
      await axios.post('/auth/register/', {
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
    <div className="pt-6 sm:pt-8 pb-2">
      <ToastContainer />

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* First Name */}
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          {/* Last Name */}
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

        {/* Email */}
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Role Selection */}
        <select
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white"
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>

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
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-orange w-full mt-2"
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
    </div>
  );
}