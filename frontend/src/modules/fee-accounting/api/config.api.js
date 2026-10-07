// import { API_CONFIG, API_ENDPOINTS } from '../../../config/swagger.config';
// import axios from 'axios';

// const api = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   timeout: API_CONFIG.TIMEOUT,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Fee Configuration API
// export const configAPI = {
//   // Create fee configuration
//   createConfig: async (configData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.CONFIGS.BASE,
//         configData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get all configurations
//   getConfigs: async (params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.BASE,
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get configuration by ID
//   getConfigById: async (configId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.BY_ID(configId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get configurations by class
//   getConfigsByClass: async (classId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.BY_CLASS(classId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Update configuration
//   updateConfig: async (configId, updateData) => {
//     try {
//       const response = await api.patch(
//         API_ENDPOINTS.BILLING.CONFIGS.BY_ID(configId),
//         updateData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Delete configuration (soft delete)
//   deleteConfig: async (configId) => {
//     try {
//       const response = await api.patch(
//         API_ENDPOINTS.BILLING.CONFIGS.DEACTIVATE(configId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Activate configuration
//   activateConfig: async (configId) => {
//     try {
//       const response = await api.patch(
//         API_ENDPOINTS.BILLING.CONFIGS.ACTIVATE(configId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get active configurations
//   getActiveConfigs: async () => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.ACTIVE
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get fee categories
//   getFeeCategories: async () => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.CATEGORIES
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get academic terms
//   getAcademicTerms: async () => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.CONFIGS.TERMS
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Validate configuration
//   validateConfig: async (configData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.CONFIGS.VALIDATE,
//         configData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };