import axios from "axios"

export const axiosInstance = axios.create({
  timeout: 120000, // 120 seconds timeout for file uploads
  validateStatus: status => status < 500 // Only throw for server errors
});

// Add request interceptor to automatically include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 401 Unauthorized - Token may be invalid or expired');
      // Optionally clear token and redirect to login
      // This can help debug token issues
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔐 Token exists but request failed with 401');
        console.log('🔐 Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('🔐 No token found in localStorage');
      }
    }
    return Promise.reject(error);
  }
);

export const apiconnector = (method, url, bodyData, headers, params) => {
  // Handle headers based on data type
  let combinedHeaders = headers;
  
  if (bodyData) {
    if (bodyData instanceof FormData) {
      // For FormData, don't set Content-Type - let browser set it with boundary
      console.log("FormData detected - letting browser set Content-Type with boundary");
      combinedHeaders = { ...headers };
    } else {
      // For regular JSON data
      combinedHeaders = { ...headers, "Content-Type": "application/json" };
    }
  }
    
  // Log request details in development
  console.log(`API Request: ${method} ${url}`);
  if (bodyData) {
    if (bodyData instanceof FormData) {
      console.log("Request data: FormData with entries:");
      for (let [key, value] of bodyData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }
    } else {
      console.log("Request data:", bodyData);
    }
  }
  
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null, 
    headers: combinedHeaders,
    params: params ? params : null,
  }).catch(error => {
    // Improved error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Response Error:", {
        status: error.response.status,
        data: error.response.data,
        endpoint: url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", {
        request: error.request,
        endpoint: url
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Setup Error:", error.message);
    }
    throw error;
  });
}
