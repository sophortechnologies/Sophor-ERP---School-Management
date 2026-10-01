// /**
//  * Network utility functions
//  */

// export const getApiBaseUrl = () => {
//   return process.env.REACT_APP_API_URL || "http://192.168.137.42:5000";
// };

// export const isDevelopment = () => {
//   return process.env.REACT_APP_ENV === "development";
// };

// export const logApiConfig = () => {
//   if (isDevelopment()) {
//     console.log("API Configuration:", {
//       API_URL: getApiBaseUrl(),
//       NODE_ENV: process.env.NODE_ENV,
//       BUILD_ENV: process.env.REACT_APP_ENV,
//     });
//   }
// };

// // Health check function
// export const checkBackendHealth = async () => {
//   try {
//     const response = await fetch(`${getApiBaseUrl()}/api/health`);
//     return {
//       connected: response.ok,
//       status: response.status,
//       statusText: response.statusText,
//     };
//   } catch (error) {
//     return {
//       connected: false,
//       error: error.message,
//     };
//   }
// };
