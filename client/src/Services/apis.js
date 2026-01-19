const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://grams-lyart.vercel.app/api"

// AUTH ENDPOINTS
export const authEndpoints = {
  REGISTER_API: BASE_URL + "/auth/register",
  LOGIN_API: BASE_URL + "/auth/login",
  LOGOUT_API: BASE_URL + "/auth/logout",
  GET_ME_API: BASE_URL + "/auth/me",
  UPDATE_PROFILE_API: BASE_URL + "/auth/update-profile",
  SEND_OTP_API: BASE_URL + "/auth/send-otp",
  VERIFY_OTP_API: BASE_URL + "/auth/verify-otp",
  GOOGLE_LOGIN_API: BASE_URL + "/auth/google-login",
  MICROSOFT_LOGIN_API: BASE_URL + "/auth/microsoft-login",
  // Email OTP Endpoints
  SEND_EMAIL_OTP_API: BASE_URL + "/auth/send-email-otp",
  VERIFY_EMAIL_OTP_API: BASE_URL + "/auth/verify-email-otp",
  COMPLETE_REGISTRATION_API: BASE_URL + "/auth/complete-registration",
  RESEND_EMAIL_OTP_API: BASE_URL + "/auth/resend-email-otp",
  // Forgot Password Endpoints
  FORGOT_PASSWORD_API: BASE_URL + "/auth/forgot-password",
  VERIFY_RESET_OTP_API: BASE_URL + "/auth/verify-reset-otp",
  RESET_PASSWORD_API: BASE_URL + "/auth/reset-password",
  RESEND_RESET_OTP_API: BASE_URL + "/auth/resend-reset-otp",
}

// GRIEVANCE ENDPOINTS
export const grievanceEndpoints = {
  GET_ALL_GRIEVANCES_API: BASE_URL + "/grievances/all",
  GET_USER_GRIEVANCES_API: BASE_URL + "/grievances",
  GET_GRIEVANCE_BY_ID_API: BASE_URL + "/grievances", // append /:id
  CREATE_GRIEVANCE_API: BASE_URL + "/grievances",
  UPDATE_GRIEVANCE_API: BASE_URL + "/grievances", // append /:id
  DELETE_GRIEVANCE_API: BASE_URL + "/grievances", // append /:id
  ADD_COMMENT_API: BASE_URL + "/grievances", // append /:id/comment
  UPVOTE_GRIEVANCE_API: BASE_URL + "/grievances", // append /:id/upvote
  TRACK_BY_ID_API: BASE_URL + "/grievances/track/id", // append /:trackingId
  TRACK_BY_EMAIL_API: BASE_URL + "/grievances/track/email", // append /:email
}

// TRANSPARENCY ENDPOINTS
export const transparencyEndpoints = {
  GET_REPORT_API: BASE_URL + "/transparency/report",
  GET_OVERDUE_ISSUES_API: BASE_URL + "/transparency/overdue",
  UPVOTE_ISSUE_API: BASE_URL + "/transparency/upvote", // append /:id
  GET_CATEGORY_STATS_API: BASE_URL + "/transparency/categories",
  GET_MONTHLY_TRENDS_API: BASE_URL + "/transparency/trends",
  GET_OFFICER_STATS_API: BASE_URL + "/transparency/officers",
  GET_BUDGET_DETAILS_API: BASE_URL + "/transparency/budget",
  EXPORT_DATA_API: BASE_URL + "/transparency/export",
  GET_ISSUE_DETAILS_API: BASE_URL + "/transparency/issue", // append /:id
}

