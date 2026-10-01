// src/modules/staff-attendance/hooks/useStaffLeave.js - UPDATED
import { useState, useEffect, useRef } from "react";
import { staffLeaveApi } from "../api/staffLeave.api";

export const useStaffLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dataLoadedRef = useRef(false);

  // Get current user role
// In useStaffLeave.js - Update the getCurrentUserRole function and loadInitialData

// Get current user role - FIXED VERSION
const getCurrentUserRole = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    const user = JSON.parse(userStr);
    const role = user?.role;
    
    // Ensure role is a string
    if (typeof role === 'string') {
      return role;
    } else if (typeof role === 'number') {
      return String(role);
    } else if (role === null || role === undefined) {
      return "";
    } else {
      return String(role);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return "";
  }
};

// In useStaffLeave.js - Simplified version
const loadInitialData = async () => {
  if (loading || dataLoadedRef.current) return;
  
  try {
    setLoading(true);
    setError(null);
    
    console.log("🔄 Loading leave data...");
    
    // ALWAYS use getMyLeaves - the API should handle permissions
    // The backend should return appropriate data based on user role
    const [leavesRes, pendingRes, staffRes] = await Promise.all([
      staffLeaveApi.getMyLeaves(),
      staffLeaveApi.getPendingLeaves(),
      staffLeaveApi.getStaffForLeave(),
    ]);
    
    console.log("📊 API Responses:", {
      leavesSuccess: leavesRes.success,
      leavesCount: leavesRes.data?.length || 0,
      pendingSuccess: pendingRes.success,
      pendingCount: pendingRes.data?.length || 0,
      staffSuccess: staffRes.success,
      staffCount: staffRes.data?.length || 0,
    });
    
    if (leavesRes.success) {
      console.log(`✅ Loaded ${leavesRes.data?.length || 0} leaves`);
      setLeaves(leavesRes.data || []);
    } else {
      console.error("❌ Failed to load leaves:", leavesRes.message);
      setLeaves([]);
    }
    
    if (pendingRes.success) {
      console.log(`✅ Loaded ${pendingRes.data?.length || 0} pending leaves`);
      setPendingLeaves(pendingRes.data || []);
    } else {
      console.error("❌ Failed to load pending leaves:", pendingRes.message);
      setPendingLeaves([]);
    }
    
    if (staffRes.success) {
      setStaffMembers(staffRes.data || []);
    } else {
      setStaffMembers([]);
    }
    
    dataLoadedRef.current = true;
    
    return { success: true };
  } catch (err) {
    console.error("❌ Error loading leave data:", err);
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};

  // Simple refresh function
  const refreshData = async () => {
    console.log("Refreshing leave data...");
    dataLoadedRef.current = false;
    await loadInitialData();
  };

  // Apply for leave
  const applyForLeave = async (leaveData) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.applyForLeave(leaveData);
      
      if (response.success) {
        await refreshData();
        return { 
          success: true, 
          data: response.data, 
          message: response.message || "Leave application submitted successfully!" 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error applying for leave:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Failed to apply for leave" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Review leave (approve/reject)
  const reviewLeave = async (id, reviewData) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.reviewLeave(id, reviewData);
      
      if (response.success) {
        // Update local state immediately
        setLeaves(prevLeaves => 
          prevLeaves.map(leave => {
            if (leave.id === id || leave._id === id) {
              return { ...leave, status: reviewData.status };
            }
            return leave;
          })
        );
        
        setPendingLeaves(prev => 
          prev.filter(leave => leave.id !== id && leave._id !== id)
        );
        
        // Refresh data from server
        setTimeout(() => {
          refreshData();
        }, 100);
        
        return { 
          success: true, 
          data: response.data, 
          message: response.message || `Leave ${reviewData.status?.toLowerCase() || 'reviewed'} successfully!` 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error reviewing leave:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Failed to review leave" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Delete leave
  const deleteLeave = async (id) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.deleteLeave(id);
      
      if (response.success) {
        await refreshData();
        return { 
          success: true, 
          message: response.message || "Leave deleted successfully!" 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error deleting leave:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Failed to delete leave" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Get leave by ID
  const getLeaveById = async (id) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.getLeaveById(id);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error getting leave details:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update leave
  const updateLeave = async (id, leaveData) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.updateLeave(id, leaveData);
      
      if (response.success) {
        await refreshData();
        return { 
          success: true, 
          data: response.data, 
          message: response.message || "Leave updated successfully!" 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error updating leave:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Failed to update leave" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Export leave data
  const exportLeaveData = (format = "csv", data = leaves) => {
    if (data.length === 0) {
      alert("No leave data to export");
      return { success: false, error: "No data to export" };
    }
    
    if (format === "csv") {
      const headers = ['Employee ID', 'Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied On', 'Remarks'];
      
      const csvContent = [
        headers.join(','),
        ...data.map(record => {
          const formattedLeave = formatLeaveForDisplay(record);
          return [
            formattedLeave.employeeId,
            `"${formattedLeave.employeeName}"`,
            formattedLeave.leaveType,
            formattedLeave.startDate,
            formattedLeave.endDate,
            calculateLeaveDays(formattedLeave.startDate, formattedLeave.endDate),
            formattedLeave.status,
            formattedLeave.appliedDate,
            `"${formattedLeave.remarks || ''}"`
          ].join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staff_leaves_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
    
    return { success: true, message: `Leave data exported as ${format}` };
  };

  // Search leaves
  const searchLeaves = async (params = {}) => {
    try {
      setLoading(true);
      const response = await staffLeaveApi.getMyLeaves(params);
      
      if (response.success) {
        setLeaves(response.data || []);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error searching leaves:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Initialize - run only once
  useEffect(() => {
    if (!dataLoadedRef.current && !loading) {
      loadInitialData();
    }
    
    return () => {
      dataLoadedRef.current = false;
    };
  }, []);

  return {
    // Data
    leaves,
    pendingLeaves,
    staffMembers,
    loading,
    error,
    
    // Actions
    refreshData,
    applyForLeave,
    updateLeave,
    reviewLeave,
    deleteLeave,
    getLeaveById,
    exportLeaveData,
    searchLeaves,
  };
};

// Helper function to format leave for display (needs to be in scope)
const formatLeaveForDisplay = (leave) => {
  // Simplified version - you can import from utils if available
  return {
    id: leave.id || leave._id,
    employeeId: leave.employeeId || leave.staffId || leave.appliedBy || "N/A",
    employeeName: leave.employeeName || leave.staffName || leave.appliedByName || "Unknown",
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason,
    status: leave.status,
    appliedDate: leave.appliedDate || leave.createdAt,
    remarks: leave.remarks,
  };
};

// Helper function to calculate leave days
const calculateLeaveDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  } catch (error) {
    return 0;
  }
};

export default useStaffLeave;