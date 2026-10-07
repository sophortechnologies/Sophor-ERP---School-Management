import { useState, useEffect, useCallback } from "react";
import { schoolConfigApi } from "../api";

export const useSchoolConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const result = await schoolConfigApi.getConfig();
      if (result.success) {
        setConfig(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (formData) => {
    setLoading(true);
    try {
      const result = await schoolConfigApi.updateConfig(formData);
      if (result.success) {
        setConfig(result.data);
        setError(null);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err?.message || "Failed to update configuration";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    updateConfig,
    refreshConfig: fetchConfig,
  };
};
