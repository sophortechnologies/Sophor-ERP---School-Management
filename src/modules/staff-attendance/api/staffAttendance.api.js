// src/modules/staff-attendance/api/staffAttendance.api.js
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const staffAttendanceApi = {
  // ==================== MARK STAFF ATTENDANCE ====================
  // Update the markStaffAttendance function in staffAttendance.api.js
  // Update markStaffAttendance in staffAttendance.api.js
  markStaffAttendance: async (attendanceData) => {
    try {
      console.log("📝 Marking staff attendance:", attendanceData);

      // Prepare payload
      const payload = {
        userId: Number(attendanceData.userId) || 0,
        date: attendanceData.date,
        status: attendanceData.status,
        remarks: attendanceData.remarks || "",
      };

      // Validate
      if (!Number.isInteger(payload.userId) || payload.userId <= 0) {
        throw new Error("userId must be a positive integer");
      }

      const allowedStatuses = [
        "PRESENT",
        "ABSENT",
        "LATE",
        "HALF_DAY",
        "LEAVE",
        "HOLIDAY",
        "WEEKEND",
        "WORK_FROM_HOME",
      ];
      if (!allowedStatuses.includes(payload.status)) {
        throw new Error(`status must be one of: ${allowedStatuses.join(", ")}`);
      }

      let response;

      // Try to update existing if we have an ID
      if (attendanceData.id) {
        console.log(
          "🔄 Attempting to update existing attendance ID:",
          attendanceData.id,
        );
        try {
          response = await api.put(
            `${API_ENDPOINTS.ATTENDANCE.STAFF.BASE}/${attendanceData.id}`,
            payload,
          );
          console.log("✅ Update successful:", response.data);
        } catch (updateError) {
          console.log("Update failed, trying POST:", updateError.message);
          // If update fails, try to create new
          response = await api.post(
            API_ENDPOINTS.ATTENDANCE.STAFF.MARK,
            payload,
          );
        }
      } else {
        // Create new attendance
        console.log("➕ Creating new attendance");
        response = await api.post(API_ENDPOINTS.ATTENDANCE.STAFF.MARK, payload);
      }

      console.log("✅ Staff attendance saved:", response.data);

      return {
        data: response.data,
        success: true,
        message: "Attendance saved successfully",
      };
    } catch (error) {
      console.error(
        "❌ Error saving staff attendance:",
        error.response?.data || error,
      );

      // Check for "already exists" error
      const errorMessage = error.response?.data?.message || error.message || "";
      if (
        error.response?.status === 400 ||
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("exists")
      ) {
        return {
          success: false,
          message:
            "Attendance already marked for this staff member on this date",
        };
      }

      return {
        success: false,
        message: errorMessage || "Failed to save attendance",
      };
    }
  },

  // src/modules/staff-attendance/api/staffAttendance.api.js
  // Fix the getStaffMembers function:

  getStaffMembers: async (params = {}) => {
    try {
      console.log("👥 Fetching staff members...", params);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.departmentId) {
        const deptId = Number(params.departmentId);
        if (!isNaN(deptId)) {
          queryParams.append("departmentId", deptId);
        }
      }

      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);

      const url = `${API_ENDPOINTS.STAFF.BASE}?${queryParams}`;
      const response = await api.get(url);

      console.log("✅ Staff API response:", response.data);

      // Extract staff data from the paginated response
      let staffData = [];

      // The backend returns: { count, total_pages, current_page, page_size, data: [...] }
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Correct structure - data is in response.data.data
        staffData = response.data.data;
        console.log(`✅ Found ${staffData.length} staff in response.data.data`);
      } else if (Array.isArray(response.data)) {
        // Fallback: direct array
        staffData = response.data;
        console.log(`✅ Found ${staffData.length} staff in direct array`);
      } else if (response.data && Array.isArray(response.data.staff)) {
        // Fallback: staff property
        staffData = response.data.staff;
        console.log(
          `✅ Found ${staffData.length} staff in response.data.staff`,
        );
      } else {
        console.warn("⚠️ Unexpected response structure:", response.data);
      }

      // Transform staff data to a consistent format
      const transformedStaff = staffData.map((staff) => {
        // Extract user info (nested in user object)
        const user = staff.user || {};
        const firstName =
          user.firstName || staff.firstName || staff.first_name || "";
        const lastName =
          user.lastName || staff.lastName || staff.last_name || "";

        return {
          id: staff.id,
          userId: staff.userId || user.id,
          employeeId: staff.employeeId || staff.staffId || `STF${staff.id}`,
          employeeName:
            `${firstName} ${lastName}`.trim() || user.email || "Unnamed Staff",
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`.trim(),
          email: user.email || staff.email,
          phone: user.phone || staff.phone,
          designation: staff.designation || "Staff",
          departmentId: staff.departmentId,
          department: staff.department?.name,
          departmentName: staff.department?.name,
          status: staff.status || "ACTIVE",
          employmentType: staff.employmentType || "FULL_TIME",
          joiningDate: staff.joiningDate,
          // Keep original for debugging
          raw: staff,
        };
      });

      console.log(`✅ Transformed ${transformedStaff.length} staff members`);

      return {
        data: transformedStaff,
        success: true,
        message: "Staff members fetched successfully",
      };
    } catch (error) {
      console.error(
        "❌ Error fetching staff members:",
        error.response?.data || error,
      );

      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch staff members",
      };
    }
  },

  // ==================== GET USER ATTENDANCE ====================
  getUserAttendance: async (userId, params = {}) => {
    try {
      console.log(`📊 Fetching attendance for user ${userId}:`, params);

      // Convert userId to number
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error("userId must be a number");
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append("date", params.date);
      if (params.month) queryParams.append("month", params.month);
      if (params.year) queryParams.append("year", params.year);

      const url = `${API_ENDPOINTS.ATTENDANCE.STAFF.USER_ATTENDANCE(numericUserId)}?${queryParams}`;
      const response = await api.get(url);

      console.log("✅ User attendance response:", response.data);

      // Extract data based on backend response structure
      let attendanceData = [];

      if (response.data && response.data.success !== false) {
        if (Array.isArray(response.data)) {
          attendanceData = response.data;
        } else if (Array.isArray(response.data.data)) {
          attendanceData = response.data.data;
        } else if (Array.isArray(response.data.attendance)) {
          attendanceData = response.data.attendance;
        } else if (response.data.attendanceData) {
          attendanceData = response.data.attendanceData;
        }
      }

      return {
        data: attendanceData,
        success: true,
        message: "User attendance fetched successfully",
      };
    } catch (error) {
      console.error(
        "❌ Error fetching user attendance:",
        error.response?.data || error,
      );
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch user attendance",
      };
    }
  },

  // ==================== GET TODAY'S SUMMARY ====================
  getTodaySummary: async () => {
    try {
      console.log("📈 Fetching today's staff attendance summary");

      const response = await api.get(
        API_ENDPOINTS.ATTENDANCE.STAFF.TODAY_SUMMARY,
      );

      console.log("✅ Today's summary:", response.data);

      // Handle different response structures
      let summaryData = {};
      if (response.data) {
        if (response.data.summary) {
          summaryData = response.data.summary;
        } else if (response.data.data) {
          summaryData = response.data.data;
        } else {
          summaryData = response.data;
        }
      }

      return {
        data: summaryData,
        success: true,
        message: "Today's summary fetched successfully",
      };
    } catch (error) {
      console.error(
        "❌ Error fetching today's summary:",
        error.response?.data || error,
      );

      const fallbackData = {
        totalStaff: 0,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0,
        attendanceRate: 0,
      };

      return {
        data: fallbackData,
        success: false,
        message: "Using fallback data",
      };
    }
  },

  // ==================== GET DEPARTMENTS ====================
  getDepartments: async () => {
    try {
      console.log("🏢 Fetching departments...");

      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);

      console.log("✅ Departments fetched:", response.data);

      let departmentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          departmentsData = response.data;
        } else if (Array.isArray(response.data.data)) {
          departmentsData = response.data.data;
        } else if (Array.isArray(response.data.departments)) {
          departmentsData = response.data.departments;
        }
      }

      return {
        data: departmentsData,
        success: true,
        message: "Departments fetched successfully",
      };
    } catch (error) {
      console.error(
        "❌ Error fetching departments:",
        error.response?.data || error,
      );

      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch departments",
      };
    }
  },

  // ==================== GET ATTENDANCE REPORT ====================
  getAttendanceReport: async (params = {}) => {
    try {
      console.log("📄 Generating attendance report:", params);

      const response = await api.get(API_ENDPOINTS.ATTENDANCE.STAFF.REPORT, {
        params,
      });

      console.log("✅ Attendance report:", response.data);

      return {
        data: response.data,
        success: true,
        message: "Attendance report generated successfully",
      };
    } catch (error) {
      console.error("❌ Error generating report:", error);
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to generate attendance report",
      };
    }
  },

  // ==================== GET ALL ATTENDANCE ====================
  getAllAttendance: async (params = {}) => {
    try {
      console.log("📊 Fetching all staff attendance...", params);

      const response = await api.get(API_ENDPOINTS.ATTENDANCE.STAFF.BASE, {
        params,
      });

      console.log("✅ All attendance fetched:", response.data);

      let attendanceData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          attendanceData = response.data;
        } else if (Array.isArray(response.data.data)) {
          attendanceData = response.data.data;
        } else if (Array.isArray(response.data.attendance)) {
          attendanceData = response.data.attendance;
        }
      }

      return {
        data: attendanceData,
        success: true,
        message: "All attendance fetched successfully",
      };
    } catch (error) {
      console.error("❌ Error fetching all attendance:", error);
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch attendance",
      };
    }
  },
};

export default staffAttendanceApi;
