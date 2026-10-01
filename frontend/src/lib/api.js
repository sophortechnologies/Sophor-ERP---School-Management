//src/lib/api.js
import axios from "axios";
import { API_CONFIG } from "../config/swagger.config";

// Track if we're currently in the AuthProvider initialization phase
let isInitializing = false;

export const setInitializing = (value) => {
  isInitializing = value;
  console.log("🔧 API: Initializing flag set to:", value);
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token added to request:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No accessToken found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle nested responses and errors
api.interceptors.response.use(
  (response) => {
    console.log("🔍 API Response:", response);

    // Handle nested response structure from your backend
    // Backend returns: { data: { ... }, message: 'Success', ... }
    // Extract the nested data property
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }

    return response;
  },
  async (error) => {
    // Safe error logging
    try {
      console.error("❌ API Error Details:");
      console.error(" - Message:", error?.message);
      console.error(" - Code:", error?.code);
      console.error(" - Response status:", error?.response?.status);
      console.error(" - Response data:", error?.response?.data);
      console.error(" - URL:", error?.config?.url);
      console.error(" - Is Initializing:", isInitializing);
    } catch (loggingError) {
      console.error(
        "❌ Could not log error details - error object is malformed",
      );
    }

    const originalRequest = error.config;

    // Handle 401 errors
    // In frontend/src/lib/api.js (inside response interceptor):

    // Handle 401 errors
    // In frontend/src/lib/api.js (inside response interceptor):

    // Handle 401 errors
    // In frontend/src/lib/api.js (inside response interceptor):

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isInitializing) {
        return Promise.reject(error);
      }

      try {
        // Backend refresh-token is POST /auth/refresh-token requiring current Bearer token
        const response = await api.post("/auth/refresh-token");

        let newAccessToken =
          response.data?.access_token || response.data?.data?.access_token;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