// ADMIN ENDPOINTS
export const adminEndpoints = {
  GET_DASHBOARD_STATS_API: BASE_URL + "/admin/dashboard",
  GET_ALL_USERS_API: BASE_URL + "/admin/users",
  GET_ALL_GRIEVANCES_ADMIN_API: BASE_URL + "/admin/grievances",
  GET_ENGINEERS_API: BASE_URL + "/admin/engineers",
  GET_COMPLETED_TASKS_API: BASE_URL + "/admin/completed-tasks",
  ASSIGN_GRIEVANCE_API: BASE_URL + "/admin/assign-grievance",
  CONFIRM_TASK_API: BASE_URL + "/admin/confirm-task",
  CONFIRM_ALL_TASKS_API: BASE_URL + "/admin/confirm-all-tasks",
  UPDATE_USER_ROLE_API: BASE_URL + "/admin/user-role",
  UPDATE_GRIEVANCE_STATUS_API: BASE_URL + "/admin/grievance-status",
}

// PHONE AUTH ENDPOINTS
export const phoneAuthEndpoints = {
  SEND_PHONE_OTP_API: BASE_URL + "/phone/send-otp",
  VERIFY_PHONE_OTP_API: BASE_URL + "/phone/verify-otp",
  PHONE_LOGIN_API: BASE_URL + "/phone/login",
}

// BUDGET ENDPOINTS
export const budgetEndpoints = {
  GET_BUDGET_OVERVIEW_API: BASE_URL + "/budget/overview",
  GET_BUDGET_TRENDS_API: BASE_URL + "/budget/trends",
  UPDATE_GRIEVANCE_BUDGET_API: BASE_URL + "/budget", // append /:id
  ADD_EXPENSE_API: BASE_URL + "/budget", // append /:id/expense
  // System Budget Endpoints
  GET_CURRENT_SYSTEM_BUDGET: BASE_URL + "/budget/system/current",
  GET_ALL_SYSTEM_BUDGETS: BASE_URL + "/budget/system/all",
  CREATE_SYSTEM_BUDGET: BASE_URL + "/budget/system/create",
  ACTIVATE_SYSTEM_BUDGET: (id) => BASE_URL + `/budget/system/${id}/activate`,
  GET_SYSTEM_BUDGET_STATS: BASE_URL + "/budget/system/stats",
  ADD_ENGINEER_SALARY: BASE_URL + "/budget/system/salary/add",
  UPDATE_ENGINEER_SALARY: (engineerId) => BASE_URL + `/budget/system/salary/${engineerId}`,
  GET_PENDING_SALARY_INFO: BASE_URL + "/budget/system/salary/pending",
  PROCESS_MONTHLY_SALARY: BASE_URL + "/budget/system/salary/process",
  UPDATE_CATEGORY_BUDGET: (category) => BASE_URL + `/budget/system/category/${category}`,
  APPROVE_GRIEVANCE_BUDGET: (grievanceId) => BASE_URL + `/budget/grievance/${grievanceId}/approve`,
  GET_PUBLIC_SYSTEM_BUDGET: BASE_URL + "/budget/system/public",
}

// RESOURCE REQUEST ENDPOINTS
export const resourceRequestEndpoints = {
  CREATE_RESOURCE_REQUEST: BASE_URL + "/resource-request/create",
  GET_ALL_RESOURCE_REQUESTS: BASE_URL + "/resource-request/all",
  GET_PENDING_REQUESTS: BASE_URL + "/resource-request/pending",
  GET_MY_REQUESTS: BASE_URL + "/resource-request/my-requests",
  GET_RESOURCE_REQUEST_BY_ID: (id) => BASE_URL + `/resource-request/${id}`,
  APPROVE_RESOURCE_REQUEST: (id) => BASE_URL + `/resource-request/${id}/approve`,
  REJECT_RESOURCE_REQUEST: (id) => BASE_URL + `/resource-request/${id}/reject`,
  MARK_AS_DELIVERED: (id) => BASE_URL + `/resource-request/${id}/deliver`,
  GET_REQUEST_STATS: BASE_URL + "/resource-request/stats",
  GET_ALLOCATED_RESOURCES: BASE_URL + "/resource-request/allocated",
  REFETCH_AMOUNT: (id) => BASE_URL + `/resource-request/${id}/refetch`,
}
// ESCALATION ENDPOINTS
export const escalationEndpoints = {
  GET_ESCALATED_GRIEVANCES_API: BASE_URL + "/escalations/grievances",
  GET_ESCALATION_STATS_API: BASE_URL + "/escalations/stats",
  ESCALATE_GRIEVANCE_API: BASE_URL + "/escalations/escalate",
  DE_ESCALATE_GRIEVANCE_API: BASE_URL + "/escalations/de-escalate",
  BULK_ESCALATE_API: BASE_URL + "/escalations/bulk-escalate",
}

