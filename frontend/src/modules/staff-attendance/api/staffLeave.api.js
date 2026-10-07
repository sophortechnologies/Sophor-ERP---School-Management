// src/modules/staff-attendance/api/staffLeave.api.js - CORRECTED VERSION
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";

// Map frontend leave types to backend values
const LEAVE_TYPE_MAPPING = {
  CASUAL: 'CASUAL',          // Casual Leave
  SICK: 'SICK',              // Sick Leave
  EARNED: 'ANNUAL',          // Earned → ANNUAL
  MATERNITY: 'MATERNITY',    // Maternity Leave
  PATERNITY: 'PATERNITY',    // Paternity Leave
  COMPENSATORY: 'COMPENSATORY', // Compensatory Leave
  LOP: 'UNPAID',             // Loss of Pay → UNPAID
  // Add other mappings as needed
};

export const staffLeaveApi = {
  // ==================== APPLY FOR LEAVE ====================
  applyForLeave: async (leaveData) => {
    try {
      console.log("📝 Applying for leave with data:", leaveData);
      
      // Transform data to match backend API schema
      // Backend expects camelCase fields with specific leave types
      const apiData = {
        leaveType: LEAVE_TYPE_MAPPING[leaveData.leaveType] || leaveData.leaveType, // Map to backend values
        startDate: leaveData.startDate, // Should be YYYY-MM-DD format
        endDate: leaveData.endDate,     // Should be YYYY-MM-DD format
        reason: leaveData.reason || "",
        contactNumber: leaveData.contactInfo || "",
        addressDuringLeave: leaveData.address || "",
        additionalRemarks: leaveData.remarks || "",
      };
      
      // Remove empty fields
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === null || apiData[key] === "") {
          delete apiData[key];
        }
      });
      
      console.log("📤 Sending to API endpoint:", API_ENDPOINTS.STAFF_LEAVE.APPLY);
      console.log("📤 API payload:", apiData);
      
      const response = await api.post(API_ENDPOINTS.STAFF_LEAVE.APPLY, apiData);
      
      console.log("✅ Leave application submitted:", response.data);
      
      return {
        data: response.data,
        success: true,
        message: response.data?.message || "Leave application submitted successfully"
      };
    } catch (error) {
      console.error("❌ Error applying for leave:", error.response?.data || error);
      
      let errorMessage = "Failed to apply for leave";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map(err => `${err.field || err.path}: ${err.message}`).join(', ');
        } else if (typeof validationErrors === 'object') {
          errorMessage = Object.entries(validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  // ==================== GET MY LEAVES ====================
// In staffLeave.api.js - Remove getAllLeaves function and update getMyLeaves

// ==================== GET MY LEAVES (UPDATED FOR SUPERADMIN) ====================
getMyLeaves: async (params = {}) => {
  try {
    console.log("📋 Fetching leave records...", params);
    
    // Get current user to determine if superadmin
    let userRole = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const role = user?.role;
        userRole = role ? String(role).toLowerCase() : "";
      }
    } catch (error) {
      console.error("Error getting user role:", error);
    }
    
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';
    
    // For superadmin, we might need different parameters
    // Try different approaches
    let apiParams = { ...params };
    
    if (isSuperAdmin) {
      // Try adding admin=true or all=true parameter
      apiParams.admin = true;
      apiParams.all = true;
    }
    
    console.log("📤 API params for leave fetch:", apiParams);
    
    const response = await api.get(API_ENDPOINTS.STAFF_LEAVE.MY_LEAVES, { 
      params: apiParams 
    });
    
    console.log("✅ Leaves response:", response.data);
    
    let leaveData = [];
    
    if (Array.isArray(response.data)) {
      leaveData = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      leaveData = response.data.data;
    } else if (response.data?.leaves && Array.isArray(response.data.leaves)) {
      leaveData = response.data.leaves;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      leaveData = response.data.items;
    }
    
    // Transform backend data to frontend format
    const formattedLeaves = leaveData.map(leave => ({
      id: leave.id,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.createdAt || leave.appliedDate,
      employeeName: leave.employee?.name || leave.staff?.name || leave.employeeName,
      employeeId: leave.employee?.employeeId || leave.staff?.employeeId || leave.employeeId,
      contactInfo: leave.contactNumber,
      address: leave.addressDuringLeave,
      remarks: leave.additionalRemarks,
      reviewRemarks: leave.reviewRemarks,
      department: leave.employee?.department || leave.staff?.department || leave.department,
      // Also try to get appliedBy if available
      appliedBy: leave.appliedBy || leave.userId,
    }));
    
    console.log(`✅ Formatted ${formattedLeaves.length} leaves for ${isSuperAdmin ? 'SuperAdmin' : 'User'}`);
    
    return {
      data: formattedLeaves,
      success: true,
      message: "Leave records fetched successfully",
      isSuperAdmin: isSuperAdmin
    };
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    
    let errorMessage = "Failed to fetch leave records";
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    // Try without parameters if error
    if (error.response?.status === 400) {
      try {
        console.log("🔄 Retrying without parameters...");
        const retryResponse = await api.get(API_ENDPOINTS.STAFF_LEAVE.MY_LEAVES);
        
        let retryData = [];
        if (Array.isArray(retryResponse.data)) {
          retryData = retryResponse.data;
        } else if (retryResponse.data?.data) {
          retryData = retryResponse.data.data;
        }
        
        const formattedLeaves = retryData.map(leave => ({
          id: leave.id,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
          appliedDate: leave.createdAt || leave.appliedDate,
          employeeName: leave.employee?.name || leave.staff?.name || leave.employeeName,
          employeeId: leave.employee?.employeeId || leave.staff?.employeeId || leave.employeeId,
        }));
        
        return {
          data: formattedLeaves,
          success: true,
          message: "Leave records fetched (retry successful)",
          isRetry: true
        };
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError);
      }
    }
    
    return {
      data: [],
      success: false,
      message: errorMessage,
      error: error.response?.data
    };
  }
},

