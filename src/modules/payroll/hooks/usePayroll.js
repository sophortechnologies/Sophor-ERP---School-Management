import { useState, useEffect, useCallback } from "react";
import { payrollApi } from "../api/payroll.api";
import { PAYROLL_STATUS } from "../constants";

export const usePayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayrollData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollApi.getPayrolls();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load payroll history records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  return {
    payrolls,
    setPayrolls,
    loading,
    error,
    PAYROLL_STATUS,
    refreshPayroll: fetchPayrollData,
  };
};

export default usePayroll;
