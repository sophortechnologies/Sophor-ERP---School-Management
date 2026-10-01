// src/modules/assets/hooks/useAssets.js
import { useState, useEffect, useCallback } from "react";
import assetsApi from "../api/assets.api";

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    depreciatedValue: 0,
    assetsByCategory: {},
    assetsByStatus: {},
    maintenanceDueCount: 0,
    warrantyExpiringCount: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load assets
  const loadAssets = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await assetsApi.getAssets(params);

      if (response.success) {
        setAssets(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setAssets([]);
        setError(response.message);
      }
    } catch (err) {
      console.error("Error loading assets:", err);
      setError(err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await assetsApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  }, []);

  // Load single asset
  const loadAssetById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await assetsApi.getAssetById(id);
      if (response.success && response.data) {
        setSelectedAsset(response.data);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      console.error("Error loading asset:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create asset
  const createAsset = useCallback(
    async (assetData) => {
      try {
        setLoading(true);
        const response = await assetsApi.createAsset(assetData);
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error creating asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Update asset
  const updateAsset = useCallback(
    async (id, assetData) => {
      try {
        setLoading(true);
        const response = await assetsApi.updateAsset(id, assetData);
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error updating asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Delete asset
  const deleteAsset = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await assetsApi.deleteAsset(id);
        if (response.success) {
          await loadAssets();
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error deleting asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Assign asset
  const assignAsset = useCallback(
    async (id, assignmentData) => {
      try {
        setLoading(true);
        const response = await assetsApi.assignAsset(id, assignmentData);
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error assigning asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Return asset
  const returnAsset = useCallback(
    async (id, condition) => {
      try {
        setLoading(true);
        const response = await assetsApi.returnAsset(id, condition);
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error returning asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Transfer asset
  const transferAsset = useCallback(
    async (id, transferData) => {
      try {
        setLoading(true);
        const response = await assetsApi.transferAsset(id, transferData);
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error transferring asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Schedule maintenance
  const scheduleMaintenance = useCallback(
    async (id, maintenanceData) => {
      try {
        setLoading(true);
        const response = await assetsApi.scheduleMaintenance(
          id,
          maintenanceData,
        );
        if (response.success) {
          await loadAssets();
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error scheduling maintenance:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets],
  );

  // Dispose asset
  const disposeAsset = useCallback(
    async (id, disposalData) => {
      try {
        setLoading(true);
        const response = await assetsApi.disposeAsset(id, disposalData);
        if (response.success) {
          await loadAssets();
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
        console.error("Error disposing asset:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAssets, loadDashboardStats],
  );

  // Run monthly depreciation
  const runMonthlyDepreciation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assetsApi.runMonthlyDepreciation();
      if (response.success) {
        await loadDashboardStats();
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error running monthly depreciation:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadDashboardStats]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (assets.length === 0) {
      alert("No assets to export");
      return;
    }

    const csvContent = [
      [
        "Asset Tag",
        "Name",
        "Category",
        "Purchase Cost",
        "Current Value",
        "Status",
        "Assigned To",
      ],
      ...assets.map((asset) => [
        asset.assetTag || "",
        asset.name || "",
        asset.category || "",
        asset.purchaseCost || 0,
        asset.currentValue || 0,
        asset.status || "",
        asset.assignedToUser
          ? `${asset.assignedToUser.firstName} ${asset.assignedToUser.lastName}`
          : "Unassigned",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [assets]);

  // Initial load
  useEffect(() => {
    loadAssets();
    loadDashboardStats();
  }, [loadAssets, loadDashboardStats]);

  return {
    assets,
    loading,
    error,
    stats,
    pagination,
    selectedAsset,
    loadAssets,
    loadDashboardStats,
    loadAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    assignAsset,
    returnAsset,
    transferAsset,
    scheduleMaintenance,
    disposeAsset,
    runMonthlyDepreciation,
    exportToCSV,
    setSelectedAsset,
  };
};

export default useAssets;