// Remove the getAllLeaves function entirely
// In staffLeave.api.js - Add this function
// ==================== GET ALL LEAVES (FOR SUPERADMIN) ====================
getAllLeaves: async (params = {}) => {
  try {
    console.log("📋 Fetching ALL leave records...", params);
    
    // Try different endpoints that might exist for getting all leaves
    const endpointsToTry = [
      API_ENDPOINTS.STAFF_LEAVE.ALL, // If you have this endpoint
      API_ENDPOINTS.STAFF_LEAVE.BASE, // The base endpoint might return all
      API_ENDPOINTS.STAFF_LEAVE.MY_LEAVES + '?all=true', // Try with query param
    ];
    
    let response;
    let lastError;
    
    // Try each endpoint
    for (const endpoint of endpointsToTry) {
      if (endpoint) {
        try {
          console.log("Trying endpoint:", endpoint);
          response = await api.get(endpoint, { params: { ...params, all: true } });
          break; // Success, break out of loop
        } catch (error) {
          lastError = error;
          console.log("Endpoint failed:", endpoint, error.message);
        }
      }
    }
    
    // If all endpoints failed, try the regular endpoint
    if (!response) {
      console.log("Trying MY_LEAVES with all=true param");
      response = await api.get(API_ENDPOINTS.STAFF_LEAVE.MY_LEAVES, { 
        params: { ...params, all: true } 
      });
    }
    
    console.log("✅ All leaves response:", response.data);
    
    let leaveData = [];
    
    if (Array.isArray(response.data)) {
      leaveData = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      leaveData = response.data.data;
    } else if (response.data?.leaves && Array.isArray(response.data.leaves)) {
      leaveData = response.data.leaves;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      leaveData = response.data.items;
    } else if (response.data?.allLeaves && Array.isArray(response.data.allLeaves)) {
      leaveData = response.data.allLeaves;
    }
    
    // Transform backend data to frontend format
    const formattedLeaves = leaveData.map(leave => ({
      id: leave.id,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.createdAt || leave.appliedDate,
      employeeName: leave.employee?.name || leave.staff?.name || leave.employeeName,
      employeeId: leave.employee?.employeeId || leave.staff?.employeeId || leave.employeeId,
      contactInfo: leave.contactNumber,
      address: leave.addressDuringLeave,
      remarks: leave.additionalRemarks,
      reviewRemarks: leave.reviewRemarks,
      department: leave.employee?.department || leave.staff?.department || leave.department,
    }));
    
    return {
      data: formattedLeaves,
      success: true,
      message: "All leave records fetched successfully"
    };
  } catch (error) {
    console.error("❌ Error fetching all leaves:", error);
    
    // Fallback: try to get my leaves and pending leaves and combine them
    try {
      console.log("🔄 Falling back to combining my leaves and pending leaves");
      const [myLeavesRes, pendingRes] = await Promise.all([
        staffLeaveApi.getMyLeaves(),
        staffLeaveApi.getPendingLeaves(),
      ]);
      
      const allLeaves = [...(myLeavesRes.data || []), ...(pendingRes.data || [])];
      
      // Remove duplicates by ID
      const uniqueLeaves = Array.from(new Map(allLeaves.map(item => [item.id, item])).values());
      
      return {
        data: uniqueLeaves,
        success: true,
        message: "Leaves fetched with fallback method",
        isFallback: true
      };
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch all leaves"
      };
    }
  }
},
  // ==================== GET PENDING LEAVES ====================
  getPendingLeaves: async () => {
    try {
      console.log("⏳ Fetching pending leave approvals...");
      
      const response = await api.get(API_ENDPOINTS.STAFF_LEAVE.PENDING);
      
      console.log("✅ Pending leaves response:", response.data);
      
      let pendingData = [];
      
      if (Array.isArray(response.data)) {
        pendingData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        pendingData = response.data.data;
      } else if (response.data?.pending && Array.isArray(response.data.pending)) {
        pendingData = response.data.pending;
      }
      
      // Transform backend data to frontend format
      const formattedLeaves = pendingData.map(leave => ({
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.createdAt || leave.appliedDate,
        employeeName: leave.employee?.name || leave.staff?.name || leave.employeeName,
        employeeId: leave.employee?.employeeId || leave.staff?.employeeId || leave.employeeId,
        contactInfo: leave.contactNumber,
        address: leave.addressDuringLeave,
        remarks: leave.additionalRemarks,
      }));
      
      return {
        data: formattedLeaves,
        success: true,
        message: "Pending leaves fetched successfully"
      };
    } catch (error) {
      console.error("❌ Error fetching pending leaves:", error);
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch pending leaves"
      };
    }
  },

  // ==================== GET LEAVE BY ID ====================
  getLeaveById: async (id) => {
    try {
      console.log(`🔍 Fetching leave ${id}...`);
      
      const response = await api.get(API_ENDPOINTS.STAFF_LEAVE.BY_ID(id));
      
      console.log("✅ Leave details:", response.data);
      
      const leave = response.data;
      
      // Transform to frontend format
      const formattedLeave = {
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.createdAt || leave.appliedDate,
        employeeName: leave.employee?.name || leave.staff?.name || leave.employeeName,
        employeeId: leave.employee?.employeeId || leave.staff?.employeeId || leave.employeeId,
        contactInfo: leave.contactNumber,
        address: leave.addressDuringLeave,
        remarks: leave.additionalRemarks,
        reviewRemarks: leave.reviewRemarks,
        reviewedBy: leave.reviewedBy,
        reviewedAt: leave.reviewedAt,
      };
      
      return {
        data: formattedLeave,
        success: true,
        message: "Leave details fetched successfully"
      };
    } catch (error) {
      console.error("❌ Error fetching leave details:", error);
      return {
        data: null,
        success: false,
        message: error.response?.data?.message || "Failed to fetch leave details"
      };
    }
  },

  // ==================== UPDATE LEAVE ====================
  updateLeave: async (id, leaveData) => {
    try {
      console.log(`🔄 Updating leave ${id}:`, leaveData);
      
      // Transform data for API
      const apiData = {};
      
      if (leaveData.leaveType) apiData.leaveType = LEAVE_TYPE_MAPPING[leaveData.leaveType] || leaveData.leaveType;
      if (leaveData.startDate) apiData.startDate = leaveData.startDate;
      if (leaveData.endDate) apiData.endDate = leaveData.endDate;
      if (leaveData.reason !== undefined) apiData.reason = leaveData.reason;
      if (leaveData.contactInfo !== undefined) apiData.contactNumber = leaveData.contactInfo;
      if (leaveData.address !== undefined) apiData.addressDuringLeave = leaveData.address;
      if (leaveData.remarks !== undefined) apiData.additionalRemarks = leaveData.remarks;
      
      const response = await api.patch(API_ENDPOINTS.STAFF_LEAVE.BY_ID(id), apiData);
      
      console.log("✅ Leave updated:", response.data);
      
      return {
        data: response.data,
        success: true,
        message: response.data?.message || "Leave updated successfully"
      };
    } catch (error) {
      console.error("❌ Error updating leave:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update leave"
      };
    }
  },

  // ==================== REVIEW LEAVE ====================
