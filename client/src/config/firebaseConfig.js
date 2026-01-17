import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAvzxM7nP7ys-W_nxf7WqdnLyxYmSDBKGg",
  authDomain: "grams-auth.firebaseapp.com",
  projectId: "grams-auth",
  storageBucket: "grams-auth.firebasestorage.app",
  messagingSenderId: "748565551290",
  appId: "1:748565551290:web:a43f0eb0694fdd51ec8a83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure reCAPTCHA
export const setupRecaptcha = (containerId) => {
  // Check if container exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`reCAPTCHA container with id '${containerId}' not found`);  
    return;
  }

  // Clear existing verifier
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: 'normal',
      callback: (response) => {
        console.log('✅ reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.log('⚠️ reCAPTCHA expired');
      },
    }, auth);
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    throw error;
  }
};

// Send OTP
export const sendPhoneOTP = async (phoneNumber) => {
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    console.log('🔹 Starting Google Sign-In...');
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Google Sign-In successful:', result);
    
    const user = result.user;
    const idToken = await user.getIdToken();
    
    return {
      idToken,
      user: {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid
      }
    };
  } catch (error) {
    console.error('❌ Google Sign-In Error:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    
    // Provide user-friendly error messages
    let userMessage = 'Google login failed. Please try again.';
    if (error.code === 'auth/unauthorized-domain') {
      userMessage = 'This domain is not authorized for Google Sign-In. Please contact admin.';
    } else if (error.code === 'auth/popup-blocked') {
      userMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      userMessage = 'Sign-in was cancelled.';
    }
    
    const customError = new Error(userMessage);
    customError.code = error.code;
    throw customError;
  }
};

// Verify OTP
export const verifyPhoneOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('Confirmation result not found. Please request OTP first.');
    }
    const result = await window.confirmationResult.confirm(otp);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  } 
};

export default app;
