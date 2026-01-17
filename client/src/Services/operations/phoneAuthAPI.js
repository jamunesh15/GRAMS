import { toast } from "react-hot-toast"
import { apiconnector } from "../apiconnector"
import { phoneAuthEndpoints } from "../apis"

const {
  SEND_PHONE_OTP_API,
  VERIFY_PHONE_OTP_API,
  PHONE_LOGIN_API,
} = phoneAuthEndpoints

// Send Phone OTP
export const sendPhoneOTP = async (phoneNumber) => {
  const toastId = toast.loading("Sending OTP...")
  try {
    const response = await apiconnector("POST", SEND_PHONE_OTP_API, { phoneNumber })
    
    console.log("SEND PHONE OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("OTP sent successfully to your phone!")
    return response.data
  } catch (error) {
    console.log("SEND PHONE OTP API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to send OTP")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Verify Phone OTP
export const verifyPhoneOTP = async (phoneNumber, otp) => {
  const toastId = toast.loading("Verifying OTP...")
  try {
    const response = await apiconnector("POST", VERIFY_PHONE_OTP_API, { 
      phoneNumber, 
      otp 
    })
    
    console.log("VERIFY PHONE OTP API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("OTP verified successfully!")
    return response.data
  } catch (error) {
    console.log("VERIFY PHONE OTP API ERROR............", error)
    toast.error(error?.response?.data?.message || "Invalid OTP")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Phone Login
export const phoneLogin = async (phoneNumber, navigate) => {
  const toastId = toast.loading("Logging in...")
  try {
    const response = await apiconnector("POST", PHONE_LOGIN_API, { phoneNumber })
    
    console.log("PHONE LOGIN API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Login Successful!")
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    navigate("/dashboard")
    return response.data
  } catch (error) {
    console.log("PHONE LOGIN API ERROR............", error)
    toast.error(error?.response?.data?.message || "Phone Login Failed")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}
