import { useState, useEffect, useCallback } from "react";
import { billConfigApi } from "../api/billConfig.api";

export const useBillConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billConfigApi.getAll();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load fee configurations.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { configs, setConfigs, loading, error, refreshConfigs: fetchConfigs };
};
