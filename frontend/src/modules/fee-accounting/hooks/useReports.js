// import { useState, useCallback } from 'react';
// import { ledgerAPI, paymentAPI, billAPI } from '../api';
// import toast from 'react-hot-toast';

// export const useReports = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Get daily collection report
//   const getDailyCollectionReport = useCallback(async (date) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}/billing/reports/daily-collection?date=${date}`
//       );
//       const result = await response.json();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch daily collection report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get monthly collection report
//   const getMonthlyCollectionReport = useCallback(async (month, year) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}/billing/reports/monthly-collection?month=${month}&year=${year}`
//       );
//       const result = await response.json();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch monthly collection report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get outstanding report
//   const getOutstandingReport = useCallback(async (params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await billAPI.getOutstandingBills(params);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch outstanding report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get fee category wise report
//   const getFeeCategoryWiseReport = useCallback(async (startDate, endDate) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}/billing/reports/category-wise?startDate=${startDate}&endDate=${endDate}`
//       );
//       const result = await response.json();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch category wise report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get student ledger
//   const getStudentLedger = useCallback(async (studentId) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}/billing/reports/student/${studentId}/ledger`
//       );
//       const result = await response.json();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch student ledger');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get cash flow report
//   const getCashFlowReport = useCallback(async (startDate, endDate) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getCashBook(startDate, endDate);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch cash flow report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get income statement
//   const getIncomeStatementReport = useCallback(async (startDate, endDate) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getIncomeStatement(startDate, endDate);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch income statement');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Export report
//   const exportReport = useCallback(async (reportType, params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}/billing/reports/export/${reportType}?${new URLSearchParams(params)}`
//       );
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//       toast.success('Report exported successfully');
//     } catch (err) {
//       setError(err.message || 'Failed to export report');
//       toast.error(err.message || 'Failed to export report');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     loading,
//     error,
//     getDailyCollectionReport,
//     getMonthlyCollectionReport,
//     getOutstandingReport,
//     getFeeCategoryWiseReport,
//     getStudentLedger,
//     getCashFlowReport,
//     getIncomeStatementReport,
//     exportReport,
//   };
// };