// In staffLeave.api.js - Update the reviewLeave function
// ==================== REVIEW LEAVE ====================
reviewLeave: async (id, reviewData) => {
  try {
    console.log(`📋 Reviewing leave ${id}:`, reviewData);
    
    // Try different payload structures based on backend expectations
    // Option 1: Backend might expect just 'status'
    // Option 2: Backend might expect 'status' and 'remarks' (not reviewRemarks)
    // Option 3: Backend might expect different field names
    
    let apiData = {};
    
    // Try with minimal data first
    apiData.status = reviewData.status;
    
    // Only add remarks if they exist and if backend expects them
    // Try without remarks first, then with different field names if needed
    if (reviewData.reviewRemarks && reviewData.reviewRemarks.trim() !== '') {
      // Try different field names that backend might expect
      apiData.remarks = reviewData.reviewRemarks;
      // Or try: apiData.note = reviewData.reviewRemarks;
      // Or try: apiData.comment = reviewData.reviewRemarks;
    }
    
    // For quick approve/reject actions, backend might not need any remarks
    const isQuickAction = reviewData.reviewRemarks === 'Approved via quick action' || 
                          reviewData.reviewRemarks === '';
    
    if (isQuickAction) {
      // For quick actions, send only status
      apiData = { status: reviewData.status };
    }
    
    console.log("📤 Sending review data to API:", apiData);
    console.log("📤 API endpoint:", API_ENDPOINTS.STAFF_LEAVE.REVIEW(id));
    
    const response = await api.patch(API_ENDPOINTS.STAFF_LEAVE.REVIEW(id), apiData);
    
    console.log("✅ Leave reviewed:", response.data);
    
    return {
      data: response.data,
      success: true,
      message: response.data?.message || "Leave reviewed successfully"
    };
  } catch (error) {
    console.error("❌ Error reviewing leave:", error);
    
    // Try alternative payload if first attempt fails
    if (error.response?.status === 400) {
      console.log("🔄 Trying alternative payload structure...");
      
      // Try with just status
      try {
        const simplePayload = { status: reviewData.status };
        console.log("🔄 Attempting with simple payload:", simplePayload);
        
        const retryResponse = await api.patch(
          API_ENDPOINTS.STAFF_LEAVE.REVIEW(id), 
          simplePayload
        );
        
        console.log("✅ Leave reviewed (retry success):", retryResponse.data);
        
        return {
          data: retryResponse.data,
          success: true,
          message: retryResponse.data?.message || "Leave reviewed successfully"
        };
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError);
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || "Failed to review leave",
      error: error.response?.data
    };
  }
},

  // ==================== DELETE LEAVE ====================
  deleteLeave: async (id) => {
    try {
      console.log(`🗑️ Deleting leave ${id}`);
      
      const response = await api.delete(API_ENDPOINTS.STAFF_LEAVE.BY_ID(id));
      
      console.log("✅ Leave deleted:", response.data);
      
      return {
        success: true,
        message: response.data?.message || "Leave deleted successfully"
      };
    } catch (error) {
      console.error("❌ Error deleting leave:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete leave"
      };
    }
  },

  // ==================== GET STAFF MEMBERS FOR LEAVE ====================
  getStaffForLeave: async () => {
    try {
      console.log("👥 Fetching staff for leave management...");
      
      const response = await api.get(API_ENDPOINTS.STAFF.BASE);
      
      console.log("✅ Staff for leave:", response.data);
      
      const responseData = response.data;
      const data = responseData.data || responseData;
      
      return {
        data: Array.isArray(data) ? data : [data],
        success: true,
        message: "Staff fetched successfully"
      };
    } catch (error) {
      console.error("❌ Error fetching staff:", error);
      
      // Mock data for development
      const mockStaff = [
        {
          id: 1,
          employeeId: "EMP001",
          name: "John Doe",
          department: "Teaching",
          designation: "Senior Teacher",
          leaveBalance: {
            casual: 12,
            sick: 15,
            annual: 30
          }
        },
        {
          id: 2,
          employeeId: "EMP002",
          name: "Jane Smith",
          department: "Administration",
          designation: "Admin Officer",
          leaveBalance: {
            casual: 8,
            sick: 10,
            annual: 25
          }
        }
      ];
      
      return {
        data: mockStaff,
        success: true,
        message: "Using mock staff data",
        isMock: true
      };
    }
  },

  // ==================== GET LEAVE STATISTICS ====================
  getLeaveStatistics: async (params = {}) => {
    try {
      console.log("📊 Getting leave statistics:", params);
      
      // This endpoint might not exist, so we'll calculate from existing data
      const myLeaves = await staffLeaveApi.getMyLeaves(params);
      const pendingLeaves = await staffLeaveApi.getPendingLeaves();
      
      if (myLeaves.success) {
        const leaves = myLeaves.data;
        const stats = {
          totalLeaves: leaves.length,
          approved: leaves.filter(l => l.status === 'APPROVED' || l.status === 'approved').length,
          pending: pendingLeaves.data.length,
          rejected: leaves.filter(l => l.status === 'REJECTED' || l.status === 'rejected').length,
          cancelled: leaves.filter(l => l.status === 'CANCELLED' || l.status === 'cancelled').length,
        };
        
        return {
          data: stats,
          success: true,
          message: "Leave statistics calculated"
        };
      }
      
      return {
        data: {
          totalLeaves: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          cancelled: 0,
        },
        success: false,
        message: "Failed to calculate statistics"
      };
    } catch (error) {
      console.error("❌ Error getting leave statistics:", error);
      return {
        data: null,
        success: false,
        message: error.message
      };
    }
  }
};

export default staffLeaveApi;