// src/modules/department/hooks/useDepartment.js
import { useState, useEffect, useCallback } from "react";
import { departmentApi } from "../api/department.api";

export const useDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [activeDepartments, setActiveDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentApi.getAllDepartments();
      if (!response.success) {
        setError(response.error || response.message);
        setDepartments([]);
      } else {
        setDepartments(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveDepartments = useCallback(async () => {
    try {
      const response = await departmentApi.getActiveDepartments();
      if (response.success) {
        setActiveDepartments(response.data || []);
      } else {
        setActiveDepartments([]);
      }
    } catch (err) {
      setActiveDepartments([]);
    }
  }, []);

  const createDepartment = async (departmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentApi.createDepartment(departmentData);
      if (!response.success) {
        const err = response.error || response.message;
        setError(err);
        return { success: false, error: err };
      } else {
        await loadDepartments();
        return { success: true, data: response.data };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (departmentId, departmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentApi.updateDepartment(
        departmentId,
        departmentData,
      );
      if (!response.success) {
        const err = response.error || response.message;
        setError(err);
        return { success: false, error: err };
      } else {
        await loadDepartments();
        return { success: true, data: response.data };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (departmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentApi.deleteDepartment(departmentId);
      if (!response.success) {
        const err = response.error || response.message;
        setError(err);
        return { success: false, error: err };
      } else {
        await loadDepartments();
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = useCallback(async (departmentId = null) => {
    try {
      const response =
        await departmentApi.getDepartmentStatistics(departmentId);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.warn("Statistics load error:", err.message);
    }
  }, []);

  const refreshDepartments = useCallback(async () => {
    await loadDepartments();
    await loadActiveDepartments();
    await loadStatistics();
  }, [loadDepartments, loadActiveDepartments, loadStatistics]);

  useEffect(() => {
    loadDepartments();
    loadActiveDepartments();
  }, [loadDepartments, loadActiveDepartments]);

  return {
    departments,
    activeDepartments,
    statistics,
    loading,
    error,
    loadDepartments,
    loadActiveDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    loadStatistics,
    refreshDepartments,
    totalDepartments: departments.length,
    activeDepartmentsCount: activeDepartments.length,
  };
};
