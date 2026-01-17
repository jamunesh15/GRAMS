import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyResetOTP, resetPassword, resendResetOTP } from '../Services/operations/authAPI';
import { toast } from 'react-hot-toast';
import Reveal from '../components/Reveal';
import GramsLogo from '../components/GramsLogo';

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error('Please request password reset first');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyResetOTP(email, otpString);
      setOtpVerified(true);
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, password, navigate);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const result = await resendResetOTP(email);
      if (result?.success) {
        toast.success('New OTP sent to your email!');
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!email) return null;

  return (
    <section className="min-h-[calc(100vh-64px)] mt-[60px] relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-green-50 to-yellow-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100 p-8">
          {/* Logo */}
          <Reveal delay={0.05}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <GramsLogo size={40} className="text-white" />
              </div>
            </div>
          </Reveal>

          {!otpVerified ? (
            <>
              {/* OTP Verification */}
              <Reveal delay={0.1}>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Enter OTP</h1>
                  <p className="text-slate-600 text-sm">
                    We've sent a 6-digit code to<br />
                    <span className="font-semibold text-green-600">{email}</span>
                  </p>
                  <p className="text-xs text-red-600 mt-2">⏰ Valid for 10 minutes</p>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mb-8">
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="mt-6 text-center">
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      className="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Resend code in <span className="font-bold text-green-600">{resendTimer}s</span>
                    </p>
                  )}
                </div>
              </Reveal>
            </>
          ) : (
            <>
              {/* New Password Form */}
              <Reveal delay={0.1}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Password</h1>
                  <p className="text-slate-600 text-sm">
                    Your password must be at least 8 characters
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-4 top-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      </svg>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition font-medium"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-4 top-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      </svg>
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 disabled:opacity-50"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              </Reveal>
            </>
          )}

          {/* Back to Login */}
          <Reveal delay={0.2}>
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center justify-center gap-2 hover:underline"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Back to Login
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
