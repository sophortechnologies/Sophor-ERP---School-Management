// src/modules/staff-attendance/hooks/useStaffAttendance.js
import { useState, useEffect, useCallback } from "react";
import { staffAttendanceApi } from "../api/staffAttendance.api";
import { staffApi } from "../../staff/api/staff.api";

export const useStaffAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayLate: 0,
    attendanceRate: 0,
  });

  const [initialized, setInitialized] = useState(false);

  // Load all staff members (non-teaching staff only)
  const loadAllStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("👥 Loading all staff members...");

      // Use the staff API to fetch all staff
      const response = await staffApi.getStaff({ status: "ACTIVE" });

      console.log("📦 Staff API raw response:", response);

      if (response.success) {
        // CRITICAL FIX: Map the staff data correctly
        // The backend returns userId (User table ID) which is what the attendance API expects
        const staffData = response.data.map((staff) => {
          console.log(
            `📝 Processing staff: ${staff.fullName}, raw data:`,
            staff,
          );

          return {
            id: staff.id, // Staff table ID
            userId: staff.userId, // User table ID (CRITICAL for backend!)
            employeeId: staff.staffId,
            employeeName:
              staff.fullName || `${staff.firstName} ${staff.lastName}`.trim(),
            firstName: staff.firstName,
            lastName: staff.lastName,
            name: staff.fullName,
            email: staff.email,
            phone: staff.phone,
            designation: staff.designation,
            status: staff.status,
            employmentType: staff.employmentType,
          };
        });

        console.log(
          `✅ Loaded ${staffData.length} staff members with userIds:`,
          staffData.map((s) => ({ name: s.employeeName, userId: s.userId })),
        );

        setStaffMembers(staffData);
        return { success: true, data: staffData };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error loading staff members:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load departments (if needed for other features)
  const getDepartments = async () => {
    try {
      console.log("🏢 Fetching departments...");

      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);

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

      setDepartments(departmentsData);
      return {
        data: departmentsData,
        success: true,
      };
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
      return {
        data: [],
        success: false,
      };
    }
  };

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (loading) return { success: false, error: "Already loading" };

    try {
      setLoading(true);
      setError(null);

      await getDepartments();
      setInitialized(true);
      return { success: true };
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load attendance for specific date (all staff)
  const loadAttendanceForDate = useCallback(async (date) => {
    try {
      console.log(`📊 Loading attendance for date: ${date}`);

      const response = await staffAttendanceApi.getAllAttendance({
        date: date,
      });

      if (response.success) {
        console.log(
          `✅ Found ${response.data.length} attendance records for ${date}`,
        );
        return {
          data: response.data,
          success: true,
        };
      } else {
        return { data: [], success: true };
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
      return {
        data: [],
        success: false,
        error: err.message,
      };
    }
  }, []);

  // Mark single staff attendance
  const markStaffAttendance = useCallback(async (attendanceData) => {
    try {
      setLoading(true);
      console.log("📝 Marking staff attendance:", attendanceData);

      // CRITICAL: Ensure userId is a number and is valid
      const userId = Number(attendanceData.userId);
      if (isNaN(userId) || userId <= 0) {
        throw new Error(`Invalid userId: ${attendanceData.userId}`);
      }

      const payload = {
        userId: userId,
        date: attendanceData.date,
        status: attendanceData.status,
        remarks: attendanceData.remarks || "",
      };

      console.log("📤 Sending payload to backend:", payload);

      const response = await staffAttendanceApi.markStaffAttendance(payload);

      if (response.success) {
        console.log("✅ Staff attendance marked successfully");
        return {
          success: true,
          data: response.data,
          message: response.message || "Staff attendance marked successfully!",
        };
      } else {
        console.log("❌ Failed to mark staff attendance:", response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error marking staff attendance:", err);
      return {
        success: false,
        error: err.message || "Failed to mark staff attendance",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark bulk attendance
  const markBulkAttendance = useCallback(async (attendanceList) => {
    try {
      setLoading(true);
      console.log(
        "📝 Marking bulk attendance for:",
        attendanceList.length,
        "staff",
      );

      const results = [];
      const errors = [];

      for (const attendanceData of attendanceList) {
        try {
          const response =
            await staffAttendanceApi.markStaffAttendance(attendanceData);

          if (response.success) {
            results.push({
              userId: attendanceData.userId,
              data: response.data,
            });
          } else {
            errors.push({
              userId: attendanceData.userId,
              error: response.message,
            });
          }
        } catch (error) {
          errors.push({ userId: attendanceData.userId, error: error.message });
        }
      }

      return {
        data: { results, errors },
        success: errors.length === 0,
        message: `Marked ${results.length} staff, ${errors.length} failed`,
      };
    } catch (err) {
      console.error("Error in bulk marking:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function
  const refreshData = useCallback(async () => {
    if (loading) return;
    await loadAllStaff();
  }, [loading, loadAllStaff]);

  // Initialize
  useEffect(() => {
    if (!initialized && !loading) {
      loadInitialData();
    }
  }, [initialized, loading, loadInitialData]);

  return {
    attendance,
    staffMembers,
    departments,
    loading,
    error,
    stats,
    initialized,

    loadInitialData,
    loadAllStaff,
    markStaffAttendance,
    markBulkAttendance,
    refreshData,
    loadAttendanceForDate,
  };
};

export default useStaffAttendance;
