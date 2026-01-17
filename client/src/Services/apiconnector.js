import axios from "axios"

export const axiosInstance = axios.create({
  timeout: 120000, // 120 seconds timeout for file uploads
  validateStatus: status => status < 500 // Only throw for server errors
});

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
