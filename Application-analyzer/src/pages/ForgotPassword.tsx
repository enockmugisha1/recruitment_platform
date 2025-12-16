import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Step 1: Request OTP
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/otp/request/', {
        email,
        purpose: 'password_reset'
      });

      toast.success(response.data.message || 'OTP sent to your email!', {
        position: "top-right",
        autoClose: 5000,
      });

      // Show OTP in console for testing (remove in production)
      if (response.data.otp_code) {
        console.log('🔐 OTP Code:', response.data.otp_code);
        toast.info(`OTP Code (testing): ${response.data.otp_code}`, {
          position: "top-right",
          autoClose: 10000,
        });
      }

      // Move to verification step
      setStep('verify');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.email?.[0] ||
                          "Failed to send OTP";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/password/reset/', {
        email,
        otp_code: otpCode,
        new_password: newPassword,
        password_confirm: confirmPassword
      });

      toast.success(response.data.message || 'Password reset successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      let errorMessage = "Password reset failed";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.new_password) {
          errorMessage = err.response.data.new_password[0];
        } else if (err.response.data.otp_code) {
          errorMessage = err.response.data.otp_code[0];
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePass = (e: React.MouseEvent<HTMLElement>) => {
    const iEl = e.target as HTMLElement;
    const input = iEl.parentElement?.querySelector("input") as HTMLInputElement;
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
      iEl.classList.toggle("fa-eye-slash");
      iEl.classList.toggle("fa-eye");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-graybg px-4">
      <ToastContainer />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          {step === 'request' 
            ? 'Enter your email to receive a verification code'
            : 'Enter the OTP code and your new password'}
        </p>

        {step === 'request' ? (
          // Step 1: Request OTP Form
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <label className="relative block">
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary peer"
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <span className="text-xs absolute left-3 -top-2 px-1 bg-white text-gray-600 font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">
                Email Address
              </span>
            </label>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg bg-accentsecondary text-white font-semibold shadow hover:bg-opacity-90 transition-all ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-accentsecondary hover:underline text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Reset Password Form
          <form onSubmit={handleResetPassword} className="space-y-4">
            <label className="relative block">
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary peer text-center text-2xl tracking-widest"
                type="text" 
                placeholder="000000" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required 
              />
              <span className="text-xs absolute left-3 -top-2 px-1 bg-white text-gray-600 font-semibold">
                6-Digit OTP Code
              </span>
            </label>

            <label className="relative block">
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary peer pr-12"
                type="password" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
              <span className="text-xs absolute left-3 -top-2 px-1 bg-white text-gray-600 font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">
                New Password
              </span>
              <i
                className="fa-solid fa-eye-slash text-sm text-accentprimary/60 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={togglePass}
              ></i>
            </label>

            <label className="relative block">
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary peer pr-12"
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              <span className="text-xs absolute left-3 -top-2 px-1 bg-white text-gray-600 font-semibold opacity-100 peer-placeholder-shown:opacity-0 transition-opacity">
                Confirm Password
              </span>
              <i
                className="fa-solid fa-eye-slash text-sm text-accentprimary/60 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={togglePass}
              ></i>
            </label>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-semibold mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg bg-accentsecondary text-white font-semibold shadow hover:bg-opacity-90 transition-all ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="text-center space-y-2 mt-4">
              <button 
                type="button"
                onClick={() => {
                  setStep('request');
                  setOtpCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-accentsecondary hover:underline text-sm block w-full"
              >
                Didn't receive code? Request again
              </button>
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:underline text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
