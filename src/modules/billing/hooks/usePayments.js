import { useState, useEffect, useCallback } from "react";
import { paymentsApi } from "../api/payments.api";

export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentsApi.getAll();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load payment transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    setPayments,
    loading,
    error,
    refreshPayments: fetchPayments,
  };
};