// ENGINEER ENDPOINTS
export const engineerEndpoints = {
  CREATE_ENGINEER_API: BASE_URL + "/engineers/create",
  GET_ALL_ENGINEERS_API: BASE_URL + "/engineers/all",
  GET_ENGINEER_STATS_API: BASE_URL + "/engineers/stats",
  GET_ENGINEER_BY_ID_API: BASE_URL + "/engineers", // append /:id
  UPDATE_ENGINEER_API: BASE_URL + "/engineers", // append /:id
  DELETE_ENGINEER_API: BASE_URL + "/engineers", // append /:id
  ASSIGN_GRIEVANCE_API: BASE_URL + "/engineers/assign",
  UNASSIGN_GRIEVANCE_API: BASE_URL + "/engineers/unassign",
  SEND_MESSAGE_API: BASE_URL + "/engineers/message",
  // Engineer Dashboard Endpoints
  GET_MY_ASSIGNED_GRIEVANCES_API: BASE_URL + "/engineers/my-grievances",
  GET_ENGINEER_DASHBOARD_STATS_API: BASE_URL + "/engineers/dashboard-stats",
  GET_GRIEVANCE_DETAILS_API: BASE_URL + "/engineers/grievance", // append /:id
  START_WORK_API: BASE_URL + "/engineers/start-work",
  COMPLETE_TASK_API: BASE_URL + "/engineers/complete-task",
  UPLOAD_TO_CLOUDINARY_API: BASE_URL + "/engineers/upload-to-cloudinary",
  SUBMIT_SUPPORT_REQUEST_API: BASE_URL + "/engineers/support-request",
}

// WARD MAP ENDPOINTS
export const wardMapEndpoints = {
  GET_WARD_MAP_DATA_API: BASE_URL + "/ward-map/overview",
  GET_WARD_DETAILS_API: BASE_URL + "/ward-map/ward", // append /:wardNumber
  GET_GEOJSON_DATA_API: BASE_URL + "/ward-map/geojson",
  GET_WARD_TRENDS_API: BASE_URL + "/ward-map/trends",
}

// ANALYTICS ENDPOINTS
export const analyticsEndpoints = {
  GET_RESOLUTION_TIME_API: BASE_URL + "/analytics/resolution-time",
  GET_ENGINEER_PERFORMANCE_API: BASE_URL + "/analytics/engineer-performance",
  GET_STATUS_ANALYSIS_API: BASE_URL + "/analytics/status-analysis",
  GET_CITIZEN_ANALYTICS_API: BASE_URL + "/analytics/citizen-analytics",
  GET_AREA_ANALYSIS_API: BASE_URL + "/analytics/area-analysis",
  GET_BACKLOG_ANALYSIS_API: BASE_URL + "/analytics/backlog-analysis",
}

// REPORTS ENDPOINTS
export const reportEndpoints = {
  GENERATE_REPORT_API: BASE_URL + "/reports/generate",
  GET_REPORT_HISTORY_API: BASE_URL + "/reports/history",
  GET_RECENT_REPORTS_API: BASE_URL + "/reports/recent",
  DOWNLOAD_REPORT_API: BASE_URL + "/reports/download", // append ?period=weekly
  DOWNLOAD_REPORT_FILE_API: BASE_URL + "/reports/download-file", // append /:filename
  GET_REPORT_PREVIEW_API: BASE_URL + "/reports/preview",
}


