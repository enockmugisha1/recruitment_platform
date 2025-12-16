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
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/login/', {
        email,
        password
      });

      // Assuming the backend returns accessToken and refreshToken
      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('email', email); // Store user info if needed
      if (rememberMe) {
        localStorage.setItem('refreshToken', refresh);
      } else {
        sessionStorage.setItem('refreshToken', refresh);
      }

      // Show success toast
      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Call the auth handler from context
      handleAuth(e);
      // navigate('/dashboard');   // Redirect to dashboard or home page
      
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Login failed";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
    <>
      {/* Toast Container - renders the toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <form className="mt-8 flex flex-col">
        <label className="relative">
          <input 
            className="w-full peer"
            type="email" 
            placeholder="Email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <span className="absolute left-3 -top-1.5 px-1 bg-graybg text-xs leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">
            Email
          </span>
        </label>

        <label className="relative mt-5">
          <input 
            className="w-full peer"
            type="password" 
            placeholder="Password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="absolute left-3 -top-1.5 px-1 bg-graybg text-xs leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">
            Password
          </span>
          <i
            className="fa-solid fa-eye-slash text-sm scale-x-110 text-accentprimary/60 absolute right-4 -translate-y-1/2 top-1/2 cursor-pointer select-none"
            tabIndex={0}
            onClick={togglePass}
          ></i>
        </label>

        <div className="flex justify-between mt-2 text-sm">
          <label className="flex items-center gap-2 select-none checkbox">
            <input 
              type="checkbox" 
              name="remember" 
              className="w-0 h-0 peer" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="w-3 h-3 bg-transparent checkmark peer-checked:bg-accentprimary"></span>
            Remember me
          </label>
          <Link to="/forgot-password" className="text-accentprimary hover:underline">Forgot Password?</Link>
        </div>

        <button 
          onClick={handleLogin} 
          disabled={loading}
          className={`w-full h-10 text-sm rounded-lg bg-accentsecondary text-white font-semibold mt-10 shadow-black/25 shadow-inner hover:shadow-transparent hover:scale-[1.01] transition-all ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <button 
          type="button" 
          className="w-full h-10 text-sm rounded-lg bg-accentprimary text-white font-semibold mt-4 shadow-black/25 shadow-inner hover:shadow-transparent hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          Login with Google <i className="text-xl fa-brands fa-google"></i>
        </button>
      </form>
    </>
  );
}