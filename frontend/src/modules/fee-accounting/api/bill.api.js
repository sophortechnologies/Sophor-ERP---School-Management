// import { API_CONFIG, API_ENDPOINTS } from '../../../config/swagger.config';
// import axios from 'axios';

// const api = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   timeout: API_CONFIG.TIMEOUT,
// });

// // Request interceptor for adding token
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

// // Bills/Invoices API
// export const billAPI = {
//   // Create a new bill
//   createBill: async (billData) => {
//     try {
//       const response = await api.post(API_ENDPOINTS.BILLING.BILLS.BASE, billData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get all bills with filters
//   getBills: async (params = {}) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.BILLS.BASE, { params });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get bill by ID
//   getBillById: async (billId) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.BILLS.BY_ID(billId));
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get bills by student
//   getBillsByStudent: async (studentId) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.BILLS.BY_STUDENT(studentId));
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Update bill status
//   updateBillStatus: async (billId, status) => {
//     try {
//       const response = await api.patch(
//         API_ENDPOINTS.BILLING.BILLS.STATUS(billId),
//         { status }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Delete bill
//   deleteBill: async (billId) => {
//     try {
//       const response = await api.delete(API_ENDPOINTS.BILLING.BILLS.BY_ID(billId));
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Generate bulk bills
//   generateBulkBills: async (billData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.BILLS.BULK_GENERATE,
//         billData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get outstanding bills
//   getOutstandingBills: async (params = {}) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.BILLS.OUTSTANDING, { params });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get overdue bills
//   getOverdueBills: async (params = {}) => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.BILLS.OVERDUE, { params });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Send reminder for bill
//   sendBillReminder: async (billId) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.BILLS.SEND_REMINDER(billId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get bill summary for student
//   getBillSummary: async (studentId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.BILLS.SUMMARY(studentId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };