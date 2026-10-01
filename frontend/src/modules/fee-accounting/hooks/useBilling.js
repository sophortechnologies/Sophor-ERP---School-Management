// import { useState, useCallback } from 'react';
// import { billAPI, configAPI, paymentAPI } from '../api';
// import toast from 'react-hot-toast';

// export const useBilling = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Create bill
//   const createBill = useCallback(async (billData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await billAPI.createBill(billData);
//       toast.success('Bill created successfully');
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to create bill');
//       toast.error(err.message || 'Failed to create bill');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get bills
//   const getBills = useCallback(async (params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await billAPI.getBills(params);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch bills');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Update bill status
//   const updateBillStatus = useCallback(async (billId, status) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await billAPI.updateBillStatus(billId, status);
//       toast.success('Bill status updated successfully');
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to update bill status');
//       toast.error(err.message || 'Failed to update bill status');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Delete bill
//   const deleteBill = useCallback(async (billId) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await billAPI.deleteBill(billId);
//       toast.success('Bill deleted successfully');
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to delete bill');
//       toast.error(err.message || 'Failed to delete bill');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get fee categories
//   const getFeeCategories = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await configAPI.getFeeCategories();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch fee categories');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get academic terms
//   const getAcademicTerms = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await configAPI.getAcademicTerms();
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch academic terms');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Validate configuration
//   const validateConfig = useCallback(async (configData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await configAPI.validateConfig(configData);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to validate configuration');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     loading,
//     error,
//     createBill,
//     getBills,
//     updateBillStatus,
//     deleteBill,
//     getFeeCategories,
//     getAcademicTerms,
//     validateConfig,
//   };
// };