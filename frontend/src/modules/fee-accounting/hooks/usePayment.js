// src/modules/fee-accounting/hooks/usePayment.js
import { useState } from 'react';
import { feeApi } from '../api';
import { toast } from 'react-toastify';

const mockFinancialSummary = () => ({
  todays_collection: 0,
  total_revenue: 0,
  total_outstanding: 0,
  total_students: 0,
  pending_payments: 0
});

const generateMockCollectionReport = (params) => {
  const mockTransactions = [
    {
      id: 1,
      receipt_number: 'RCPT-001',
      student_name: 'John Doe',
      fee_type: 'tuition',
      amount: 15000,
      payment_method: 'cash',
      status: 'completed',
      collected_by: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      receipt_number: 'RCPT-002',
      student_name: 'Jane Smith',
      fee_type: 'library',
      amount: 2000,
      payment_method: 'bank_transfer',
      status: 'completed',
      collected_by: 'Admin',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      receipt_number: 'RCPT-003',
      student_name: 'Bob Johnson',
      fee_type: 'tuition',
      amount: 23000,
      payment_method: 'online',
      status: 'pending',
      collected_by: 'Admin',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  if (params.start_date && params.end_date) {
    const start = new Date(params.start_date);
    const end = new Date(params.end_date);
    return mockTransactions.filter(t => {
      const date = new Date(t.created_at);
      return date >= start && date <= end;
    });
  }
  
  return mockTransactions;
};

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.createPayment(paymentData);
      toast.success('Payment recorded successfully');
      return response;
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      toast.error(err.message || 'Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPayments = async (params = {}) => {
    setLoading(true);
    try {
      const data = await feeApi.getPayments(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBillsByStudent = async (studentId) => {
    setLoading(true);
    try {
      const data = await feeApi.getBillsByStudent(studentId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err.message || 'Failed to fetch student bills');
      console.error('Error fetching student bills:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateBillStatus = async (billId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.updateBillStatus(billId, status);
      toast.success('Bill status updated successfully');
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update bill status');
      toast.error(err.message || 'Failed to update bill status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async (paymentId) => {
    setLoading(true);
    try {
      const response = await feeApi.generateReceipt(paymentId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate receipt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = async () => {
    setLoading(true);
    try {
      const data = await feeApi.getFinancialSummary();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch financial summary');
      console.error('Error fetching financial summary:', err);
      return mockFinancialSummary();
    } finally {
      setLoading(false);
    }
  };

  const getOutstandingReport = async (params = {}) => {
    setLoading(true);
    try {
      const data = await feeApi.getOutstandingReport(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err.message || 'Failed to fetch outstanding report');
      console.error('Error fetching outstanding report:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCollectionReport = async (params = {}) => {
    setLoading(true);
    try {
      const data = await feeApi.getCollectionReport(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err.message || 'Failed to fetch collection report');
      console.error('Error fetching collection report:', err);
      return generateMockCollectionReport(params);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPayment,
    getPayments,
    getBillsByStudent,
    updateBillStatus, // Make sure this is included
    generateReceipt,
    getFinancialSummary,
    getOutstandingReport,
    getCollectionReport,
  };
};