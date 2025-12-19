import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface OTPDisplayProps {
  otpCode: string;
  email: string;
  purpose: string;
  onClose?: () => void;
}

export default function OTPDisplay({ otpCode, email, purpose, onClose }: OTPDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(otpCode);
    toast.success('OTP copied to clipboard!', {
      position: 'bottom-center',
      autoClose: 2000,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">🔐 OTP Code</h3>
              <p className="text-sm opacity-90">For Testing/Development</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Purpose */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Purpose:</p>
            <p className="font-semibold text-gray-800 capitalize">
              {purpose.replace('_', ' ')}
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Email:</p>
            <p className="font-semibold text-gray-800 break-all">{email}</p>
          </div>

          {/* OTP Code - Large and prominent */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-600 mb-2 text-center">Your OTP Code:</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-bold text-green-600 tracking-wider font-mono">
                {otpCode}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                title="Copy to clipboard"
              >
                <i className="fa-solid fa-copy"></i>
              </button>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <i className="fa-solid fa-clock text-orange-500"></i>
            <p className="text-sm text-gray-600">
              Expires in: <span className="font-semibold text-orange-600">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <i className="fa-solid fa-info-circle mr-2"></i>
              <strong>How to use:</strong>
            </p>
            <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
              <li>Copy the code above</li>
              <li>Enter it in the OTP verification field</li>
              <li>Submit within 15 minutes</li>
            </ol>
          </div>

          {/* Development Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              <strong>Development Mode:</strong> In production, OTP will be sent via email only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              console.log('OTP Code:', otpCode);
              console.log('Email:', email);
              console.log('Purpose:', purpose);
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            <i className="fa-solid fa-terminal mr-1"></i>
            Log to Console
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
