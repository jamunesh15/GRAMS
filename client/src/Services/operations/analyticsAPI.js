import { apiconnector } from "../apiconnector";
import { analyticsEndpoints } from "../apis";

const {
  GET_RESOLUTION_TIME_API,
  GET_ENGINEER_PERFORMANCE_API,
  GET_STATUS_ANALYSIS_API,
  GET_CITIZEN_ANALYTICS_API,
  GET_AREA_ANALYSIS_API,
  GET_BACKLOG_ANALYSIS_API,
} = analyticsEndpoints;

export const getResolutionTimeAnalytics = async (token = null, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${GET_RESOLUTION_TIME_API}?${queryString}` : GET_RESOLUTION_TIME_API;
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiconnector("GET", url, null, headers);
    return response;
  } catch (error) {
    console.error("GET_RESOLUTION_TIME_API Error:", error);
    throw error;
  }
};

export const getEngineerPerformance = async (token) => {
  try {
    const response = await apiconnector("GET", GET_ENGINEER_PERFORMANCE_API, null, {
      Authorization: `Bearer ${token}`,
    });
    return response;
  } catch (error) {
    console.error("GET_ENGINEER_PERFORMANCE_API Error:", error);
    throw error;
  }
};

export const getStatusAnalysis = async (token = null, days = 30) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiconnector(
      "GET",
      `${GET_STATUS_ANALYSIS_API}?days=${days}`,
      null,
      headers
    );
    return response;
  } catch (error) {
    console.error("GET_STATUS_ANALYSIS_API Error:", error);
    throw error;
  }
};

export const getCitizenAnalytics = async (token) => {
  try {
    const response = await apiconnector("GET", GET_CITIZEN_ANALYTICS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    return response;
  } catch (error) {
    console.error("GET_CITIZEN_ANALYTICS_API Error:", error);
    throw error;
  }
};

export const getAreaAnalysis = async (token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiconnector("GET", GET_AREA_ANALYSIS_API, null, headers);
    return response;
  } catch (error) {
    console.error("GET_AREA_ANALYSIS_API Error:", error);
    throw error;
  }
};

export const getBacklogAnalysis = async (token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiconnector("GET", GET_BACKLOG_ANALYSIS_API, null, headers);
    return response;
  } catch (error) {
    console.error("GET_BACKLOG_ANALYSIS_API Error:", error);
    throw error;
  }
};
