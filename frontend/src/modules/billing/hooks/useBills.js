import { useState, useEffect, useCallback } from "react";
import { billsApi } from "../api/bills.api";

export const useBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billsApi.getAll();
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load student invoices.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { bills, setBills, loading, error, refreshBills: fetchBills };
};
