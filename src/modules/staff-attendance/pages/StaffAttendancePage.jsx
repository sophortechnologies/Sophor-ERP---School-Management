// src/modules/staff-attendance/pages/StaffAttendancePage.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  Building,
  UserCheck,
  UserX,
  Plus,
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  XCircle,
  Info,
  Edit,
  Save,
} from "lucide-react";
import { useStaffAttendance } from "../hooks/useStaffAttendance";
import StaffAttendanceMarking from "../components/StaffAttendanceMarking/StaffAttendanceMarking";
import { formatDateForDisplay } from "../utils";
import "./StaffAttendancePage.css";

const StaffAttendancePage = () => {
  const {
    staffMembers,
    loading,
    error,
    loadInitialData,
    loadAllStaff, // New function to load all staff
    markStaffAttendance,
    refreshData,
    loadAttendanceForDate,
  } = useStaffAttendance();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showMarking, setShowMarking] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [dateAttendance, setDateAttendance] = useState([]);
  const [loadingDateAttendance, setLoadingDateAttendance] = useState(false);
  const [todayStats, setTodayStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    halfDay: 0,
    total: 0,
  });

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      if (!hasInitialLoad && !loading) {
        await loadInitialData();
        await loadAllStaff(); // Load all staff members
        setHasInitialLoad(true);
      }
    };

    initializeData();
  }, [hasInitialLoad, loading, loadInitialData, loadAllStaff]);

  // Refresh attendance data helper
  const refreshAttendanceData = async () => {
    setLoadingDateAttendance(true);
    try {
      const refreshResult = await loadAttendanceForDate(selectedDate);
      if (refreshResult.success) {
        setDateAttendance(refreshResult.data);
        updateStats(refreshResult.data);
      }
    } catch (err) {
      console.error("Error refreshing attendance:", err);
    } finally {
      setLoadingDateAttendance(false);
    }
  };

  // Load attendance when date changes
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedDate || !hasInitialLoad) return;

      setLoadingDateAttendance(true);
      try {
        console.log("🔄 Loading attendance for date:", selectedDate);

        const result = await loadAttendanceForDate(selectedDate);
        if (result.success) {
          setDateAttendance(result.data || []);
          updateStats(result.data || []);
        }
      } catch (err) {
        console.error("Error loading attendance:", err);
      }
      setLoadingDateAttendance(false);
    };

    if (hasInitialLoad) {
      loadAttendance();
    }
  }, [selectedDate, loadAttendanceForDate, hasInitialLoad]);

  // Update stats based on attendance data
  const updateStats = (attendanceData) => {
    if (!Array.isArray(attendanceData)) {
      console.warn("Invalid attendance data:", attendanceData);
      return;
    }

    console.log("📊 Updating stats with:", attendanceData.length, "records");

    const presentCount = attendanceData.filter(
      (r) => r.status === "PRESENT",
    ).length;
    const absentCount = attendanceData.filter(
      (r) => r.status === "ABSENT",
    ).length;
    const lateCount = attendanceData.filter((r) => r.status === "LATE").length;
    const leaveCount = attendanceData.filter(
      (r) => r.status === "LEAVE",
    ).length;
    const halfDayCount = attendanceData.filter(
      (r) => r.status === "HALF_DAY",
    ).length;

    setTodayStats({
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      onLeave: leaveCount,
      halfDay: halfDayCount,
      total: attendanceData.length,
    });
  };

  // Check if date is within allowed range (today or past 3 days)
  const isDateAllowed = (date) => {
    const today = new Date();
    const selected = new Date(date);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    threeDaysAgo.setHours(0, 0, 0, 0);

    return selected >= threeDaysAgo && selected <= today;
  };

  // Check if ALL staff have attendance marked for this date
  const isAttendanceFullyMarked = () => {
    if (!staffMembers || staffMembers.length === 0) return false;

    const staffIds = staffMembers
      .map((staff) => Number(staff.userId || staff.id || 0))
      .filter((id) => id > 0);
    const markedStaffIds = dateAttendance.map((record) =>
      Number(record.userId || record.employeeId || 0),
    );

    return (
      staffIds.length > 0 && staffIds.every((id) => markedStaffIds.includes(id))
    );
  };

  // Check if ANY staff have attendance marked
  const isAttendancePartiallyMarked = () => {
    if (!staffMembers || staffMembers.length === 0) return false;

    const staffIds = staffMembers
      .map((staff) => Number(staff.userId || staff.id || 0))
      .filter((id) => id > 0);
    const markedStaffIds = dateAttendance.map((record) =>
      Number(record.userId || record.employeeId || 0),
    );

    return markedStaffIds.length > 0;
  };

  // Handle date change with validation
  const handleDateChange = (date) => {
    if (!isDateAllowed(date)) {
      alert("You can only mark attendance for today or the past 3 days");
      return;
    }

    const today = new Date();
    const selected = new Date(date);
    if (selected > today) {
      alert("Cannot mark attendance for future dates");
      return;
    }

    setSelectedDate(date);
  };

  // Handle marking attendance
  const handleMarkAttendance = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    if (!isDateAllowed(selectedDate)) {
      alert("You can only mark attendance for today or the past 3 days");
      return;
    }

    setMarkingLoading(true);
    try {
      // Load all staff members
      await loadAllStaff();
      setShowMarking(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setMarkingLoading(false);
    }
  };

  // Save attendance
  const handleSaveAttendance = async (attendanceDataList) => {
    console.log(
      "📝 Saving attendance data for:",
      attendanceDataList.length,
      "staff",
    );

    if (attendanceDataList.length === 0) {
      alert("No attendance data to save");
      return;
    }

    try {
      const results = [];
      const errors = [];

      for (const attendanceData of attendanceDataList) {
        try {
          console.log(
            "📝 Processing attendance for user:",
            attendanceData.userId,
          );

          const result = await markStaffAttendance(attendanceData);

          if (result.success) {
            results.push({
              userId: attendanceData.userId,
              data: result.data,
            });
            console.log(`✅ Success for user ${attendanceData.userId}`);
          } else {
            if (result.error && result.error.includes("already marked")) {
              console.log(
                `ℹ️ Attendance already marked for user ${attendanceData.userId}`,
              );
              continue;
            }

            errors.push({
              userId: attendanceData.userId,
              error: result.error,
            });
            console.error(
              `❌ Failed for user ${attendanceData.userId}:`,
              result.error,
            );
          }
        } catch (error) {
          errors.push({
            userId: attendanceData.userId,
            error: error.message,
          });
          console.error(`❌ Error for user ${attendanceData.userId}:`, error);
        }
      }

      console.log(
        `📊 Save results: ${results.length} success, ${errors.length} errors`,
      );

      if (results.length > 0) {
        alert(
          `✅ Successfully saved attendance for ${results.length} staff member${results.length > 1 ? "s" : ""}`,
        );
        setShowMarking(false);
        await refreshAttendanceData();
      } else if (errors.length === 0) {
        alert(
          "ℹ️ All staff already have attendance marked for this date. No changes made.",
        );
        setShowMarking(false);
      } else {
        alert(
          `❌ Failed to save attendance for ${errors.length} staff members`,
        );
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert(error.message || "Failed to save attendance");
    }
  };

  const totalStaffCount = staffMembers.length;
  const markedStaffCount = dateAttendance.filter((record) => {
    const recordUserId = Number(record.userId || record.employeeId || 0);
    return staffMembers.some(
      (staff) => Number(staff.userId || staff.id || 0) === recordUserId,
    );
  }).length;
  const isFullyMarked = isAttendanceFullyMarked();
  const isPartiallyMarked = isAttendancePartiallyMarked();

  if (loading && !hasInitialLoad) {
    return (
      <div className="staff-attendance-staffattendancepage-loading-container">
        <div className="staff-attendance-staffattendancepage-spinner"></div>
        <p>Loading staff attendance data...</p>
      </div>
    );
  }

  const getMinDate = () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return threeDaysAgo.toISOString().split("T")[0];
  };

  return (
    <div className="staff-attendance-staffattendancepage-staff-attendance-page">
      {/* Header */}
      <div className="staff-attendance-staffattendancepage-page-header">
        <div className="staff-attendance-staffattendancepage-header-content">
          <div>
            <h1>Staff Attendance Management</h1>
            <p>Mark and track attendance for non-teaching staff</p>
          </div>
          <div className="staff-attendance-staffattendancepage-header-actions">
            <button
              className={`btn ${isFullyMarked ? "btn-warning" : "btn-primary"}`}
              onClick={handleMarkAttendance}
              disabled={
                !selectedDate || markingLoading || loadingDateAttendance
              }
            >
              {markingLoading ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  Loading...
                </>
              ) : loadingDateAttendance ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  Checking...
                </>
              ) : isFullyMarked ? (
                <>
                  <Edit size={18} />
                  Update Attendance
                </>
              ) : isPartiallyMarked ? (
                <>
                  <AlertTriangle size={18} />
                  Complete/Update Attendance
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Mark Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="staff-attendance-staffattendancepage-quick-stats">
        <div className="stat-card">
          <div className="staff-attendance-staffattendancepage-stat-icon" style={{ background: "#dcfce7" }}>
            <UserCheck size={24} color="#10b981" />
          </div>
          <div className="staff-attendance-staffattendancepage-stat-info">
            <p className="stat-label">Present</p>
            <p className="stat-value">{todayStats.present}</p>
            <p className="stat-subtext">Out of {totalStaffCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancepage-stat-icon" style={{ background: "#fee2e2" }}>
            <UserX size={24} color="#ef4444" />
          </div>
          <div className="staff-attendance-staffattendancepage-stat-info">
            <p className="stat-label">Absent</p>
            <p className="stat-value">{todayStats.absent}</p>
            <p className="stat-subtext">Out of {totalStaffCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancepage-stat-icon" style={{ background: "#fef3c7" }}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="staff-attendance-staffattendancepage-stat-info">
            <p className="stat-label">Late</p>
            <p className="stat-value">{todayStats.late}</p>
            <p className="stat-subtext">Out of {totalStaffCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancepage-stat-icon" style={{ background: "#dbeafe" }}>
            <CalendarDays size={24} color="#3b82f6" />
          </div>
          <div className="staff-attendance-staffattendancepage-stat-info">
            <p className="stat-label">On Leave</p>
            <p className="stat-value">{todayStats.onLeave}</p>
            <p className="stat-subtext">Out of {totalStaffCount}</p>
          </div>
        </div>
      </div>
      {/* Date Selector */}
      <div className="staff-attendance-staffattendancepage-control-panel">
        <div className="date-selector">
          <div className="staff-attendance-staffattendancepage-selector-group">
            <label htmlFor="date">
              <Calendar size={16} />
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min={getMinDate()}
              className="date-input"
            />
            {!isDateAllowed(selectedDate) && (
              <div className="staff-attendance-staffattendancepage-date-warning">
                <AlertTriangle size={14} />
                <span>Date must be within past 3 days</span>
              </div>
            )}
          </div>

          <div className="staff-attendance-staffattendancepage-selector-group">
            <button
              className="btn staff-attendance-staffattendancepage-btn-secondary"
              onClick={refreshAttendanceData}
              disabled={loading || loadingDateAttendance || !selectedDate}
            >
              <RefreshCw size={16} />
              {loading || loadingDateAttendance ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>
      {/* Status Information */}
      {selectedDate && (
        <div className="staff-attendance-staffattendancepage-status-info">
          <div className="staff-attendance-staffattendancepage-status-card">
            <div className="staff-attendance-staffattendancepage-status-header">
              <Calendar size={18} />
              <h4>
                Attendance Status for {formatDateForDisplay(selectedDate)}
              </h4>
            </div>
            <div className="staff-attendance-staffattendancepage-status-body">
              {isFullyMarked ? (
                <div className="staff-attendance-staffattendancepage-already-marked">
                  <CheckCircle size={20} color="#10b981" />
                  <div>
                    <p>
                      <strong>✓ Attendance Fully Marked</strong>
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      {markedStaffCount} of {totalStaffCount} staff members
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      Click "Update Attendance" to make changes
                    </p>
                  </div>
                </div>
              ) : isPartiallyMarked ? (
                <div className="partially-marked">
                  <AlertTriangle size={20} color="#f59e0b" />
                  <div>
                    <p>
                      <strong>⚠ Attendance Partially Marked</strong>
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      {markedStaffCount} of {totalStaffCount} staff members
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      Click "Complete/Update Attendance" to finish marking
                    </p>
                  </div>
                </div>
              ) : (
                <div className="staff-attendance-staffattendancepage-ready-to-mark">
                  <UserCheck size={20} color="#10b981" />
                  <div>
                    <p>
                      <strong>Ready to mark attendance</strong>
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      {totalStaffCount} staff members
                    </p>
                    <p className="staff-attendance-staffattendancepage-small-text">
                      Click "Mark Attendance" to start
                    </p>
                  </div>
                </div>
              )}

              {dateAttendance.length > 0 && (
                <div className="attendance-summary">
                  <p className="summary-title">Current Attendance:</p>
                  <div className="summary-stats">
                    <span className="summary-item present">
                      <UserCheck size={12} /> {todayStats.present} Present
                    </span>
                    <span className="summary-item absent">
                      <UserX size={12} /> {todayStats.absent} Absent
                    </span>
                    <span className="summary-item late">
                      <Clock size={12} /> {todayStats.late} Late
                    </span>
                    <span className="summary-item leave">
                      <CalendarDays size={12} /> {todayStats.onLeave} Leave
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="staff-attendance-staffattendancepage-main-content">
        {showMarking ? (
          <StaffAttendanceMarking
            date={selectedDate}
            staffMembers={staffMembers}
            existingAttendance={dateAttendance}
            onSave={handleSaveAttendance}
            onCancel={() => setShowMarking(false)}
          />
        ) : (
          <div className="staff-attendance-staffattendancepage-empty-state">
            <Calendar size={48} />
            <h3>No Attendance Selected</h3>
            <p>Select a date and click "Mark Attendance" to begin.</p>
          </div>
        )}
      </div>
      {/* Error Display */}
      {error && (
        <div className="staff-attendance-staffattendancepage-error-banner">
          <AlertCircle size={20} />
          <span>Error: {error}</span>
          <button
            className="btn staff-attendance-staffattendancepage-btn-sm staff-attendance-staffattendancepage-btn-secondary"
            onClick={refreshAttendanceData}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffAttendancePage;
