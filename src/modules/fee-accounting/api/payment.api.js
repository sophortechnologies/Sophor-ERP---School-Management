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

// // Payments API
// export const paymentAPI = {
//   // Create a new payment
//   createPayment: async (paymentData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.PAYMENTS.BASE,
//         paymentData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get all payments with filters
//   getPayments: async (params = {}) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.PAYMENTS.BASE, { params });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get payment by ID
//   getPaymentById: async (paymentId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.PAYMENTS.BY_ID(paymentId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Update payment
//   updatePayment: async (paymentId, updateData) => {
//     try {
//       const response = await api.patch(
//         API_ENDPOINTS.BILLING.PAYMENTS.BY_ID(paymentId),
//         updateData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Delete payment
//   deletePayment: async (paymentId) => {
//     try {
//       const response = await api.delete(
//         API_ENDPOINTS.BILLING.PAYMENTS.BY_ID(paymentId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get payments by student
//   getPaymentsByStudent: async (studentId, params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.PAYMENTS.BY_STUDENT(studentId),
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get payment by receipt number
//   getPaymentByReceipt: async (receiptNumber) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.PAYMENTS.BY_RECEIPT(receiptNumber)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Verify payment
//   verifyPayment: async (paymentId) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.PAYMENTS.VERIFY(paymentId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Cancel payment
//   cancelPayment: async (paymentId) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.PAYMENTS.CANCEL(paymentId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get payment statistics
//   getPaymentStatistics: async (params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.PAYMENTS.STATISTICS,
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Search payments
//   searchPayments: async (searchParams) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.PAYMENTS.SEARCH,
//         searchParams
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };