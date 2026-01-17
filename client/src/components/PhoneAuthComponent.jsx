import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '../config/firebaseConfig';
import { apiconnector } from '../Services/apiconnector';
import { phoneAuthEndpoints } from '../Services/apis';
import { toast } from 'react-hot-toast';

const PhoneAuthComponent = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [step, setStep] = useState('phone'); // phone, otp, details
  const [phoneNumber, setPhoneNumber] = useState('+91'); // Include country code
  const [otp, setOtp] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    setupRecaptcha('recaptcha-container');
  }, []);

  // Handle phone number input
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Ensure it starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/\D/g, '').slice(-10);
    }
    setPhoneNumber(value);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number
      if (phoneNumber.length < 13) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      await sendPhoneOTP(phoneNumber);
      setMessage('OTP sent successfully! Check your phone.');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      console.error('Send OTP Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const result = await verifyPhoneOTP(otp);
      setFirebaseUser(result.user);
      setMessage('OTP verified! Now enter your details.');
      setStep('details');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      console.error('Verify OTP Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create/Update user account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userDetails.name.trim() || !userDetails.email.trim()) {
        throw new Error('Please fill in all fields');
      }

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Send to backend to create/update user
      const response = await apiconnector(
        'POST',
        phoneAuthEndpoints.SEND_PHONE_OTP_API.replace('/send-otp', '/phone-register'),
        {
          name: userDetails.name,
          email: userDetails.email,
          phone: phoneNumber,
          idToken: idToken, // Firebase ID token for verification
        }
      );

      // Save auth token and user info
      if (response.data?.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setMessage('Account created successfully!');
        toast.success('Account created successfully!');
      }

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create account. Please try again.'
      );
      console.error('Create Account Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render Phone Input Step
  if (step === 'phone') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Phone Authentication</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+911234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91 for India)</p>
          </div>

          <div id="recaptcha-container" className="flex justify-center my-4"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    );
  }

  // Render OTP Input Step
  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              We've sent a 6-digit OTP to {phoneNumber}
            </p>
            <label className="block text-sm font-medium mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp('');
              setMessage('');
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Back to Phone
          </button>
        </form>
      </div>
    );
  }

  // Render User Details Step
  if (step === 'details') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> {phoneNumber}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    );
  }
};

export default PhoneAuthComponent;
