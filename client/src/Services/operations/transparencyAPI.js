import { toast } from "react-hot-toast"
import { apiconnector } from "../apiconnector"
import { transparencyEndpoints } from "../apis"

const {
  GET_REPORT_API,
  GET_OVERDUE_ISSUES_API,
  UPVOTE_ISSUE_API,
  GET_CATEGORY_STATS_API,
  GET_MONTHLY_TRENDS_API,
  GET_OFFICER_STATS_API,
  GET_BUDGET_DETAILS_API,
  EXPORT_DATA_API,
  GET_ISSUE_DETAILS_API,
} = transparencyEndpoints

// Get Transparency Report
export const getTransparencyReport = async () => {
  const toastId = toast.loading("Loading transparency report...")
  try {
    const response = await apiconnector("GET", GET_REPORT_API)
    
    console.log("GET TRANSPARENCY REPORT API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET TRANSPARENCY REPORT API ERROR............", error)
    toast.error("Could Not Fetch Transparency Report")
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

// Get Overdue Issues
export const getOverdueIssues = async (params = {}) => {
  const toastId = toast.loading("Loading overdue issues...")
  try {
    const response = await apiconnector("GET", GET_OVERDUE_ISSUES_API, null, null, params)
    
    console.log("GET OVERDUE ISSUES API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET OVERDUE ISSUES API ERROR............", error)
    toast.error("Could Not Fetch Overdue Issues")
    return []
  } finally {
    toast.dismiss(toastId)
  }
}

// Upvote Issue
export const upvoteIssue = async (id, token) => {
  try {
    const response = await apiconnector(
      "POST",
      `${UPVOTE_ISSUE_API}/${id}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("UPVOTE ISSUE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    // Don't show toast here - handled by component with custom animation
    return response.data.data
  } catch (error) {
    console.log("UPVOTE ISSUE API ERROR............", error)
    // Don't show toast here - handled by component
    throw error
  }
}

// Get Category Stats
export const getCategoryStats = async () => {
  try {
    const response = await apiconnector("GET", GET_CATEGORY_STATS_API)
    
    console.log("GET CATEGORY STATS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET CATEGORY STATS API ERROR............", error)
    toast.error("Could Not Fetch Category Statistics")
    return []
  }
}

// Get Monthly Trends
export const getMonthlyTrends = async (months = 6) => {
  try {
    const response = await apiconnector(
      "GET",
      GET_MONTHLY_TRENDS_API,
      null,
      null,
      { months }
    )
    
    console.log("GET MONTHLY TRENDS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET MONTHLY TRENDS API ERROR............", error)
    toast.error("Could Not Fetch Monthly Trends")
    return []
  }
}

// Get Officer Stats
export const getOfficerStats = async () => {
  try {
    const response = await apiconnector("GET", GET_OFFICER_STATS_API)
    
    console.log("GET OFFICER STATS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET OFFICER STATS API ERROR............", error)
    toast.error("Could Not Fetch Officer Statistics")
    return []
  }
}

// Get Budget Details
export const getBudgetDetails = async () => {
  try {
    const response = await apiconnector("GET", GET_BUDGET_DETAILS_API)
    
    console.log("GET BUDGET DETAILS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET BUDGET DETAILS API ERROR............", error)
    toast.error("Could Not Fetch Budget Details")
    return null
  }
}

// Export Data
export const exportData = async (params = {}) => {
  const toastId = toast.loading("Exporting data...")
  try {
    const response = await apiconnector("GET", EXPORT_DATA_API, null, null, params)
    
    console.log("EXPORT DATA API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Data exported successfully!")
    return response.data.data
  } catch (error) {
    console.log("EXPORT DATA API ERROR............", error)
    toast.error("Failed to export data")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get Issue Details
export const getIssueDetails = async (id, token) => {
  const toastId = toast.loading("Loading issue details...")
  try {
    const response = await apiconnector(
      "GET",
      `${GET_ISSUE_DETAILS_API}/${id}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("GET ISSUE DETAILS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ISSUE DETAILS API ERROR............", error)
    toast.error("Could Not Fetch Issue Details")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}
