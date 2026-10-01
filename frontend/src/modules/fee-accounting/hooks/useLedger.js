// import { useState, useCallback } from 'react';
// import { ledgerAPI } from '../api';
// import toast from 'react-hot-toast';

// export const useLedger = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Post ledger entry
//   const postLedgerEntry = useCallback(async (entryData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.postEntry(entryData);
//       toast.success('Ledger entry posted successfully');
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to post ledger entry');
//       toast.error(err.message || 'Failed to post ledger entry');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get ledger entries
//   const getLedgerEntries = useCallback(async (params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getEntries(params);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch ledger entries');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get trial balance
//   const getTrialBalance = useCallback(async (date = new Date().toISOString().split('T')[0]) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getTrialBalance(date);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch trial balance');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get balance sheet
//   const getBalanceSheet = useCallback(async (date = new Date().toISOString().split('T')[0]) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getBalanceSheet(date);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch balance sheet');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Get income statement
//   const getIncomeStatement = useCallback(async (startDate, endDate) => {
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

//   // Get cash book
//   const getCashBook = useCallback(async (startDate, endDate) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.getCashBook(startDate, endDate);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch cash book');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Reconcile account
//   const reconcileAccount = useCallback(async (accountId, reconciliationData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.reconcileAccount(accountId, reconciliationData);
//       toast.success('Account reconciled successfully');
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to reconcile account');
//       toast.error(err.message || 'Failed to reconcile account');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Export ledger data
//   const exportLedger = useCallback(async (params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await ledgerAPI.exportLedger(params);
//       return result;
//     } catch (err) {
//       setError(err.message || 'Failed to export ledger data');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     loading,
//     error,
//     postLedgerEntry,
//     getLedgerEntries,
//     getTrialBalance,
//     getBalanceSheet,
//     getIncomeStatement,
//     getCashBook,
//     reconcileAccount,
//     exportLedger,
//   };
// };