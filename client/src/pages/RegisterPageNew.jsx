import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Reveal from '../components/Reveal';
import MotionImage from '../components/MotionImage';
import GramsLogo from '../components/GramsLogo';
import { register, googleSignUp, sendEmailOTP } from '../Services/operations/authAPI';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { toast } from 'react-hot-toast';

export default function RegisterPageNew() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const googleData = {
        name: user.displayName || '',
        email: user.email,
        phone: user.phoneNumber || '',
        googleId: user.uid,
        profilePicture: user.photoURL || '',
      };

      await googleSignUp(googleData, navigate);
    } catch (err) {
      console.error('Google Sign-up error:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-in is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method > Google');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-up cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        setError(err.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send OTP to email
      const response = await sendEmailOTP(formData.email, formData.name);

      if (response?.success) {
        toast.success('OTP sent to your email!');
        // Navigate to OTP verification page
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            name: formData.name 
          } 
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] mt-[60px] relative overflow-hidden flex items-center justify-center py-4 sm:py-8 lg:py-12 px-3 sm:px-4">
      
      {/* Background with Nature Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-green-50 to-yellow-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Welcome Section */}
            <div className="lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
              
              {/* Decorative Blurs */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-lime-400 rounded-full blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                {/* Logo */}
                <Reveal delay={0.05}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                      <GramsLogo size={36} className="text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-3xl tracking-tight">GRAMS</h1>
                      <p className="text-xs text-green-100 uppercase tracking-wider font-semibold">Nexus TechSol</p>
                    </div>
                  </div>
                </Reveal>

                {/* Welcome Text */}
                <Reveal delay={0.1}>
                  <div className="mb-6 sm:mb-8 lg:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">Join Us Today</h2>
                    <p className="text-green-100 text-xs sm:text-sm leading-relaxed max-w-md">
                      Create your account to report, track, and resolve civic grievances efficiently.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Image with overlay */}
                <div className="relative h-32 sm:h-40 lg:h-44 mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-600/80 to-transparent rounded-xl sm:rounded-2xl z-10"></div>
                  <MotionImage
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=250&fit=crop&auto=format" 
                    alt="Join GRAMS" 
                    className="rounded-xl sm:rounded-2xl w-full h-full object-cover shadow-lg border-2 sm:border-4 border-white/20"
                    hoverScale={1.03}
                  />
                  <Reveal className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 text-white" delay={0.12}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-bold">Join 12,000+ Citizens</span>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-white/30">
                        Fast & Secure
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-white/30">
                        Privacy Protected
                      </div>
                    </div>
                  </Reveal>
                </div>

              {/* Features Section */}
              <Reveal delay={0.15}>
                <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-1 sm:mb-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white mb-0.5 sm:mb-1">Easy Filing</h4>
                    <p className="text-[9px] sm:text-[10px] text-green-200">Submit complaints in minutes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-400/20 rounded-lg flex items-center justify-center mb-1 sm:mb-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white mb-0.5 sm:mb-1">Track Status</h4>
                    <p className="text-[9px] sm:text-[10px] text-green-200">Real-time updates</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mb-1 sm:mb-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white mb-0.5 sm:mb-1">Community</h4>
                    <p className="text-[9px] sm:text-[10px] text-green-200">Join fellow citizens</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-400/20 rounded-lg flex items-center justify-center mb-1 sm:mb-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white mb-0.5 sm:mb-1">Transparency</h4>
                    <p className="text-[9px] sm:text-[10px] text-green-200">View public data</p>
                  </div>
                </div>
              </Reveal>

              {/* Footer */}
              <div className="relative z-10 mt-auto pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 text-xs text-green-200 flex-wrap">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-green-300"></div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                    </svg>
                    <span>Encrypted</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-green-300"></div>
                  <span>© 2025 Nexus TechSol</span>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="lg:w-1/2 p-5 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <Reveal delay={0.05}>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Create Account</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mb-4 sm:mb-6">Fill in your details to get started</p>
                </Reveal>

                {/* Google Sign-up Button */}
                <Reveal delay={0.08}>
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing up...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </Reveal>

                {/* Info Box for Google Setup */}
                {error && error.includes('not-allowed') && (
                  <Reveal delay={0.09}>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-xs">
                      <p className="font-semibold mb-2">ℹ️ Google Sign-In Setup Required</p>
                      <p>Google Sign-In needs to be enabled in Firebase Console:</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Go to Firebase Console → Authentication</li>
                        <li>Click "Sign-in method" tab</li>
                        <li>Find "Google" and click it</li>
                        <li>Toggle to "Enabled" (blue)</li>
                        <li>Click "SAVE"</li>
                        <li>Hard refresh this page (Ctrl+Shift+R)</li>
                      </ol>
                      <p className="mt-2 font-semibold">See GOOGLE_SIGNIN_ENABLE.md for detailed steps</p>
                    </div>
                  </Reveal>
                )}

                {/* Divider */}
                <Reveal delay={0.10}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs text-gray-500 font-semibold">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                </Reveal>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-600 uppercase mb-2">Full Name</label>
                    <div className="relative">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-3 sm:top-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <input 
                        id="name"
                        name="name"
                        type="text" 
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition font-medium text-slate-800" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase mb-2">Email Address</label>
                    <div className="relative">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-3 sm:top-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition font-medium text-slate-800" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-blue-800">
                        We'll send a verification code to your email. After verification, you'll create your password.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        Send Verification Code
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-slate-600 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-bold hover:underline">
                    Sign In
                  </Link>
                </p>

                <p className="mt-4 text-xs text-slate-400 text-center">
                  By signing up you agree to our{' '}
                  <a href="#" className="text-green-600 hover:underline">
                    Terms & Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </section>
  );
}
