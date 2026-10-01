import { useState, useEffect, useCallback } from "react";
import budgetApi from "../api/budget.api";

export const useBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalCommitted: 0,
    totalActual: 0,
    totalAvailable: 0,
    overallUtilization: 0,
    departmentsAtRisk: 0,
    activeAlerts: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("2025-2026");

  // Load budgets
  // src/modules/budget/hooks/useBudget.js - Update loadBudgets function

  const loadBudgets = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await budgetApi.getBudgets({
          ...params,
          fiscalYear: selectedFiscalYear,
        });

        if (response.success) {
          setBudgets(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setBudgets([]);
          setError(response.message);
        }
      } catch (err) {
        console.error("Error loading budgets:", err);
        setError(err.message);
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedFiscalYear],
  );

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await budgetApi.getDashboardStats(selectedFiscalYear);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  }, [selectedFiscalYear]);

  // Load active alerts
  const loadActiveAlerts = useCallback(async () => {
    try {
      const response = await budgetApi.getActiveAlerts();
      if (response.success && response.data) {
        setActiveAlerts(response.data);
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    }
  }, []);

  // Load pending transfers
  const loadPendingTransfers = useCallback(async () => {
    try {
      const response = await budgetApi.getPendingTransfers();
      if (response.success && response.data) {
        setPendingTransfers(response.data);
      }
    } catch (err) {
      console.error("Error loading pending transfers:", err);
    }
  }, []);

  // Load single budget
  const loadBudgetById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await budgetApi.getBudgetById(id);
      if (response.success && response.data) {
        setSelectedBudget(response.data);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      console.error("Error loading budget:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create budget
  const createBudget = useCallback(
    async (budgetData) => {
      try {
        setLoading(true);
        const response = await budgetApi.createBudget(budgetData);
        if (response.success) {
          await loadBudgets();
          await loadDashboardStats();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error creating budget:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadBudgets, loadDashboardStats],
  );

  // Update budget
  const updateBudget = useCallback(
    async (id, budgetData) => {
      try {
        setLoading(true);
        const response = await budgetApi.updateBudget(id, budgetData);
        if (response.success) {
          await loadBudgets();
          await loadDashboardStats();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error updating budget:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadBudgets, loadDashboardStats],
  );

  // Delete budget
  const deleteBudget = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await budgetApi.deleteBudget(id);
        if (response.success) {
          await loadBudgets();
          await loadDashboardStats();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error deleting budget:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadBudgets, loadDashboardStats],
  );

  // Submit budget
  const submitBudget = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.submitBudget(id);
        if (response.success) {
          await loadBudgets();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadBudgets],
  );

  // Approve budget
  const approveBudget = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.approveBudget(id);
        if (response.success) {
          await loadBudgets();
          await loadDashboardStats();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadBudgets, loadDashboardStats],
  );

  // Reject budget
  const rejectBudget = useCallback(
    async (id, reason) => {
      try {
        const response = await budgetApi.rejectBudget(id, reason);
        if (response.success) {
          await loadBudgets();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadBudgets],
  );

  // Freeze budget
  const freezeBudget = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.freezeBudget(id);
        if (response.success) {
          await loadBudgets();
          await loadDashboardStats();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadBudgets, loadDashboardStats],
  );

  // Request transfer
  const requestTransfer = useCallback(
    async (transferData) => {
      try {
        const response = await budgetApi.requestTransfer(transferData);
        if (response.success) {
          await loadPendingTransfers();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadPendingTransfers],
  );

  // Approve transfer
  const approveTransfer = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.approveTransfer(id);
        if (response.success) {
          await loadPendingTransfers();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadPendingTransfers],
  );

  // Execute transfer
  const executeTransfer = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.executeTransfer(id);
        if (response.success) {
          await loadPendingTransfers();
          await loadBudgets();
          await loadDashboardStats();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadPendingTransfers, loadBudgets, loadDashboardStats],
  );

  // Resolve alert
  const resolveAlert = useCallback(
    async (id) => {
      try {
        const response = await budgetApi.resolveAlert(id);
        if (response.success) {
          await loadActiveAlerts();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [loadActiveAlerts],
  );

  // Export report
  const exportReport = useCallback(async (params) => {
    try {
      return await budgetApi.exportReport(params);
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBudgets();
    loadDashboardStats();
    loadActiveAlerts();
    loadPendingTransfers();
  }, [loadBudgets, loadDashboardStats, loadActiveAlerts, loadPendingTransfers]);

  return {
    budgets,
    loading,
    error,
    stats,
    pagination,
    selectedBudget,
    activeAlerts,
    pendingTransfers,
    selectedFiscalYear,
    setSelectedFiscalYear,
    loadBudgets,
    loadDashboardStats,
    loadPendingTransfers,
    loadBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    submitBudget,
    approveBudget,
    rejectBudget,
    freezeBudget,
    requestTransfer,
    approveTransfer,
    executeTransfer,
    resolveAlert,
    exportReport,
    setSelectedBudget,
  };
};

export default useBudget;
