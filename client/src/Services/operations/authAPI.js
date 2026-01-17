import { toast } from "react-hot-toast"
import { apiconnector } from "../apiconnector"
import { authEndpoints } from "../apis"
import useAuthStore from "../../store/authStore"

const {
  REGISTER_API,
  LOGIN_API,
  LOGOUT_API,
  GET_ME_API,
  UPDATE_PROFILE_API,
  SEND_OTP_API,
  VERIFY_OTP_API,
  GOOGLE_LOGIN_API,
  MICROSOFT_LOGIN_API,
  SEND_EMAIL_OTP_API,
  VERIFY_EMAIL_OTP_API,
  COMPLETE_REGISTRATION_API,
  RESEND_EMAIL_OTP_API,
  FORGOT_PASSWORD_API,
  VERIFY_RESET_OTP_API,
  RESET_PASSWORD_API,
  RESEND_RESET_OTP_API,
} = authEndpoints



// Register User
export const register = async (userData, navigate) => {
  const toastId = toast.loading("Creating your account...")
  try {
    const response = await apiconnector("POST", REGISTER_API, userData)
    
    console.log("REGISTER API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Registration Successful! Please login.")
    navigate("/login")
  } catch (error) {
    console.log("REGISTER API ERROR............", error)
    toast.error(error?.response?.data?.message || "Registration Failed")
  } finally {
    toast.dismiss(toastId)
  }
}

