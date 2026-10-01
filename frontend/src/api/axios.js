//src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 20000,
});

// 🔥 FIXED: Use consistent token name
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // This is correct
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token added to request:", token.substring(0, 20) + "...");
  } else {
    console.warn("No accessToken found in localStorage");
  }
  return config;
});

// 🔥 ADD: Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(" Authentication failed - redirecting to login");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
