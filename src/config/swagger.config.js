/**
 * Swagger API Configuration
 */
export const SWAGGER_CONFIG = {
  // Your Swagger/OpenAPI specification URL
  SPEC_URL:
    process.env.REACT_APP_SWAGGER_SPEC_URL || "http://localhost:3000/api-json",

  // Base API URL
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3000",

  // API version
  API_VERSION: "v1",

  // Request timeout
  TIMEOUT: 10000,
};

export const SWAGGER_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  GET_CURRENT_USER: "/auth/me",

  // Students
  STUDENTS: "/students",
  STUDENT_BY_ID: (id) => `/students/${id}`,

  // Attendance
  ATTENDANCE: "/attendance",
  MARK_ATTENDANCE: "/attendance/mark",

  // Add more endpoints as needed
};
