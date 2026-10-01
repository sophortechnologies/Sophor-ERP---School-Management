import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const budgetApi = {
  // ==================== BUDGET CRUD ====================

  // src/modules/budget/api/budget.api.js

  getBudgets: async (params = {}) => {
    try {
      // Transform pagination params to match backend expectation
      const apiParams = {};

      // Map frontend params to backend params
      if (params.page) apiParams.page = params.page;
      if (params.page_size) apiParams.limit = params.page_size; // Change page_size to limit
      if (params.limit) apiParams.limit = params.limit;
      if (params.search) apiParams.search = params.search;
      if (params.category) apiParams.category = params.category;
      if (params.status) apiParams.status = params.status;
      if (params.departmentId) apiParams.departmentId = params.departmentId;
      if (params.fiscalYear) apiParams.fiscalYear = params.fiscalYear;

      console.log("📊 Fetching budgets with params:", apiParams);

      const response = await api.get(API_ENDPOINTS.BUDGET.BASE, {
        params: apiParams,
      });

      console.log("✅ Budgets response:", response.data);

      // Handle different response structures
      let budgetsData = [];
      let paginationData = {};

      if (response.data) {
        // Check if response has data property
        if (response.data.data && Array.isArray(response.data.data)) {
          budgetsData = response.data.data;
          paginationData = {
            currentPage: response.data.current_page || response.data.page || 1,
            totalPages:
              response.data.total_pages || response.data.totalPages || 1,
            totalItems: response.data.count || response.data.total || 0,
            pageSize: response.data.page_size || response.data.limit || 10,
          };
        } else if (Array.isArray(response.data)) {
          budgetsData = response.data;
          paginationData = {
            currentPage: 1,
            totalPages: 1,
            totalItems: budgetsData.length,
            pageSize: budgetsData.length,
          };
        } else {
          budgetsData = [];
        }
      }

      return {
        success: true,
        data: budgetsData,
        pagination: paginationData,
        message: "Budgets fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching budgets:", error);
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10,
        },
        message: error.response?.data?.message || "Failed to fetch budgets",
      };
    }
  },

  getBudgetById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.BY_ID(id));
      return {
        success: true,
        data: response.data,
        message: "Budget fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching budget:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch budget",
      };
    }
  },

  createBudget: async (budgetData) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.BASE, budgetData);
      return {
        success: true,
        data: response.data,
        message: "Budget created successfully",
      };
    } catch (error) {
      console.error("Error creating budget:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create budget",
      };
    }
  },

  updateBudget: async (id, budgetData) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.BUDGET.BY_ID(id),
        budgetData,
      );
      return {
        success: true,
        data: response.data,
        message: "Budget updated successfully",
      };
    } catch (error) {
      console.error("Error updating budget:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update budget",
      };
    }
  },

  deleteBudget: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.BUDGET.BY_ID(id));
      return {
        success: true,
        data: response.data,
        message: "Budget deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting budget:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete budget",
      };
    }
  },

  // ==================== BUDGET WORKFLOW ====================

  submitBudget: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.SUBMIT(id));
      return {
        success: true,
        data: response.data,
        message: "Budget submitted for approval",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit budget",
      };
    }
  },

  approveBudget: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.APPROVE(id));
      return {
        success: true,
        data: response.data,
        message: "Budget approved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve budget",
      };
    }
  },

  rejectBudget: async (id, reason) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.REJECT(id), {
        reason,
      });
      return {
        success: true,
        data: response.data,
        message: "Budget rejected",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject budget",
      };
    }
  },

  freezeBudget: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.FREEZE(id));
      return {
        success: true,
        data: response.data,
        message: "Budget frozen",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to freeze budget",
      };
    }
  },
  // Add to budget.api.js

  unfreezeBudget: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.UNFREEZE(id));
      return {
        success: true,
        data: response.data,
        message: "Budget unfrozen",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unfreeze budget",
      };
    }
  },
  // ==================== DASHBOARD & REPORTS ====================

  getDashboardStats: async (fiscalYear) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.DASHBOARD, {
        params: { fiscalYear },
      });
      return {
        success: true,
        data: response.data,
        message: "Dashboard stats fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch dashboard stats",
      };
    }
  },

  getDepartmentSummary: async (departmentId, fiscalYear) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.BUDGET.DEPARTMENT_SUMMARY(departmentId),
        {
          params: { fiscalYear },
        },
      );
      return {
        success: true,
        data: response.data,
        message: "Department summary fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch department summary",
      };
    }
  },

  getBudgetUtilization: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.UTILIZATION(id));
      return {
        success: true,
        data: response.data,
        message: "Utilization data fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch utilization",
      };
    }
  },

  getVarianceReport: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.VARIANCE(id));
      return {
        success: true,
        data: response.data,
        message: "Variance report fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch variance report",
      };
    }
  },

  // ==================== BUDGET TRANSFERS ====================

  requestTransfer: async (transferData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.BUDGET.REQUEST_TRANSFER,
        transferData,
      );
      return {
        success: true,
        data: response.data,
        message: "Transfer request submitted",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to request transfer",
      };
    }
  },

  approveTransfer: async (id) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.BUDGET.APPROVE_TRANSFER(id),
      );
      return {
        success: true,
        data: response.data,
        message: "Transfer approved",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve transfer",
      };
    }
  },

  executeTransfer: async (id) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.BUDGET.EXECUTE_TRANSFER(id),
      );
      return {
        success: true,
        data: response.data,
        message: "Transfer executed",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to execute transfer",
      };
    }
  },
  rejectTransfer: async (id, reason) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.BUDGET.REJECT_TRANSFER(id),
        { reason },
      );
      return {
        success: true,
        data: response.data,
        message: "Transfer rejected",
      };
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject transfer",
      };
    }
  },
  deleteTransfer: async (id) => {
    try {
      const response = await api.delete(`/budget/transfers/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Transfer deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting transfer:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete transfer",
      };
    }
  },

  // Also update deleteTransfer to use the config
  deleteTransfer: async (id) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.BUDGET.DELETE_TRANSFER(id),
      );
      return {
        success: true,
        data: response.data,
        message: "Transfer deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting transfer:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete transfer",
      };
    }
  },
  getPendingTransfers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.PENDING_TRANSFERS);
      return {
        success: true,
        data: response.data,
        message: "Pending transfers fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch pending transfers",
      };
    }
  },

  // ==================== BUDGET ALERTS ====================
  // Add to budget.api.js
  getAllTransfers: async () => {
    try {
      const response = await api.get("/budget/transfers/all");
      console.log("🔍 Raw getAllTransfers response:", response.data);

      // Handle different response structures
      let transfersData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          transfersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          transfersData = response.data.data;
        } else if (
          response.data.transfers &&
          Array.isArray(response.data.transfers)
        ) {
          transfersData = response.data.transfers;
        }
      }

      console.log("✅ Extracted transfers:", transfersData.length);

      return {
        success: true,
        data: transfersData,
        message: "All transfers fetched",
      };
    } catch (error) {
      console.error("Error fetching all transfers:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch transfers",
      };
    }
  },
  getActiveAlerts: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.ACTIVE_ALERTS);
      return {
        success: true,
        data: response.data,
        message: "Active alerts fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch alerts",
      };
    }
  },

  resolveAlert: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGET.RESOLVE_ALERT(id));
      return {
        success: true,
        data: response.data,
        message: "Alert resolved",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resolve alert",
      };
    }
  },

  // ==================== BUDGET CONTROL ====================

  checkAvailability: async (budgetId, amount) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.BUDGET.CHECK_AVAILABILITY(budgetId),
        { amount },
      );
      return {
        success: true,
        data: response.data,
        message: "Availability checked",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to check availability",
      };
    }
  },

  // ==================== REPORTS ====================

  exportReport: async (params) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.EXPORT_REPORT, {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `budget_report_${Date.now()}.${params.format || "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Report downloaded" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to generate report",
      };
    }
  },

  getBudgetVsActual: async (fiscalYear, departmentId) => {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGET.BUDGET_VS_ACTUAL, {
        params: { fiscalYear, departmentId },
      });
      return {
        success: true,
        data: response.data,
        message: "Budget vs Actual data fetched",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch data",
      };
    }
  },
};

export default budgetApi;
