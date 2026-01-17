import { toast } from "react-hot-toast"
import { apiconnector } from "../apiconnector"
import { escalationEndpoints } from "../apis"

const {
  GET_ESCALATED_GRIEVANCES_API,
  GET_ESCALATION_STATS_API,
  ESCALATE_GRIEVANCE_API,
  DE_ESCALATE_GRIEVANCE_API,
  BULK_ESCALATE_API,
} = escalationEndpoints

// Get all escalated grievances
export const getEscalatedGrievances = async (token, params = {}) => {
  const toastId = toast.loading("Loading escalated grievances...")
  try {
    const queryParams = new URLSearchParams(params).toString()
    const url = `${GET_ESCALATED_GRIEVANCES_API}${queryParams ? `?${queryParams}` : ''}`
    
    const response = await apiconnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      null
    )
    
    console.log("GET ESCALATED GRIEVANCES API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ESCALATED GRIEVANCES API ERROR............", error)
    toast.error("Could Not Fetch Escalated Grievances")
    return { data: [], stats: {} }
  } finally {
    toast.dismiss(toastId)
  }
}

// Get escalation statistics
export const getEscalationStats = async (token) => {
  try {
    const response = await apiconnector(
      "GET",
      GET_ESCALATION_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      null
    )
    
    console.log("GET ESCALATION STATS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ESCALATION STATS API ERROR............", error)
    return {}
  }
}

// Manually escalate a grievance
export const escalateGrievance = async (escalationData, token) => {
  const toastId = toast.loading("Escalating grievance...")
  try {
    const response = await apiconnector(
      "POST",
      ESCALATE_GRIEVANCE_API,
      escalationData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("ESCALATE GRIEVANCE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Grievance Escalated Successfully!")
    return response.data.data
  } catch (error) {
    console.log("ESCALATE GRIEVANCE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Escalate Grievance")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// De-escalate a grievance
export const deEscalateGrievance = async (deEscalationData, token) => {
  const toastId = toast.loading("De-escalating grievance...")
  try {
    const response = await apiconnector(
      "POST",
      DE_ESCALATE_GRIEVANCE_API,
      deEscalationData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("DE-ESCALATE GRIEVANCE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Grievance De-escalated Successfully!")
    return response.data.data
  } catch (error) {
    console.log("DE-ESCALATE GRIEVANCE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to De-escalate Grievance")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Bulk escalate grievances
export const bulkEscalateGrievances = async (bulkData, token) => {
  const toastId = toast.loading("Bulk escalating grievances...")
  try {
    const response = await apiconnector(
      "POST",
      BULK_ESCALATE_API,
      bulkData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("BULK ESCALATE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success(`Successfully Escalated ${response.data.count} Grievances!`)
    return response.data
  } catch (error) {
    console.log("BULK ESCALATE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Bulk Escalate")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}
