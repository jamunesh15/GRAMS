import { toast } from "react-hot-toast"
import axios from "axios"
import { apiconnector } from "../apiconnector"
import { adminEndpoints } from "../apis"

const {
  GET_DASHBOARD_STATS_API,
  GET_ALL_USERS_API,
  GET_ALL_GRIEVANCES_ADMIN_API,
  GET_ENGINEERS_API,
  GET_COMPLETED_TASKS_API,
  ASSIGN_GRIEVANCE_API,
  CONFIRM_TASK_API,
  CONFIRM_ALL_TASKS_API,
  UPDATE_USER_ROLE_API,
  UPDATE_GRIEVANCE_STATUS_API,
} = adminEndpoints

// Get Dashboard Statistics
export const getDashboardStats = async (token) => {
  const toastId = toast.loading("Loading dashboard stats...")
  try {
    const response = await apiconnector("GET", GET_DASHBOARD_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    }, null)
    
    console.log("GET DASHBOARD STATS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET DASHBOARD STATS API ERROR............", error)
    toast.error("Could Not Fetch Dashboard Statistics")
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

// Get All Users (Admin)
export const getAllUsers = async (token) => {
  const toastId = toast.loading("Loading users...")
  try {
    const response = await apiconnector("GET", GET_ALL_USERS_API, null, {
      Authorization: `Bearer ${token}`,
    }, null)
    
    console.log("GET ALL USERS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ALL USERS API ERROR............", error)
    toast.error("Could Not Fetch Users")
    return []
  } finally {
    toast.dismiss(toastId)
  }
}

// Get All Grievances (Admin)
export const getAllGrievancesAdmin = async (token, params = {}) => {
  const toastId = toast.loading("Loading grievances...")
  try {
    const response = await apiconnector(
      "GET",
      GET_ALL_GRIEVANCES_ADMIN_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      params
    )
    
    console.log("GET ALL GRIEVANCES ADMIN API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ALL GRIEVANCES ADMIN API ERROR............", error)
    toast.error("Could Not Fetch Grievances")
    return []
  } finally {
    toast.dismiss(toastId)
  }
}

// Assign Grievance
export const assignGrievance = async (assignData, token) => {
  const toastId = toast.loading("Assigning grievance...")
  try {
    const response = await apiconnector(
      "POST",
      ASSIGN_GRIEVANCE_API,
      assignData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("ASSIGN GRIEVANCE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Grievance Assigned Successfully!")
    return response.data.data
  } catch (error) {
    console.log("ASSIGN GRIEVANCE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Assign Grievance")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Update User Role
export const updateUserRole = async (roleData, token) => {
  const toastId = toast.loading("Updating user role...")
  try {
    const response = await apiconnector(
      "PUT",
      UPDATE_USER_ROLE_API,
      roleData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("UPDATE USER ROLE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("User Role Updated Successfully!")
    return response.data.data
  } catch (error) {
    console.log("UPDATE USER ROLE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Update User Role")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get Engineers
export const getEngineers = async (token) => {
  try {
    const response = await apiconnector("GET", GET_ENGINEERS_API, null, {
      Authorization: `Bearer ${token}`,
    }, null)
    
    console.log("GET ENGINEERS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ENGINEERS API ERROR............", error)
    toast.error("Could Not Fetch Engineers")
    return []
  }
}

// Update Grievance Status
export const updateGrievanceStatus = async (statusData, token) => {
  const toastId = toast.loading("Updating grievance status...")
  try {
    const response = await apiconnector(
      "PUT",
      UPDATE_GRIEVANCE_STATUS_API,
      statusData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("UPDATE GRIEVANCE STATUS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Grievance Status Updated Successfully!")
    return response.data.data
  } catch (error) {
    console.log("UPDATE GRIEVANCE STATUS API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Update Status")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get All Completed Tasks by Engineers
export const getCompletedTasksByEngineers = async (token) => {
  try {
    const response = await axios.get(GET_COMPLETED_TASKS_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    console.log("GET COMPLETED TASKS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    console.log("GET COMPLETED TASKS API ERROR............", error)
    toast.error("Could Not Fetch Completed Tasks")
    throw error
  }
}

// Admin Confirm/Update Completed Task Status
export const confirmCompletedTask = async (token, taskData) => {
  const toastId = toast.loading("Updating task status...")
  try {
    const response = await axios.post(CONFIRM_TASK_API, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    console.log("CONFIRM TASK API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Task Status Updated Successfully!")
    return response.data
  } catch (error) {
    console.log("CONFIRM TASK API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Update Task Status")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Admin Confirm All Completed Tasks
export const confirmAllCompletedTasks = async (token, adminNotes = '') => {
  const toastId = toast.loading("Confirming all tasks...")
  try {
    const response = await axios.post(CONFIRM_ALL_TASKS_API, { adminNotes }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    console.log("CONFIRM ALL TASKS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    const { confirmed, total, totalBudgetReturned, totalBudgetSpent } = response.data.data;
    toast.success(`Successfully confirmed ${confirmed}/${total} tasks! ₹${totalBudgetReturned?.toLocaleString() || 0} returned to budget.`)
    return response.data
  } catch (error) {
    console.log("CONFIRM ALL TASKS API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Confirm All Tasks")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}
