import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../Services/operations/authAPI';
import Reveal from '../components/Reveal';
import GramsLogo from '../components/GramsLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result?.success) {
        // Navigate to reset password page with email
        navigate('/reset-password', { state: { email } });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
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
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100 p-8">
          {/* Logo */}
          <Reveal delay={0.05}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <GramsLogo size={40} className="text-white" />
              </div>
            </div>
          </Reveal>

          {/* Header */}
          <Reveal delay={0.1}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
              <p className="text-slate-600 text-sm">
                Enter your email and we'll send you an OTP to reset your password
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.15}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <svg className="w-5 h-5 absolute left-4 top-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition font-medium"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    Send Reset Code
                  </>
                )}
              </button>
            </form>
          </Reveal>

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
