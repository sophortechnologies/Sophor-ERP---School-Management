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

// export const receiptAPI = {
//   // Generate receipt for payment
//   generateReceipt: async (paymentId) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.RECEIPTS.GENERATE,
//         { paymentId }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get receipt by ID
//   getReceiptById: async (receiptId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.RECEIPTS.BY_ID(receiptId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Print receipt
//   printReceipt: async (receiptId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.RECEIPTS.PRINT(receiptId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Email receipt
//   emailReceipt: async (receiptId, emailData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.RECEIPTS.EMAIL(receiptId),
//         emailData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Download receipt as PDF
//   downloadReceipt: async (receiptId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.RECEIPTS.DOWNLOAD(receiptId),
//         { responseType: 'blob' }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get receipts by student
//   getReceiptsByStudent: async (studentId, params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.RECEIPTS.BY_STUDENT(studentId),
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get all receipts
//   getReceipts: async (params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.RECEIPTS.BASE,
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };