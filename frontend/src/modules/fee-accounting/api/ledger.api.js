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

// export const ledgerAPI = {
//   // Post ledger entry
//   postEntry: async (entryData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.LEDGER.POST,
//         entryData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get ledger entries
//   getEntries: async (params = {}) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.BASE,
//         { params }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get ledger entry by ID
//   getEntryById: async (entryId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.ENTRY(entryId)
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get trial balance
//   getTrialBalance: async (date) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.TRIAL_BALANCE,
//         { params: { date } }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get balance sheet
//   getBalanceSheet: async (date) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.BALANCE_SHEET,
//         { params: { date } }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get income statement
//   getIncomeStatement: async (startDate, endDate) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.INCOME_STATEMENT,
//         { params: { startDate, endDate } }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get cash book
//   getCashBook: async (startDate, endDate) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.CASH_BOOK,
//         { params: { startDate, endDate } }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Get bank book
//   getBankBook: async (startDate, endDate, accountId) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.BILLING.LEDGER.BANK_BOOK,
//         { params: { startDate, endDate, accountId } }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Reconcile account
//   reconcileAccount: async (accountId, reconciliationData) => {
//     try {
//       const response = await api.post(
//         API_ENDPOINTS.BILLING.LEDGER.RECONCILE,
//         { accountId, ...reconciliationData }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Export ledger data
//   exportLedger: async (params = {}) => {
//     try {
//       const response = await api.get(
//         `${API_CONFIG.BASE_URL}/billing/ledger/export`,
//         { params, responseType: 'blob' }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };