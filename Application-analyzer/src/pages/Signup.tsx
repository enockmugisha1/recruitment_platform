import { FormEvent } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OTPDisplay from "../components/OTPDisplay";

export default function Signup() {
  const [handleAuth] = useOutletContext() as [(e: FormEvent) => void];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [role, setRole] = useState("job_seeker"); // Default role: job_seeker or recruiter
  const [loading, setLoading] = useState(false);
  const [showOTPDisplay, setShowOTPDisplay] = useState(false);
  const [receivedOTP, setReceivedOTP] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (password !== rePassword) {
      toast.error("Passwords don't match", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirm: rePassword, // Backend requires password_confirm
        role,
        debug: true  // Request OTP in response for testing
      });

      // Backend returns: { message, email, otp_code }
      // Show OTP if provided
      if (response.data.otp_code) {
        const otpCode = response.data.otp_code;
        setReceivedOTP(otpCode);
        setShowOTPDisplay(true);
        
        console.log('🔐 Registration OTP Code:', otpCode);
        console.log(`
╔════════════════════════════════════╗
║  🔐 REGISTRATION OTP (FOR TESTING) ║
╠════════════════════════════════════╣
║                                    ║
║         CODE: ${otpCode}           ║
║         EMAIL: ${email}            ║
║                                    ║
║   Valid for 15 minutes             ║
║   (Check server console too)       ║
║                                    ║
╚════════════════════════════════════╝
        `);
        
        toast.info('Registration successful! OTP displayed for verification.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        // Show success toast
        toast.success('Registration successful! Check server console for OTP.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Show login redirect message
      toast.info('You can now login with your credentials', {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Redirect to login page after delay
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = "Registration failed";
      if (err.response?.data) {
        // Handle different error formats
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.email) {
          errorMessage = err.response.data.email[0]; // Email validation error
        } else if (err.response.data.password) {
          errorMessage = err.response.data.password[0]; // Password validation error
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      }
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
          <input className="w-full peer"
            type="text" placeholder="First Name" name="firstName" onChange={(e) => setFirstName(e.target.value)} />
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">First Name</span>
        </label>

        <label className="relative mt-3">
          <input className="w-full peer"
            type="text" placeholder="Last Name" name="lastName" onChange={(e) => setLastName(e.target.value)}/>
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">Last Name</span>
        </label>

        <label className="relative mt-3">
          <input className="w-full peer"
            type="text" placeholder="Email" name="email" onChange={(e) => setEmail(e.target.value)} />
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">Email</span>
        </label>

        {/* Role Selection */}
        <div className="mt-3">
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold">Role</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="job_seeker"
                checked={role === "job_seeker"}
                onChange={() => setRole("job_seeker")}
                className="accent-accentsecondary"
              />
              Job Seeker
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={role === "recruiter"}
                onChange={() => setRole("recruiter")}
                className="accent-accentsecondary"
              />
              Recruiter
            </label>
          </div>
        </div>

        <label className="relative mt-3">
          <input className="w-full peer"
            type="password" placeholder="Password" name="password" onChange={(e) => setPassword(e.target.value)} />
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">Password</span>
          <i
            className="fa-solid fa-eye-slash text-sm scale-x-110 text-accentprimary/60 absolute right-4 -translate-y-1/2 top-1/2 cursor-pointer select-none"
            tabIndex={0}
            onClick={togglePass}
          ></i>
        </label>

        <label className="relative mt-3">
          <input className="w-full peer"
            type="password" placeholder="Re-enter Password" name="rePassword" onChange={(e) => setRePassword(e.target.value)}/>
          <span className="text-xs absolute left-3 -top-1.5 px-1 bg-graybg text- leading-none font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">Re-enter Password</span>
          <i
            className="fa-solid fa-eye-slash text-sm scale-x-110 text-accentprimary/60 absolute right-4 -translate-y-1/2 top-1/2 cursor-pointer select-none"
            tabIndex={0}
            onClick={togglePass}
          ></i>
        </label>

      </form>
      <button 
        onClick={handleSignup} 
        disabled={loading}
        className={`w-full h-10 text-sm rounded-lg bg-accentsecondary text-white font-semibold mt-10 shadow-black/25 shadow-inner hover:shadow-transparent hover:scale-[1.01] transition-all ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
      <button className="w-full h-10 text-sm rounded-lg bg-accentprimary text-white font-semibold mt-4 shadow-black/25 shadow-inner hover:shadow-transparent hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
        Sign Up with Google <i className="text-xl fa-brands fa-google"></i>
      </button>
      
      {/* OTP Display Modal */}
      {showOTPDisplay && receivedOTP && (
        <OTPDisplay
          otpCode={receivedOTP}
          email={email}
          purpose="Email Verification"
          onClose={() => {
            setShowOTPDisplay(false);
            // Redirect to login after closing OTP display
            setTimeout(() => navigate('/login'), 1000);
          }}
        />
      )}
    </>
  );
}