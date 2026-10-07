import { useState, useEffect, useCallback } from "react";
import { holidayApi } from "../api/holiday.api";

export const useHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const data = await holidayApi.getHolidays();
      setHolidays(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const addHoliday = async (holidayData) => {
    try {
      await holidayApi.createHoliday(holidayData);
      await fetchHolidays();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to create holiday",
      };
    }
  };

  const removeHoliday = async (id) => {
    try {
      await holidayApi.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to delete holiday",
      };
    }
  };

  return {
    holidays,
    loading,
    error,
    addHoliday,
    removeHoliday,
    refreshHolidays: fetchHolidays,
  };
};
