import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import GramsLogo from '../components/GramsLogo';
import { verifyEmailOTP, resendEmailOTP } from '../Services/operations/authAPI';
import { toast } from 'react-hot-toast';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and name from navigation state
  const { email, name } = location.state || {};

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/register');
      return;
    }

    // Focus first input
    inputRefs.current[0]?.focus();

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastIndex = Math.min(pasteData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmailOTP(email, otpString);
      
      if (response?.success) {
        toast.success('Email verified successfully!');
        // Navigate to complete registration page
        navigate('/complete-registration', { 
          state: { email, name, verified: true } 
        });
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      const response = await resendEmailOTP(email, name);
      
      if (response?.success) {
        toast.success('New OTP sent to your email');
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        // Restart timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] mt-[60px] relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-green-50 to-yellow-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Reveal>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-green-100">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GramsLogo size={40} className="text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
              <p className="text-slate-600 text-sm">
                We've sent a 6-digit OTP to<br />
                <span className="font-semibold text-green-600">{email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                    ${digit ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                    focus:border-green-500 focus:ring-2 focus:ring-green-200`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              {!canResend ? (
                <p className="text-slate-500 text-sm">
                  Resend OTP in <span className="font-semibold text-green-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm transition"
                >
                  {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Verify OTP
                </>
              )}
            </button>

            {/* Back Link */}
            <p className="mt-6 text-center text-slate-600 text-sm">
              Wrong email?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-bold hover:underline">
                Go Back
              </Link>
            </p>

            {/* Security Notice */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-yellow-800">
                  <strong>Security Notice:</strong> Never share your OTP with anyone. GRAMS team will never ask for your OTP.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
