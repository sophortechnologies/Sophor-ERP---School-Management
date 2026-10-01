import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Upload,
  BarChart3,
  Bell,
  Plus,
  Search,
  Eye,
  Edit,
  Printer,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAttendance } from "../hooks/useAttendance";
import {
  AttendanceMarking,
  AttendanceReport,
  BulkUploadModal,
} from "../components";
import { ATTENDANCE_STATUS } from "../constants";
import { holidayService } from "../services/holidays";
import { attendanceApi } from "../api/attendance.api";
import { transformBackendData } from "../utils/attendanceHelpers";
import "./AttendanceManagement.css";

const getPastDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split("T")[0];
};

const AttendanceManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    attendance,
    classes,
    students,
    loading,
    error,
    stats,
    loadInitialData,
    loadStudentsByClass,
    loadAttendanceByDateClass,
    markAttendance,
    bulkUploadAttendance,
    uploadAttendanceFile,
    getAttendanceStats,
    generateReport,
    sendAbsenteeNotifications,
    searchAttendance,
    exportAttendance,
    refreshData,
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("marking");
  const [showMarking, setShowMarking] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [reportStats, setReportStats] = useState({
    summary: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      presentPercentage: 0,
      absentPercentage: 0,
    },
    dailyStats: [],
    classWiseStats: [],
    topAttendees: [],
    frequentAbsentees: [],
  });

  // Fix: Calculate attendance for specific date/class
  const attendanceForSelectedDateClass = React.useMemo(() => {
    if (!selectedDate || !selectedClass) return [];

    return attendance.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      const selectedDateFormatted = new Date(selectedDate)
        .toISOString()
        .split("T")[0];

      return (
        recordDate === selectedDateFormatted && record.classId == selectedClass
      );
    });
  }, [attendance, selectedDate, selectedClass]);

  useEffect(() => {
    console.log("Attendance Management loaded at path:", location.pathname);
    loadInitialData();
  }, [loadInitialData, location]);

  // Load all attendance when component mounts
  useEffect(() => {
    const loadAllAttendance = async () => {
      console.log("🚀 Loading all attendance data...");

      try {
        const response = await attendanceApi.getAttendance({
          limit: 1000,
          sort: "-date",
        });

        if (response.success) {
          const transformedData = transformBackendData(response.data);
          console.log(
            `✅ Loaded ${transformedData.length} total attendance records`,
          );
        }
      } catch (error) {
        console.error("Error loading all attendance:", error);
      }
    };

    loadAllAttendance();
  }, []);

  // Load data when class or date changes
  useEffect(() => {
    const loadData = async () => {
      if (selectedClass && selectedDate) {
        console.log(
          `🔄 Loading data for class ${selectedClass}, date ${selectedDate}`,
        );

        console.log("Step 1: Loading students...");
        const studentsResult = await loadStudentsByClass(selectedClass);
        console.log("Students loaded result:", {
          success: studentsResult.success,
          count: studentsResult.data?.length || 0,
          message: studentsResult.message,
          isMock: studentsResult.isMock,
        });

        console.log("Step 2: Loading attendance...");
        const attendanceResult = await loadAttendanceByDateClass(
          selectedDate,
          selectedClass,
        );
        console.log("Attendance loaded result:", {
          success: attendanceResult.success,
          count: attendanceResult.data?.length || 0,
          message: attendanceResult.message,
        });

        console.log("Step 3: Applying filters...");
        applyFilters();
      }
    };

    loadData();
  }, [selectedClass, selectedDate]);

  // Load stats when class/date changes
  useEffect(() => {
    const loadInitialStats = async () => {
      if (selectedClass) {
        console.log("📊 Loading initial stats for class:", selectedClass);
        try {
          const statsResult = await getAttendanceStats({
            classId: selectedClass,
            startDate: selectedDate,
            endDate: selectedDate,
          });

          if (statsResult.success) {
            console.log("✅ Stats loaded:", statsResult.data);
            setReportStats(statsResult.data);
          }
        } catch (error) {
          console.error("Error loading stats:", error);
        }
      }
    };

    loadInitialStats();
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    console.log("=== DEBUG ATTENDANCE DATA ===");
    console.log("Selected Class ID:", selectedClass);
    console.log("Selected Date:", selectedDate);
    console.log("Students Array Length:", students.length);
    console.log("Attendance Array Length:", attendance.length);
    console.log("Classes Available:", classes);
    console.log("Filtered Attendance:", filteredAttendance.length);

    if (selectedClass) {
      const selectedClassObj = classes.find(
        (c) =>
          c.id === selectedClass ||
          c._id === selectedClass ||
          c.classId === selectedClass,
      );
      console.log("Selected Class Object:", selectedClassObj);
    }

    console.log("=== END DEBUG ===");
  }, [
    selectedClass,
    selectedDate,
    students,
    attendance,
    classes,
    filteredAttendance,
  ]);

  const applyFilters = () => {
    console.log("🔄 Applying filters...", {
      attendanceCount: attendance.length,
      selectedClass,
      selectedDate,
      searchTerm,
      filterStatus,
    });

    let result = [...attendance];

    const normalizeDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch {
        return dateStr;
      }
    };

    // Filter by date if selected
    if (selectedDate) {
      const normalizedSelectedDate = normalizeDate(selectedDate);
      result = result.filter((record) => {
        const recordDate = normalizeDate(record.date);
        return recordDate === normalizedSelectedDate;
      });
      console.log(
        `After date filter (${selectedDate}): ${result.length} records`,
      );
    }

    // Filter by class if selected
    if (selectedClass && selectedClass !== "") {
      result = result.filter((record) => {
        const recordClassId =
          record.classId || record.class?.id || record.class?._id;
        return recordClassId == selectedClass;
      });
      console.log(
        `After class filter (${selectedClass}): ${result.length} records`,
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (record) =>
          record.studentName?.toLowerCase().includes(term) ||
          record.studentId?.toString().toLowerCase().includes(term) ||
          record.rollNumber?.toString().toLowerCase().includes(term),
      );
      console.log(
        `After search filter (${searchTerm}): ${result.length} records`,
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      const normalizedFilterStatus = filterStatus.toUpperCase();
      result = result.filter(
        (record) =>
          (record.status || "").toUpperCase() === normalizedFilterStatus,
      );
      console.log(
        `After status filter (${filterStatus}): ${result.length} records`,
      );
    }

    console.log("✅ Final filtered records:", result);
    setFilteredAttendance(result);
  };

  const handleDateChange = async (date) => {
    console.log("Selected date:", date);
    console.log("Is weekend?", holidayService.isWeekend(date));
    console.log("Is holiday?", holidayService.isHoliday(date));
    console.log("Holiday name:", holidayService.getHolidayName(date));

    const isWeekend = holidayService.isWeekend(date);
    const isHoliday = holidayService.isHoliday(date);

    if (isWeekend || isHoliday) {
      const dayType = isWeekend ? "weekend" : "holiday";
      const dayName = isWeekend
        ? new Date(date).getDay() === 0
          ? "Sunday"
          : "Saturday"
        : holidayService.getHolidayName(date);

      alert(`Cannot select ${dayName} (${dayType}) for attendance`);
      return;
    }

    const today = new Date();
    const selected = new Date(date);
    const diffTime = today - selected;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      alert("Cannot mark attendance for future dates");
      return;
    }

    if (diffDays > 3) {
      alert("Attendance can only be marked for dates within the past 3 days");
      return;
    }

    setSelectedDate(date);

    if (selectedClass) {
      await loadAttendanceByDateClass(date, selectedClass);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
  };

  const handleMarkAttendance = async (attendanceData) => {
    const result = await markAttendance(attendanceData);
    if (result.success) {
      alert(result.message || "Attendance saved successfully!");
      setShowMarking(false);

      console.log("🔄 Refreshing ALL data after save...");

      if (selectedClass && selectedDate) {
        await loadAttendanceByDateClass(selectedDate, selectedClass);
      }

      setFilteredAttendance([]);
      applyFilters();

      setSelectedDate((prev) => prev);

      console.log("✅ All data refreshed");
    } else {
      alert(result.error || "Failed to mark attendance");
    }
  };

  const handleBulkUpload = async (uploadData) => {
    const result = await bulkUploadAttendance(uploadData);
    if (result.success) {
      alert(result.message || "Bulk upload successful!");
      setShowBulkUpload(false);

      await refreshData();
      if (selectedClass && selectedDate) {
        await loadAttendanceByDateClass(selectedDate, selectedClass);
      }
    } else {
      alert(result.error || "Bulk upload failed");
    }
  };

  const handleFileUpload = async (file) => {
    const result = await uploadAttendanceFile(file);
    if (result.success) {
      alert(result.message || "File uploaded successfully!");
      await refreshData();
    } else {
      alert(result.error || "File upload failed");
    }
  };

  const handleGenerateReport = async (params) => {
    console.log("📊 Generating report with params:", params);

    if (!params.classId && !selectedClass) {
      alert("Please select a class first");
      return;
    }

    setStatsLoading(true);

    try {
      const reportParams = {
        startDate: params.startDate || selectedDate,
        endDate: params.endDate || selectedDate,
        classId: params.classId || selectedClass,
        reportType: params.reportType || "daily",
      };

      console.log("📋 Final report params:", reportParams);

      const statsResult = await getAttendanceStats(reportParams);

      if (statsResult.success) {
        console.log("✅ Report stats loaded:", statsResult.data);
        setReportStats(statsResult.data);
        alert(
          `Report generated for ${reportParams.startDate} to ${reportParams.endDate}`,
        );
      } else {
        alert(
          "Failed to generate report: " +
            (statsResult.error || "No data available"),
        );
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report: " + error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSendNotifications = async () => {
    if (!selectedClass || !selectedDate) {
      alert("Please select a class and date first");
      return;
    }

    const result = await sendAbsenteeNotifications(selectedDate, selectedClass);
    if (result.success) {
      setNotificationData(result.data);
      setShowNotifications(true);
      alert(result.message || "Notifications sent successfully!");
    } else {
      alert(result.error || "Failed to send notifications");
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchAttendance({
        search: searchTerm,
        status: filterStatus !== "all" ? filterStatus : undefined,
        startDate: selectedDate,
        endDate: selectedDate,
        classId: selectedClass || undefined,
      });
    } else {
      if (selectedClass && selectedDate) {
        await loadAttendanceByDateClass(selectedDate, selectedClass);
      }
    }
  };

  const handleExport = () => {
    if (filteredAttendance.length === 0) {
      alert("No attendance data to export");
      return;
    }

    exportAttendance("csv");
  };

  const calculateTodayStats = () => {
    const normalizeDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch {
        return dateStr;
      }
    };

    const normalizedSelectedDate = normalizeDate(selectedDate);

    const todayRecords = attendance.filter((record) => {
      const recordDate = normalizeDate(record.date);
      const isSameDate = recordDate === normalizedSelectedDate;
      const isSameClass = record.classId == selectedClass;

      return isSameDate && isSameClass;
    });

    console.log("📊 Stats calculation debug:", {
      normalizedSelectedDate,
      selectedClass,
      totalRecords: attendance.length,
      filteredRecords: todayRecords.length,
      filteredRecordsDetails: todayRecords,
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: todayRecords.length,
    };

    todayRecords.forEach((record) => {
      const status = (record.status || "").toUpperCase();
      if (status === "PRESENT") stats.present++;
      else if (status === "ABSENT") stats.absent++;
      else if (status === "LATE") stats.late++;
    });

    return stats;
  };

  const todayStats = calculateTodayStats();
  const selectedClassName =
    classes.find((c) => c.id === selectedClass || c._id === selectedClass)
      ?.name || "";

  if (loading && !attendance.length && !classes.length) {
    return (
      <div className="attendance-attendancemanagement-loading-container">
        <div className="attendance-attendancemanagement-spinner"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (error && !classes.length) {
    return (
      <div className="attendance-attendancemanagement-error-container">
        <p className="attendance-attendancemanagement-error-message">
          Error: {error}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-attendancemanagement-attendance-management">
      {/* Header */}
      <div className="attendance-attendancemanagement-page-header">
        <div className="attendance-attendancemanagement-header-content">
          <div>
            <h1>Student Attendance Management</h1>
            <p>Mark, track, and analyze student attendance</p>
          </div>
          <div className="attendance-attendancemanagement-header-actions">
            <button
              className="btn attendance-attendancemanagement-btn-secondary"
              onClick={() => setViewMode("reports")}
            >
              <BarChart3 size={18} />
              Reports
            </button>
            <button
              className="btn attendance-attendancemanagement-btn-secondary"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload size={18} />
              Bulk Upload
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowMarking(true)}
              disabled={!selectedClass || !selectedDate}
            >
              <Plus size={18} />
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="attendance-attendancemanagement-quick-stats">
        <div className="stat-card">
          <div
            className="attendance-attendancemanagement-stat-icon"
            style={{ background: "#dcfce7" }}
          >
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="attendance-attendancemanagement-stat-info">
            <p className="stat-label">Today's Present</p>
            <p className="stat-value">{todayStats.present}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="attendance-attendancemanagement-stat-icon"
            style={{ background: "#fee2e2" }}
          >
            <XCircle size={24} color="#ef4444" />
          </div>
          <div className="attendance-attendancemanagement-stat-info">
            <p className="stat-label">Today's Absent</p>
            <p className="stat-value">{todayStats.absent}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="attendance-attendancemanagement-stat-icon"
            style={{ background: "#fef3c7" }}
          >
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="attendance-attendancemanagement-stat-info">
            <p className="stat-label">Today's Late</p>
            <p className="stat-value">{todayStats.late}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="attendance-attendancemanagement-stat-icon"
            style={{ background: "#dbeafe" }}
          >
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="attendance-attendancemanagement-stat-info">
            <p className="stat-label">Total Today</p>
            <p className="stat-value">{todayStats.total}</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="attendance-attendancemanagement-control-panel">
        <div className="date-info">
          {selectedDate && (
            <span
              className={`date-status ${
                new Date(selectedDate).toDateString() ===
                new Date().toDateString()
                  ? "today"
                  : "past"
              }`}
            >
              {new Date(selectedDate).toDateString() ===
              new Date().toDateString()
                ? "Today"
                : `${Math.floor((new Date() - new Date(selectedDate)) / (1000 * 60 * 60 * 24))} days ago`}
            </span>
          )}
          {selectedDate && holidayService.isWeekend(selectedDate) && (
            <div className="weekend-warning">
              ⚠️ {holidayService.getDateDifference(selectedDate)} was a weekend
              {holidayService.isWithinAllowedPeriod(selectedDate, 3) &&
                " - Attendance allowed for past dates"}
            </div>
          )}
        </div>

        <div className="attendance-attendancemanagement-date-class-selector">
          <div className="attendance-attendancemanagement-selector-group">
            <label htmlFor="date">
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min={getPastDate(3)}
              className="attendance-attendancemanagement-selector-input"
            />
          </div>

          <div className="attendance-attendancemanagement-selector-group">
            <label htmlFor="class">
              <Users size={16} />
              Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="attendance-attendancemanagement-selector-select"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id || cls._id} value={cls.id || cls._id}>
                  {cls.name} {cls.grade ? `- ${cls.grade}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="attendance-attendancemanagement-selector-group">
            <label htmlFor="refresh">
              <RefreshCw size={16} />
              Actions
            </label>
            <button
              className="btn attendance-attendancemanagement-btn-secondary"
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        <div className="attendance-attendancemanagement-action-buttons">
          <button
            className="btn attendance-attendancemanagement-btn-secondary"
            onClick={handleSendNotifications}
            disabled={
              !selectedClass || !selectedDate || todayStats.absent === 0
            }
            title={
              !selectedClass || !selectedDate
                ? "Select class and date first"
                : todayStats.absent === 0
                  ? "No absent students today"
                  : "Send notifications to absent students' parents"
            }
          >
            <Bell size={16} />
            Notify Absentees
          </button>
          <button
            className="btn attendance-attendancemanagement-btn-secondary"
            onClick={handleExport}
            disabled={filteredAttendance.length === 0}
            title={
              filteredAttendance.length === 0
                ? "No data to export"
                : "Export attendance data"
            }
          >
            <Download size={16} />
            Export
          </button>
          <button
            className="btn attendance-attendancemanagement-btn-secondary"
            onClick={() => window.print()}
            disabled={filteredAttendance.length === 0}
            title={
              filteredAttendance.length === 0
                ? "No data to print"
                : "Print attendance report"
            }
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="attendance-attendancemanagement-search-filter">
        <div className="attendance-attendancemanagement-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn attendance-attendancemanagement-btn-secondary"
            onClick={handleSearch}
            disabled={!selectedClass}
          >
            Search
          </button>
          {searchTerm && (
            <button
              className="btn attendance-attendancemanagement-btn-clear"
              onClick={() => {
                setSearchTerm("");
                if (selectedClass && selectedDate) {
                  loadAttendanceByDateClass(selectedDate, selectedClass);
                }
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="attendance-attendancemanagement-filter-box">
          <label>
            <Filter size={16} />
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="attendance-attendancemanagement-filter-select"
          >
            <option value="all">All Status</option>
            {ATTENDANCE_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="attendance-attendancemanagement-view-toggle">
          <button
            className={`attendance-attendancemanagement-view-btn ${viewMode === "marking" ? "active" : ""}`}
            onClick={() => setViewMode("marking")}
          >
            Marking
          </button>
          <button
            className={`attendance-attendancemanagement-view-btn ${viewMode === "records" ? "active" : ""}`}
            onClick={() => setViewMode("records")}
          >
            Records
          </button>
          <button
            className={`attendance-attendancemanagement-view-btn ${viewMode === "reports" ? "active" : ""}`}
            onClick={() => setViewMode("reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="attendance-attendancemanagement-main-content">
        {viewMode === "reports" ? (
          <div className="reports-section">
            {/* STATUS PANEL */}
            <div
              style={{
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
                📊 Report Status
              </h4>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <strong>Class:</strong> {selectedClassName || "None"}
                </div>
                <div>
                  <strong>Date:</strong> {selectedDate || "None"}
                </div>
                <div>
                  <strong>Total Records:</strong> {attendance.length}
                </div>
                <div>
                  <strong>Matching Records:</strong>{" "}
                  {
                    attendance.filter((a) => {
                      const recordDate = new Date(a.date)
                        .toISOString()
                        .split("T")[0];
                      return (
                        recordDate === selectedDate &&
                        a.classId == selectedClass
                      );
                    }).length
                  }
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-sm attendance-attendancemanagement-btn-secondary"
                  onClick={async () => {
                    if (!selectedClass || !selectedDate) {
                      alert("Select class and date first");
                      return;
                    }
                    await handleGenerateReport({
                      reportType: "daily",
                      startDate: selectedDate,
                      endDate: selectedDate,
                      classId: selectedClass,
                    });
                  }}
                >
                  Test Report
                </button>

                <button
                  className="btn btn-sm attendance-attendancemanagement-btn-secondary"
                  onClick={() => {
                    alert(
                      `Data check:\nTotal: ${attendance.length}\nFor selected date: ${attendance.filter((a) => a.date === selectedDate).length}`,
                    );
                  }}
                >
                  Check Data
                </button>
              </div>
            </div>
            {/* END STATUS PANEL */}

            <AttendanceReport
              stats={reportStats}
              onGenerateReport={handleGenerateReport}
              onExport={handleExport}
              loading={statsLoading}
            />
          </div>
        ) : viewMode === "records" ? (
          <div className="attendance-records">
            <div className="attendance-attendancemanagement-records-header">
              <h2>
                <Calendar size={20} />
                Attendance Records
                <span className="attendance-attendancemanagement-count-badge">
                  {filteredAttendance.length}{" "}
                  {selectedClassName ? `for ${selectedClassName}` : ""}
                </span>
              </h2>
              {selectedDate && (
                <div className="attendance-attendancemanagement-records-date">
                  Date:{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="attendance-attendancemanagement-empty-state">
                <Calendar size={48} />
                <h3>No Attendance Records Found</h3>
                <p>
                  {searchTerm || filterStatus !== "all"
                    ? "Try changing your search or filter criteria"
                    : !selectedClass
                      ? "Please select a class to view attendance records"
                      : "No attendance records found for the selected date"}
                </p>
                {!selectedClass && (
                  <button
                    className="btn btn-primary"
                    onClick={() => document.getElementById("class").focus()}
                  >
                    <Users size={18} />
                    Select a Class
                  </button>
                )}
              </div>
            ) : (
              <div className="attendance-attendancemanagement-records-table-container">
                <table className="attendance-attendancemanagement-records-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Remarks</th>
                      <th>Marked By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => {
                      const statusConfig = ATTENDANCE_STATUS.find(
                        (s) => s.value === record.status,
                      );
                      return (
                        <tr key={record.id || record._id}>
                          <td>
                            <strong className="attendance-attendancemanagement-student-id">
                              {record.studentId}
                            </strong>
                          </td>
                          <td>{record.studentName}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`attendance-attendancemanagement-status-badge status-${record.status}`}
                              style={{
                                backgroundColor: `${statusConfig?.color || "#6b7280"}20`,
                                color: statusConfig?.color || "#6b7280",
                              }}
                            >
                              {statusConfig?.label || record.status}
                            </span>
                          </td>
                          <td>{record.checkInTime || "-"}</td>
                          <td>{record.checkOutTime || "-"}</td>
                          <td className="remarks-cell">
                            {record.remarks || "-"}
                          </td>
                          <td>{record.markedBy || "System"}</td>
                          <td>
                            <div className="attendance-attendancemanagement-record-actions">
                              <button
                                className="attendance-attendancemanagement-btn-icon"
                                onClick={() =>
                                  navigate(`/students/${record.studentId}`)
                                }
                                title="View Student Profile"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="attendance-attendancemanagement-btn-icon"
                                onClick={() => {
                                  setSelectedDate(record.date);
                                  setSelectedClass(record.classId?.toString());
                                  setViewMode("marking");
                                }}
                                title="Edit Attendance Record"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="attendance-marking-section">
            {!selectedClass ? (
              <div className="attendance-attendancemanagement-select-class-prompt">
                <Users size={48} />
                <h3>Select a Class</h3>
                <p>Please select a class and date to mark attendance</p>
                <div className="attendance-attendancemanagement-prompt-actions">
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="attendance-attendancemanagement-class-selector"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map((cls) => (
                      <option key={cls.id || cls._id} value={cls.id || cls._id}>
                        {cls.name} {cls.grade ? `- ${cls.grade}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : attendanceForSelectedDateClass.length === 0 ? (
              <div className="attendance-attendancemanagement-no-attendance-prompt">
                <Calendar size={48} />
                <h3>No Attendance Marked for {selectedDate}</h3>
                <p>
                  Click "Mark Attendance" to start marking attendance for this
                  date
                </p>
                <div className="attendance-attendancemanagement-prompt-info">
                  <div className="attendance-attendancemanagement-info-item">
                    <Users size={16} />
                    <span>
                      Class: <strong>{selectedClassName}</strong>
                    </span>
                  </div>
                  <div className="attendance-attendancemanagement-info-item">
                    <Calendar size={16} />
                    <span>
                      Date:{" "}
                      <strong>
                        {new Date(selectedDate).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                  <div className="attendance-attendancemanagement-info-item">
                    <Users size={16} />
                    <span>
                      Students: <strong>{students.length}</strong>
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowMarking(true)}
                >
                  <Plus size={18} />
                  Mark Attendance
                </button>
              </div>
            ) : (
              <AttendanceMarking
                classId={selectedClass}
                date={selectedDate}
                students={students}
                existingAttendance={attendanceForSelectedDateClass}
                onSave={handleMarkAttendance}
                onCancel={() => setShowMarking(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMarking && selectedClass && (
        <div className="attendance-attendancemanagement-modal-overlay">
          <div className="attendance-attendancemanagement-attendance-modal-content">
            <AttendanceMarking
              classId={selectedClass}
              date={selectedDate}
              students={students}
              existingAttendance={attendanceForSelectedDateClass}
              onSave={handleMarkAttendance}
              onCancel={() => setShowMarking(false)}
            />
          </div>
        </div>
      )}

      {showBulkUpload && (
        <BulkUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
          onFileUpload={handleFileUpload}
        />
      )}

      {showNotifications && notificationData && (
        <div className="attendance-attendancemanagement-modal-overlay">
          <div className="attendance-attendancemanagement-notification-content">
            <div className="attendance-attendancemanagement-notification-header">
              <h3>
                <Bell size={20} />
                Notifications Sent
              </h3>
              <button
                className="attendance-attendancemanagement-close-button"
                onClick={() => setShowNotifications(false)}
              >
                ✕
              </button>
            </div>
            <div className="attendance-attendancemanagement-notification-body">
              <div className="attendance-attendancemanagement-notification-success">
                <CheckCircle size={24} color="#10b981" />
                <p>
                  Successfully sent notifications for{" "}
                  {notificationData.absentCount} absent students!
                </p>
              </div>

              <div className="attendance-attendancemanagement-absentees-list">
                <h4>Absent Students:</h4>
                <ul>
                  {notificationData.absentStudents?.map((student, index) => (
                    <li key={index}>
                      <span className="attendance-attendancemanagement-student-name">
                        {student.studentName}
                      </span>
                      <span className="attendance-attendancemanagement-student-id">
                        ({student.studentId})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="attendance-attendancemanagement-notification-details">
                <div className="attendance-attendancemanagement-detail-item">
                  <Calendar size={16} />
                  <span>
                    Date: {new Date(notificationData.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="attendance-attendancemanagement-detail-item">
                  <Users size={16} />
                  <span>Class: {selectedClassName}</span>
                </div>
              </div>
            </div>
            <div className="attendance-attendancemanagement-notification-footer">
              <button
                className="btn btn-primary"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="attendance-attendancemanagement-error-banner">
          <AlertCircle size={20} />
          <span>Error: {error}</span>
          <button
            className="btn btn-sm attendance-attendancemanagement-btn-secondary"
            onClick={refreshData}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
