// src/modules/assets/api/assets.api.js
import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const assetsApi = {
  // Get all assets with filters
  getAssets: async (params = {}) => {
    try {
      // Transform pagination params to match backend expectation
      const apiParams = {};

      // Map frontend params to backend params (page_size -> limit or pageSize)
      if (params.page) apiParams.page = params.page;
      if (params.page_size) apiParams.limit = params.page_size; // Change page_size to limit
      if (params.limit) apiParams.limit = params.limit;
      if (params.search) apiParams.search = params.search;
      if (params.category) apiParams.category = params.category;
      if (params.status) apiParams.status = params.status;
      if (params.departmentId) apiParams.departmentId = params.departmentId;
      if (params.userId) apiParams.userId = params.userId;

      console.log("📊 Fetching assets with params:", apiParams);

      const response = await api.get(API_ENDPOINTS.ASSETS.BASE, {
        params: apiParams,
      });

      console.log("✅ Assets response:", response.data);

      // Handle different response structures
      let assetsData = [];
      let paginationData = {};

      if (response.data) {
        // Check if response has data property
        if (response.data.data && Array.isArray(response.data.data)) {
          assetsData = response.data.data;
          paginationData = {
            currentPage: response.data.current_page || response.data.page || 1,
            totalPages:
              response.data.total_pages || response.data.totalPages || 1,
            totalItems: response.data.count || response.data.total || 0,
            pageSize: response.data.page_size || response.data.limit || 10,
          };
        } else if (Array.isArray(response.data)) {
          assetsData = response.data;
          paginationData = {
            currentPage: 1,
            totalPages: 1,
            totalItems: assetsData.length,
            pageSize: assetsData.length,
          };
        } else {
          assetsData = [];
        }
      }

      return {
        success: true,
        data: assetsData,
        pagination: paginationData,
        message: "Assets fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching assets:", error);
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10,
        },
        message: error.response?.data?.message || "Failed to fetch assets",
      };
    }
  },

  // Get asset by ID
  getAssetById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.BY_ID(id));
      return {
        success: true,
        data: response.data,
        message: "Asset fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch asset",
      };
    }
  },

  // Get asset by tag
  getAssetByTag: async (assetTag) => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.BY_TAG(assetTag));
      return {
        success: true,
        data: response.data,
        message: "Asset fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching asset by tag:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Asset not found",
      };
    }
  },

  // Create new asset
  createAsset: async (assetData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ASSETS.BASE, assetData);
      return {
        success: true,
        data: response.data,
        message: "Asset created successfully",
      };
    } catch (error) {
      console.error("Error creating asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create asset",
      };
    }
  },

  //check if serial number already  exists
  checkSerialNumber: async (serialNumber, excludeId = null) => {
    try {
      const params = { serialNumber };
      if (excludeId) {
        params.excludeId = excludeId;
      }

      const response = await api.get(
        `${API_ENDPOINTS.ASSETS.BASE}/check-serial`,
        { params },
      );

      return {
        success: true,
        exists: response.data.exists,
        message: response.data.exists
          ? "Serial number already exists"
          : "Serial number is available",
      };
    } catch (error) {
      console.error("Error checking serial number:", error);
      return {
        success: false,
        exists: false,
        message: "Failed to check serial number",
      };
    }
  },
  // Update asset
  updateAsset: async (id, assetData) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.ASSETS.BY_ID(id),
        assetData,
      );
      return {
        success: true,
        data: response.data,
        message: "Asset updated successfully",
      };
    } catch (error) {
      console.error("Error updating asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update asset",
      };
    }
  },

  // Delete asset
  deleteAsset: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.ASSETS.BY_ID(id));
      return {
        success: true,
        data: response.data,
        message: "Asset deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting asset:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete asset",
      };
    }
  },

  // Assign asset
  assignAsset: async (id, assignmentData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSETS.ASSIGN(id),
        assignmentData,
      );
      return {
        success: true,
        data: response.data,
        message: "Asset assigned successfully",
      };
    } catch (error) {
      console.error("Error assigning asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to assign asset",
      };
    }
  },

  // Return asset
  returnAsset: async (id, condition) => {
    try {
      const response = await api.post(API_ENDPOINTS.ASSETS.RETURN(id), {
        condition,
      });
      return {
        success: true,
        data: response.data,
        message: "Asset returned successfully",
      };
    } catch (error) {
      console.error("Error returning asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to return asset",
      };
    }
  },

  // Transfer asset
  transferAsset: async (id, transferData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSETS.TRANSFER(id),
        transferData,
      );
      return {
        success: true,
        data: response.data,
        message: "Asset transferred successfully",
      };
    } catch (error) {
      console.error("Error transferring asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to transfer asset",
      };
    }
  },

  // Schedule maintenance
  scheduleMaintenance: async (id, maintenanceData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSETS.MAINTENANCE(id),
        maintenanceData,
      );
      return {
        success: true,
        data: response.data,
        message: "Maintenance scheduled successfully",
      };
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to schedule maintenance",
      };
    }
  },

  // Dispose asset
  disposeAsset: async (id, disposalData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSETS.DISPOSE(id),
        disposalData,
      );
      return {
        success: true,
        data: response.data,
        message: "Asset disposed successfully",
      };
    } catch (error) {
      console.error("Error disposing asset:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to dispose asset",
      };
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.DASHBOARD_STATS);
      return {
        success: true,
        data: response.data,
        message: "Dashboard stats fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch dashboard stats",
      };
    }
  },

  // Get assets due for maintenance
  getDueForMaintenance: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.DUE_MAINTENANCE);
      return {
        success: true,
        data: response.data,
        message: "Assets due for maintenance fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching due maintenance assets:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Failed to fetch due maintenance assets",
      };
    }
  },

  // Get assets with warranty expiring
  getWarrantyExpiring: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.WARRANTY_EXPIRING);
      return {
        success: true,
        data: response.data,
        message: "Assets with expiring warranty fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching warranty expiring assets:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message ||
          "Failed to fetch warranty expiring assets",
      };
    }
  },

  // Run monthly depreciation
  runMonthlyDepreciation: async () => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSETS.DEPRECIATION_MONTHLY,
      );
      return {
        success: true,
        data: response.data,
        message: "Monthly depreciation calculated successfully",
      };
    } catch (error) {
      console.error("Error running monthly depreciation:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to run monthly depreciation",
      };
    }
  },

  // Get asset report
  getAssetReport: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.REPORT_REGISTER);
      return {
        success: true,
        data: response.data,
        message: "Asset report generated successfully",
      };
    } catch (error) {
      console.error("Error generating asset report:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to generate asset report",
      };
    }
  },

  // Get assets by user
  getAssetsByUser: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSETS.BY_USER(userId));
      return {
        success: true,
        data: response.data,
        message: "User assets fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching user assets:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch user assets",
      };
    }
  },
};

export default assetsApi;
