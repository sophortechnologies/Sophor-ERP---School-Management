// src/modules/staff/hooks/useStaff.js
import { useState, useEffect, useCallback } from "react";
import { staffApi } from "../api/staff.api";

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,

    admins: 0,
    other: 0,
    inactive: 0,
  });

  // Load staff data
  const loadStaff = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffApi.getStaff(params);

      if (response.success) {
        setStaff(response.data);

        // Calculate statistics
        const activeStaff = response.data.filter((s) => s.status === "ACTIVE");
        const inactiveStaff = response.data.filter(
          (s) => s.status === "INACTIVE",
        );

        const admins = response.data.filter(
          (s) =>
            s.role === "Administrator" ||
            s.designation === "Administrator" ||
            s.role === "Principal" ||
            s.designation === "Principal",
        );

        setStats({
          total: response.total || response.data.length,
          active: activeStaff.length,
          inactive: inactiveStaff.length,
          // teachers: teachers.length,
          admins: admins.length,
        });

        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error loading staff:", err);
      const errorMessage = err.message || "Failed to load staff data";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Create new staff
  const createStaff = async (staffData) => {
    try {
      setLoading(true);
      const response = await staffApi.createStaff(staffData);

      if (response.success) {
        // Refresh the staff list
        await loadStaff();
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error creating staff:", err);
      return { success: false, error: err.message || "Failed to create staff" };
    } finally {
      setLoading(false);
    }
  };

  // Update staff
  // Update staff
  const updateStaff = async (id, staffData) => {
    try {
      setLoading(true);
      // Ensure status is uppercase if present
      if (staffData.status) {
        staffData.status = staffData.status.toUpperCase();
      }
      // Ensure employment type is in correct format
      if (staffData.employmentType) {
        if (staffData.employmentType === "Full Time")
          staffData.employmentType = "FULL_TIME";
        if (staffData.employmentType === "Part Time")
          staffData.employmentType = "PART_TIME";
        if (staffData.employmentType === "Contract")
          staffData.employmentType = "CONTRACT";
      }

      const response = await staffApi.updateStaff(id, staffData);

      if (response.success) {
        // Refresh staff list to get updated data
        await loadStaff();
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error updating staff:", err);
      return {
        success: false,
        error: err.message || "Failed to update staff member",
      };
    } finally {
      setLoading(false);
    }
  };

  // Delete staff
  // src/modules/staff/hooks/useStaff.js - UPDATED deleteStaff function
  // Update the deleteStaff function in your useStaff hook:

  const deleteStaff = async (id) => {
    try {
      setLoading(true);
      const response = await staffApi.deleteStaff(id);

      console.log("Delete response in hook:", response);

      if (response.success) {
        // Remove from local state immediately for better UX
        setStaff((prev) => prev.filter((s) => s.id !== id));

        // Recalculate stats
        const updatedStaff = staff.filter((s) => s.id !== id);
        const activeStaff = updatedStaff.filter((s) => s.status === "ACTIVE");
        const inactiveStaff = updatedStaff.filter(
          (s) => s.status === "INACTIVE",
        );
        const admins = updatedStaff.filter(
          (s) =>
            s.role === "Administrator" ||
            s.designation === "Administrator" ||
            s.role === "Principal" ||
            s.designation === "Principal",
        );

        setStats({
          total: updatedStaff.length,
          active: activeStaff.length,
          inactive: inactiveStaff.length,
          admins: admins.length,
          other: updatedStaff.length - admins.length,
        });

        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      } else {
        // If API delete failed but we have a hard-coded ID, try to remove it anyway
        console.log("API delete failed, checking for local removal...");

        // Check if this might be a locally created staff member
        const staffToDelete = staff.find((s) => s.id === id);
        if (staffToDelete && staffToDelete.staffId?.startsWith("STF999")) {
          // This was likely a locally created test entry
          setStaff((prev) => prev.filter((s) => s.id !== id));
          return {
            success: true,
            message: "Staff member removed from local storage",
          };
        }

        return {
          success: false,
          error: response.message || "Failed to delete staff member",
        };
      }
    } catch (err) {
      console.error("Error deleting staff in hook:", err);
      return {
        success: false,
        error: err.message || "Failed to delete staff member",
      };
    } finally {
      setLoading(false);
    }
  };
  // Update staff status
  const updateStaffStatus = async (id, status) => {
    try {
      const response = await staffApi.updateStaffStatus(id, status);

      if (response.success) {
        // Update local state
        setStaff((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: status.toUpperCase() } : s,
          ),
        );
        return { success: true, message: response.message };
      } else {
        // If API fails, still update local state for UI
        setStaff((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: status.toUpperCase() } : s,
          ),
        );
        return {
          success: false,
          error: response.message,
          message: "Status updated locally (backend update failed)",
        };
      }
    } catch (err) {
      console.error("Error updating staff status:", err);
      // Still update local state for UI consistency
      setStaff((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: status.toUpperCase() } : s,
        ),
      );
      return {
        success: false,
        error: err.message || "Failed to update staff status",
      };
    }
  };

  // Search staff
  const searchStaff = async (searchTerm) => {
    return await loadStaff({ search: searchTerm });
  };

  // Filter staff by role
  const filterByRole = async (role) => {
    return await loadStaff({ role });
  };

  // Filter staff by department
  const filterByDepartment = async (department) => {
    return await loadStaff({ department });
  };

  // Filter staff by status
  const filterByStatus = async (status) => {
    return await loadStaff({ status: status.toUpperCase() });
  };

  // Get staff by ID
  const getStaffById = (id) => {
    return staff.find((s) => s.id === id);
  };

  // Export staff data - UPDATED
  const exportStaff = () => {
    const csvContent = [
      [
        "Staff ID",
        "Name",
        "Email",
        "Phone",
        "Designation",
        "Employment Type",
        "Status",
        "Join Date",
      ],
      ...staff.map((s) => [
        s.staffId,
        `${s.firstName} ${s.lastName}`,
        s.email,
        s.phone,
        s.designation, // Changed from s.role to s.designation
        s.employmentType,
        s.status,
        s.joinDate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return {
    // Data
    staff,
    loading,
    error,
    stats,

    // Actions
    loadStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    searchStaff,
    filterByRole,
    filterByDepartment,
    filterByStatus,
    exportStaff,

    // Helpers
    getStaffById,
  };
};
