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

// export const paymentGatewayAPI = {
//   // Get all payment gateways
//   getGateways: async () => {
//     try {
//       const response = await api.get(API_ENDPOINTS.BILLING.GATEWAYS.BASE);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get gateway by ID
//   getGatewayById: async (gatewayId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.GATEWAYS.BY_ID(gatewayId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get active gateways
//   getActiveGateways: async () => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.GATEWAYS.ACTIVE
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Configure gateway
//   configureGateway: async (gatewayId, configData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.GATEWAYS.CONFIGURE(gatewayId),
//         configData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Test gateway connection
//   testGateway: async (gatewayId) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.GATEWAYS.TEST(gatewayId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Initiate online payment
//   initiatePayment: async (paymentData) => {
//     try {
//       const response = await api.post(
//         `${API_CONFIG.BASE_URL}/billing/payments/online/initiate`,
//         paymentData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Verify online payment
//   verifyPayment: async (paymentId, gatewayResponse) => {
//     try {
//       const response = await api.post(
//         `${API_CONFIG.BASE_URL}/billing/payments/online/verify`,
//         { paymentId, gatewayResponse }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get payment status
//   getPaymentStatus: async (transactionId) => {
//     try {
//       const response = await api.get(
//         `${API_CONFIG.BASE_URL}/billing/payments/online/status/${transactionId}`
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };