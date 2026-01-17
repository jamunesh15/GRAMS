import { toast } from "react-hot-toast"
import { apiconnector } from "../apiconnector"
import { budgetEndpoints } from "../apis"

const {
  GET_BUDGET_OVERVIEW_API,
  GET_BUDGET_TRENDS_API,
  UPDATE_GRIEVANCE_BUDGET_API,
  ADD_EXPENSE_API,
  GET_CURRENT_SYSTEM_BUDGET,
  GET_ALL_SYSTEM_BUDGETS,
  CREATE_SYSTEM_BUDGET,
  ACTIVATE_SYSTEM_BUDGET,
  GET_SYSTEM_BUDGET_STATS,
  ADD_ENGINEER_SALARY,
  UPDATE_ENGINEER_SALARY,
  GET_PENDING_SALARY_INFO,
  PROCESS_MONTHLY_SALARY,
  UPDATE_CATEGORY_BUDGET,
  APPROVE_GRIEVANCE_BUDGET,
  GET_PUBLIC_SYSTEM_BUDGET,
} = budgetEndpoints

// Get Budget Overview
export const getBudgetOverview = async () => {
  try {
    const response = await apiconnector("GET", GET_BUDGET_OVERVIEW_API)
    
    console.log("GET BUDGET OVERVIEW API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET BUDGET OVERVIEW API ERROR............", error)
    toast.error("Could Not Fetch Budget Overview")
    return null
  }
}

// Get Budget Trends
export const getBudgetTrends = async (months = 6) => {
  try {
    const response = await apiconnector(
      "GET",
      GET_BUDGET_TRENDS_API,
      null,
      null,
      { months }
    )
    
    console.log("GET BUDGET TRENDS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET BUDGET TRENDS API ERROR............", error)
    toast.error("Could Not Fetch Budget Trends")
    return {}
  }
}

// Update Grievance Budget (Admin/Engineer only)
export const updateGrievanceBudget = async (id, budgetData, token) => {
  const toastId = toast.loading("Updating budget...")
  try {
    const response = await apiconnector(
      "PUT",
      `${UPDATE_GRIEVANCE_BUDGET_API}/${id}`,
      budgetData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("UPDATE BUDGET API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Budget Updated Successfully!")
    return response.data.data
  } catch (error) {
    console.log("UPDATE BUDGET API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Update Budget")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Add Expense to Grievance (Admin/Engineer only)
export const addExpense = async (id, expenseData, token) => {
  const toastId = toast.loading("Adding expense...")
  try {
    const response = await apiconnector(
      "POST",
      `${ADD_EXPENSE_API}/${id}/expense`,
      expenseData,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    console.log("ADD EXPENSE API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Expense Added Successfully!")
    return response.data.data
  } catch (error) {
    console.log("ADD EXPENSE API ERROR............", error)
    toast.error(error?.response?.data?.message || "Failed to Add Expense")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// ============ SYSTEM BUDGET FUNCTIONS ============

// Get Current System Budget
export async function getCurrentSystemBudget(token) {
  try {
    const response = await apiconnector('GET', GET_CURRENT_SYSTEM_BUDGET, null, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("GET CURRENT SYSTEM BUDGET API RESPONSE............", response);
    return response;
  } catch (error) {
    console.log("GET CURRENT SYSTEM BUDGET API ERROR............", error);
    toast.error("Could Not Fetch Current Budget");
    throw error;
  }
}

// Get All System Budgets
export async function getAllSystemBudgets(token) {
  try {
    const response = await apiconnector('GET', GET_ALL_SYSTEM_BUDGETS, null, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("GET ALL SYSTEM BUDGETS API RESPONSE............", response);
    return response;
  } catch (error) {
    console.log("GET ALL SYSTEM BUDGETS API ERROR............", error);
    toast.error("Could Not Fetch Budgets");
    throw error;
  }
}

// Get System Budget Stats
export async function getSystemBudgetStats(token) {
  try {
    const response = await apiconnector('GET', GET_SYSTEM_BUDGET_STATS, null, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("GET SYSTEM BUDGET STATS API RESPONSE............", response);
    return response;
  } catch (error) {
    console.log("GET SYSTEM BUDGET STATS API ERROR............", error);
    toast.error("Could Not Fetch Budget Stats");
    throw error;
  }
}

// Create System Budget
export async function createSystemBudget(token, budgetData) {
  const toastId = toast.loading("Creating budget...");
  try {
    const response = await apiconnector('POST', CREATE_SYSTEM_BUDGET, budgetData, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("CREATE SYSTEM BUDGET API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Budget Created Successfully!");
    return response;
  } catch (error) {
    console.log("CREATE SYSTEM BUDGET API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Create Budget");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}

// Activate System Budget
export async function activateSystemBudget(token, budgetId) {
  const toastId = toast.loading("Activating budget...");
  try {
    const response = await apiconnector('PUT', ACTIVATE_SYSTEM_BUDGET(budgetId), null, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("ACTIVATE SYSTEM BUDGET API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Budget Activated Successfully!");
    return response;
  } catch (error) {
    console.log("ACTIVATE SYSTEM BUDGET API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Activate Budget");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}

// Add Engineer Salary
export async function addEngineerSalary(token, salaryData) {
  const toastId = toast.loading("Adding engineer salary...");
  try {
    const response = await apiconnector('POST', ADD_ENGINEER_SALARY, salaryData, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("ADD ENGINEER SALARY API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Engineer Salary Added Successfully!");
    return response;
  } catch (error) {
    console.log("ADD ENGINEER SALARY API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Add Salary");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}

// Update Engineer Salary
export async function updateEngineerSalary(token, engineerId, updateData) {
  const toastId = toast.loading("Updating engineer salary...");
  try {
    const response = await apiconnector('PUT', UPDATE_ENGINEER_SALARY(engineerId), updateData, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("UPDATE ENGINEER SALARY API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Engineer Salary Updated Successfully!");
    return response;
  } catch (error) {
    console.log("UPDATE ENGINEER SALARY API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Update Salary");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}

// Update Category Budget
export async function updateCategoryBudget(token, category, allocated) {
  const toastId = toast.loading("Updating category budget...");
  try {
    const response = await apiconnector('PUT', UPDATE_CATEGORY_BUDGET(category), { allocated }, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("UPDATE CATEGORY BUDGET API RESPONSE............", response);
    
    toast.dismiss(toastId);
    
    if (response?.data?.success) {
      toast.success("Category Budget Updated Successfully!");
      return response;
    } else {
      throw new Error(response?.data?.message || "Update failed");
    }
  } catch (error) {
    console.log("UPDATE CATEGORY BUDGET API ERROR............", error);
    toast.dismiss(toastId);
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to update category budget";
    toast.error(errorMessage);
    throw error;
  }
}

// Approve Grievance Budget
export async function approveGrievanceBudget(token, grievanceId, budgetData) {
  const toastId = toast.loading("Approving budget...");
  try {
    const response = await apiconnector('PUT', APPROVE_GRIEVANCE_BUDGET(grievanceId), budgetData, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("APPROVE GRIEVANCE BUDGET API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Budget Approved Successfully!");
    return response;
  } catch (error) {
    console.log("APPROVE GRIEVANCE BUDGET API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Approve Budget");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}

// Get Public System Budget
export async function getPublicSystemBudget() {
  try {
    const response = await apiconnector('GET', GET_PUBLIC_SYSTEM_BUDGET, null, {});
    
    console.log("GET PUBLIC SYSTEM BUDGET API RESPONSE............", response);
    return response;
  } catch (error) {
    console.log("GET PUBLIC SYSTEM BUDGET API ERROR............", error);
    toast.error("Could Not Fetch Public Budget");
    throw error;
  }
}

// Get Pending Salary Information
export async function getPendingSalaryInfo(token) {
  try {
    const response = await apiconnector('GET', GET_PENDING_SALARY_INFO, null, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("GET PENDING SALARY INFO API RESPONSE............", response);
    return response;
  } catch (error) {
    console.log("GET PENDING SALARY INFO API ERROR............", error);
    toast.error("Could Not Fetch Salary Information");
    throw error;
  }
}

// Process Monthly Salary
export async function processMonthlySalary(token, salaryData) {
  const toastId = toast.loading("Processing salaries...");
  try {
    const response = await apiconnector('POST', PROCESS_MONTHLY_SALARY, salaryData, {
      Authorization: `Bearer ${token}`,
    });
    
    console.log("PROCESS MONTHLY SALARY API RESPONSE............", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success("Salaries Processed Successfully! Emails sent to engineers.");
    return response;
  } catch (error) {
    console.log("PROCESS MONTHLY SALARY API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to Process Salaries");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}