// Login User
export const login = async (credentials, navigate) => {
  const toastId = toast.loading("Logging in...")
  try {
    const response = await apiconnector("POST", LOGIN_API, credentials)
    
    console.log("LOGIN API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    const userRole = response.data.user.role;
    toast.success(`Login Successful! Welcome ${userRole === 'admin' ? 'Admin' : userRole === 'engineer' ? 'Engineer' : 'User'}`)
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Redirect based on role
    if (userRole === 'admin') {
      navigate("/admin")
    } else if (userRole === 'engineer') {
      navigate("/engineer-dashboard")
    } else {
      navigate("/dashboard")
    }
    
    return response.data
  } catch (error) {
    console.log("LOGIN API ERROR............", error)
    toast.error(error?.response?.data?.message || "Login Failed")
  } finally {
    toast.dismiss(toastId)
  }
}

// Get User Profile
export const getUserProfile = async (token) => {
  try {
    const response = await apiconnector("GET", GET_ME_API, null, {
      Authorization: `Bearer ${token}`
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    
    return response.data.user
  } catch (error) {
    console.log("GET USER PROFILE ERROR............", error)
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
    }
    throw error
  }
}

// Update User Profile
export const updateUserProfile = async (profileData, token) => {
  const toastId = toast.loading("Updating profile...")
  try {
    console.log('========== UPDATE PROFILE REQUEST ==========');
    console.log('Input profileData:', profileData);
    
    const updateData = {};
    
    // Append text fields
    if (profileData.name) updateData.name = profileData.name;
    if (profileData.email) updateData.email = profileData.email;
    if (profileData.phone) updateData.phone = profileData.phone;
    
    console.log('Update data before image upload:', updateData);

    // Handle profile image upload to Cloudinary directly (unsigned)
    if (profileData.profileImage) {
      try {
        console.log("Uploading image to Cloudinary unsigned...");
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', profileData.profileImage);
        cloudinaryFormData.append('upload_preset', 'grams-unsigned');
        cloudinaryFormData.append('folder', 'grams/profile-images');

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/grams/image/upload`,
          {
            method: 'POST',
            body: cloudinaryFormData
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error(`Cloudinary upload failed with status ${cloudinaryResponse.status}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        console.log("Cloudinary upload successful:", cloudinaryData);
        
        updateData.profileImageUrl = cloudinaryData.secure_url;
        updateData.profileImagePublicId = cloudinaryData.public_id;
        console.log('Image URLs added to updateData:', {
          url: updateData.profileImageUrl,
          publicId: updateData.profileImagePublicId
        });
      } catch (imageError) {
        console.warn("Image upload warning (continuing without image):", imageError.message);
        toast.info("Profile updated but image upload failed. Try again later.");
        // Continue with profile update even if image fails
      }
    }
    
    console.log('Final update data to send to server:', updateData);
    
    const response = await apiconnector("PUT", UPDATE_PROFILE_API, updateData, {
      Authorization: `Bearer ${token}`
    })
    
    console.log('Server response:', response);
    
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    
    console.log('Profile update successful. Updated user:', response.data.user);
    toast.success("Profile updated successfully!")
    return response.data
  } catch (error) {
    console.log("UPDATE PROFILE ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to update profile")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get User Grievances
export const getUserGrievances = async (token) => {
  try {
    const response = await apiconnector("GET", `${import.meta.env.VITE_BASE_URL}/grievances/my-grievances`, null, {
      Authorization: `Bearer ${token}`
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    
    return response.data.grievances
  } catch (error) {
    console.log("GET USER GRIEVANCES ERROR............", error)
    throw error
  }
}

// Request Grievance Cancellation
export const requestGrievanceCancellation = async (cancelData, token) => {
  const toastId = toast.loading("Submitting cancellation request...")
  try {
    const response = await apiconnector("POST", `${import.meta.env.VITE_BASE_URL}/grievances/request-cancellation`, cancelData, {
      Authorization: `Bearer ${token}`
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    
    toast.dismiss(toastId)
    return response.data
  } catch (error) {
    console.log("REQUEST CANCELLATION ERROR............", error)
    toast.dismiss(toastId)
    throw error
  }
}

// Google Sign Up (Register with Google)
export const googleSignUp = async (googleData, navigate) => {
  const toastId = toast.loading("Creating your account with Google...")
  try {
    const response = await apiconnector("POST", GOOGLE_LOGIN_API, googleData)
    
    console.log("GOOGLE SIGNUP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Registration Successful!")
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Update authStore
    useAuthStore.getState().setToken(response.data.token)
    useAuthStore.getState().setUser(response.data.user)
    
    // Navigate after state is updated
    setTimeout(() => navigate("/dashboard"), 100)
    return response.data
  } catch (error) {
    console.log("GOOGLE SIGNUP API ERROR............", error)
    toast.error(error?.response?.data?.message || "Google Sign-up Failed")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Google Login
export const googleLogin = async (googleData, navigate) => {
  const toastId = toast.loading("Logging in with Google...")
  try {
    const response = await apiconnector("POST", GOOGLE_LOGIN_API, googleData)
    
    console.log("GOOGLE LOGIN API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Login Successful!")
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Update authStore
    useAuthStore.getState().setToken(response.data.token)
    useAuthStore.getState().setUser(response.data.user)
    
    // Navigate after state is updated
    setTimeout(() => navigate("/dashboard"), 100)
    return response.data
  } catch (error) {
    console.log("GOOGLE LOGIN API ERROR............", error)
    toast.error(error?.response?.data?.message || "Google Login Failed")
  } finally {
    toast.dismiss(toastId)
  }
}

// Microsoft Login
export const microsoftLogin = async (microsoftData, navigate) => {
  const toastId = toast.loading("Logging in with Microsoft...")
  try {
    const response = await apiconnector("POST", MICROSOFT_LOGIN_API, microsoftData)
    
    console.log("MICROSOFT LOGIN API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Login Successful!")
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Update authStore
    useAuthStore.getState().setToken(response.data.token)
    useAuthStore.getState().setUser(response.data.user)
    
    // Navigate after state is updated
    setTimeout(() => navigate("/dashboard"), 100)
    return response.data
  } catch (error) {
    console.log("MICROSOFT LOGIN API ERROR............", error)
    toast.error(error?.response?.data?.message || "Microsoft Login Failed")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Send OTP
export const sendOTP = async (phoneNumber) => {
  const toastId = toast.loading("Sending OTP...")
  try {
    const response = await apiconnector("POST", SEND_OTP_API, { phone: phoneNumber })
    
    console.log("SEND OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("OTP sent successfully!")
    return response.data
  } catch (error) {
    console.log("SEND OTP API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to send OTP")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Verify OTP
export const verifyOTP = async (phoneNumber, otp, navigate) => {
  const toastId = toast.loading("Verifying OTP...")
  try {
    const response = await apiconnector("POST", VERIFY_OTP_API, { phone: phoneNumber, otp })
    
    console.log("VERIFY OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("OTP verified successfully!")
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Update authStore
    useAuthStore.getState().setToken(response.data.token)
    useAuthStore.getState().setUser(response.data.user)
    
    // Navigate after state is updated
    setTimeout(() => navigate("/dashboard"), 100)
    return response.data
  } catch (error) {
    console.log("VERIFY OTP API ERROR............", error)
    toast.error(error?.response?.data?.message || "Invalid OTP")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get User Details
export const getUserDetails = async (token) => {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiconnector("GET", GET_ME_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET USER DETAILS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.user
  } catch (error) {
    console.log("GET USER DETAILS API ERROR............", error)
    toast.error("Could Not Get User Details")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Logout
export const logout = (navigate) => {
  return async () => {
    try {
      await apiconnector("POST", LOGOUT_API)
      
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      toast.success("Logged Out Successfully")
      navigate("/login")
    } catch (error) {
      console.log("LOGOUT API ERROR............", error)
      toast.error("Logout Failed")
    }
  }
}
// Send Email OTP for Registration
export const sendEmailOTP = async (email, name) => {
  try {
    const response = await apiconnector("POST", SEND_EMAIL_OTP_API, { email, name })
    
    console.log("SEND EMAIL OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("SEND EMAIL OTP API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Failed to send OTP"
    throw new Error(errorMessage)
  }
}

// Verify Email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await apiconnector("POST", VERIFY_EMAIL_OTP_API, { email, otp })
    
    console.log("VERIFY EMAIL OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("VERIFY EMAIL OTP API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "OTP verification failed"
    throw new Error(errorMessage)
  }
}

// Complete Registration after OTP verification
export const completeRegistration = async (userData) => {
  const toastId = toast.loading("Creating your account...")
  try {
    const response = await apiconnector("POST", COMPLETE_REGISTRATION_API, userData)
    
    console.log("COMPLETE REGISTRATION API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.dismiss(toastId)
    return response.data
  } catch (error) {
    console.log("COMPLETE REGISTRATION API ERROR............", error)
    toast.dismiss(toastId)
    const errorMessage = error?.response?.data?.message || "Registration failed"
    throw new Error(errorMessage)
  }
}

// Resend Email OTP
export const resendEmailOTP = async (email, name) => {
  try {
    const response = await apiconnector("POST", RESEND_EMAIL_OTP_API, { email, name })
    
    console.log("RESEND EMAIL OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("RESEND EMAIL OTP API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Failed to resend OTP"
    throw new Error(errorMessage)
  }
}

// Forgot Password
export const forgotPassword = async (email) => {
  const toastId = toast.loading("Sending password reset email...")
  try {
    const response = await apiconnector("POST", FORGOT_PASSWORD_API, { email })
    
    console.log("FORGOT PASSWORD API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Password reset OTP sent to your email!")
    return response.data
  } catch (error) {
    console.log("FORGOT PASSWORD API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Failed to send reset email"
    toast.error(errorMessage)
    throw new Error(errorMessage)
  } finally {
    toast.dismiss(toastId)
  }
}

// Verify Reset OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await apiconnector("POST", VERIFY_RESET_OTP_API, { email, otp })
    
    console.log("VERIFY RESET OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("OTP verified successfully!")
    return response.data
  } catch (error) {
    console.log("VERIFY RESET OTP API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Invalid OTP"
    toast.error(errorMessage)
    throw new Error(errorMessage)
  }
}

// Reset Password
export const resetPassword = async (email, password, navigate) => {
  const toastId = toast.loading("Resetting password...")
  try {
    const response = await apiconnector("POST", RESET_PASSWORD_API, { email, password })
    
    console.log("RESET PASSWORD API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Password reset successfully! Please login.")
    navigate("/login")
    return response.data
  } catch (error) {
    console.log("RESET PASSWORD API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Failed to reset password"
    toast.error(errorMessage)
    throw new Error(errorMessage)
  } finally {
    toast.dismiss(toastId)
  }
}

// Resend Reset OTP
export const resendResetOTP = async (email) => {
  try {
    const response = await apiconnector("POST", RESEND_RESET_OTP_API, { email })
    
    console.log("RESEND RESET OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("RESEND RESET OTP API ERROR............", error)
    const errorMessage = error?.response?.data?.message || "Failed to resend OTP"
    throw new Error(errorMessage)
  }
}