// src/modules/timetable/pages/ViewTimetablePage.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewTimetablePage.css";
import TimetableView from "../components/TimetableView";
import ConflictChecker from "../components/ConflictChecker/ConflictChecker";
import timetableService from "../services/timetable.service";
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config.js";

const ViewTimetablePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [viewType, setViewType] = useState("weekly");
  const [stats, setStats] = useState({
    teachingPeriods: 0,
    freePeriods: 0,
    labSessions: 0,
    practicalSessions: 0,
    teachers: 0,
    subjects: 0,
    rooms: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    if (id) {
      loadTimetableData();
    }
  }, [id]);

  const loadTimetableData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📅 Loading timetable ${id}...`);

      const timetableData = await timetableService.getTimetableById(id);

      if (!timetableData) {
        throw new Error("Timetable not found");
      }

      console.log("✅ Timetable loaded:", timetableData);
      setTimetable(timetableData);

      await loadRealTeachers();
      calculateStatistics(timetableData);
    } catch (err) {
      console.error("❌ Error loading timetable:", err);
      setError(err.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const loadRealTeachers = async () => {
    try {
      console.log("👨‍🏫 Loading REAL teachers from backend...");

      let teachersData = [];

      try {
        const response = await api.get(API_ENDPOINTS.TEACHERS.BASE);
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            teachersData = response.data.data;
          } else if (Array.isArray(response.data)) {
            teachersData = response.data;
          }
        }
      } catch (teachersError) {
        console.log("🔄 /teachers failed, trying /teacher...");
        const fallbackResponse = await api.get("/teacher");
        if (fallbackResponse.data) {
          if (
            fallbackResponse.data.data &&
            Array.isArray(fallbackResponse.data.data)
          ) {
            teachersData = fallbackResponse.data.data;
          } else if (Array.isArray(fallbackResponse.data)) {
            teachersData = fallbackResponse.data;
          }
        }
      }

      const displayTeachers = teachersData.map((teacher) => ({
        id: teacher.id || teacher._id,
        name:
          teacher.name ||
          `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        specialization: teacher.specialization || teacher.qualification,
        subjects: teacher.subjects || [],
      }));

      setTeachers(displayTeachers);
      console.log(`✅ Loaded ${displayTeachers.length} REAL teachers`);
    } catch (error) {
      console.error("❌ Error loading teachers:", error);
      setTeachers([]);
    }
  };

  const calculateStatistics = (timetableData) => {
    if (!timetableData) return;

    let teachingPeriods = 0;
    let freePeriods = 0;
    let labSessions = 0;
    let practicalSessions = 0;
    const uniqueTeachers = new Set();
    const uniqueSubjects = new Set();
    const uniqueRooms = new Set();

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    days.forEach((day) => {
      const daySchedule = timetableData[day] || [];

      daySchedule.forEach((period) => {
        if (!period || period.isBreak) {
          return;
        }

        if (
          !period.subjectName ||
          period.subjectName === "Free" ||
          period.subjectName === ""
        ) {
          freePeriods++;
        } else {
          teachingPeriods++;

          if (period.teacherName && period.teacherName !== "Teacher") {
            uniqueTeachers.add(period.teacherName);
          }

          if (period.subjectName && period.subjectName !== "Subject") {
            uniqueSubjects.add(period.subjectName);
          }

          if (period.roomNumber) {
            uniqueRooms.add(period.roomNumber);
          }

          if (period.type === "lab") {
            labSessions++;
          } else if (period.type === "practical") {
            practicalSessions++;
          }
        }
      });
    });

    const totalPeriods = teachingPeriods + freePeriods;
    const utilizationRate =
      totalPeriods > 0
        ? ((teachingPeriods / totalPeriods) * 100).toFixed(1)
        : 0;

    setStats({
      teachingPeriods,
      freePeriods,
      labSessions,
      practicalSessions,
      teachers: uniqueTeachers.size,
      subjects: uniqueSubjects.size,
      rooms: uniqueRooms.size,
      utilizationRate: parseFloat(utilizationRate),
    });
  };

  // Convert slots to the format expected by TimetableView
  const convertSlotsToTimetable = (slots) => {
    if (!slots || !Array.isArray(slots)) return [];

    return slots.map((slot) => ({
      ...slot,
      dayOfWeek: slot.dayOfWeek,
      formattedStartTime: new Date(slot.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      formattedEndTime: new Date(slot.endTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format) => {
    try {
      console.log(`📥 Exporting timetable as ${format}...`);
      alert(`${format.toUpperCase()} export feature is being implemented.`);
    } catch (error) {
      console.error(`❌ Error exporting ${format}:`, error);
      alert(`Export feature coming soon!`);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/timetable/edit/${id}`);
  };

  const handleDuplicate = async () => {
    if (window.confirm("Duplicate this timetable?")) {
      try {
        alert("Duplicate feature coming soon!");
      } catch (error) {
        console.error("❌ Error duplicating timetable:", error);
        alert("Duplicate feature coming soon!");
      }
    }
  };

  const handlePublish = async () => {
    if (
      window.confirm(
        "Publish this timetable? It will become active for all users.",
      )
    ) {
      try {
        await api.patch(`/timetables/${id}`, { status: "active" });
        alert("Timetable published successfully!");
        loadTimetableData();
      } catch (error) {
        console.error("❌ Error publishing timetable:", error);
        alert("Publish feature coming soon!");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { className: "draft", label: "Draft" },
      active: { className: "active", label: "Active" },
      inactive: { className: "inactive", label: "Inactive" },
      archived: { className: "archived", label: "Archived" },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return (
      <span className={`status-badge ${config.className}`}>{config.label}</span>
    );
  };

  if (loading) {
    return (
      <div className="timetable-viewtimetablepage-view-timetable-page">
        <div className="timetable-viewtimetablepage-loading-state">
          <div className="timetable-viewtimetablepage-loading-spinner"></div>
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-viewtimetablepage-view-timetable-page">
        <div className="timetable-viewtimetablepage-error-state">
          <div className="error-icon">❌</div>
          <h3>Failed to Load Timetable</h3>
          <p>{error}</p>
          <button onClick={loadTimetableData} className="timetable-viewtimetablepage-retry-btn">
            🔄 Retry
          </button>
          <button
            onClick={() => navigate("/admin/timetable")}
            className="back-btn"
          >
            ← Back to Timetables
          </button>
        </div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="timetable-viewtimetablepage-view-timetable-page">
        <div className="timetable-viewtimetablepage-empty-state">
          <div className="timetable-viewtimetablepage-empty-state-icon">📅</div>
          <h3>Timetable Not Found</h3>
          <p>The requested timetable could not be found.</p>
          <button
            onClick={() => navigate("/admin/timetable")}
            className="timetable-viewtimetablepage-header-button primary"
          >
            ← Back to Timetables
          </button>
        </div>
      </div>
    );
  }

  const timetableInfo = timetable.info || {};

  // Get slots - check if timetable has slots array or use the days structure
  let slotsArray = [];
  if (timetable.slots && Array.isArray(timetable.slots)) {
    slotsArray = timetable.slots;
  } else {
    // Convert from days structure to slots array
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    days.forEach((day) => {
      const daySlots = timetable[day] || [];
      daySlots.forEach((slot) => {
        slotsArray.push({
          ...slot,
          dayOfWeek: day.toUpperCase().substring(0, 3),
        });
      });
    });
  }

  const convertedSlots = convertSlotsToTimetable(slotsArray);

  return (
    <div className="timetable-viewtimetablepage-view-timetable-page">
      <div className="timetable-viewtimetablepage-page-header">
        <div className="timetable-viewtimetablepage-header-content">
          <div className="header-title">
            <h1>{timetableInfo.name || "Timetable"}</h1>
            <div className="header-subtitle">
              {timetableInfo.className && (
                <span className="class-info">{timetableInfo.className}</span>
              )}
              {timetableInfo.sectionName && (
                <span className="section-info">
                  {" "}
                  - Section {timetableInfo.sectionName}
                </span>
              )}
            </div>
          </div>

          <div className="timetable-viewtimetablepage-header-actions">
            <button
              className="timetable-viewtimetablepage-header-button"
              onClick={() => handleExport("pdf")}
              title="Export as PDF"
            >
              📥 Export PDF
            </button>
            <button
              className="timetable-viewtimetablepage-header-button"
              onClick={() => handleExport("excel")}
              title="Export as Excel"
            >
              📊 Export Excel
            </button>
            <button
              className="timetable-viewtimetablepage-header-button"
              onClick={handlePrint}
              title="Print Timetable"
            >
              🖨️ Print
            </button>
            <button
              className="timetable-viewtimetablepage-header-button"
              onClick={handleDuplicate}
              title="Duplicate Timetable"
            >
              📋 Duplicate
            </button>
            <button
              className="timetable-viewtimetablepage-header-button primary"
              onClick={handleEdit}
              title="Edit Timetable"
            >
              ✏️ Edit
            </button>
            {timetableInfo.status === "draft" && (
              <button
                className="timetable-viewtimetablepage-header-button success"
                onClick={handlePublish}
                title="Publish Timetable"
              >
                🚀 Publish
              </button>
            )}
          </div>
        </div>

        <div className="timetable-viewtimetablepage-timetable-info-bar">
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Academic Year</span>
            <span className="timetable-viewtimetablepage-info-value">
              {timetableInfo.academicYear || "N/A"}
            </span>
          </div>
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Semester</span>
            <span className="timetable-viewtimetablepage-info-value">
              {timetableInfo.semester || "N/A"}
            </span>
          </div>
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Class & Section</span>
            <span className="timetable-viewtimetablepage-info-value">
              {timetableInfo.className || "N/A"}
              {timetableInfo.sectionName && ` - ${timetableInfo.sectionName}`}
            </span>
          </div>
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Valid From</span>
            <span className="timetable-viewtimetablepage-info-value">
              {formatDate(timetableInfo.startDate)}
            </span>
          </div>
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Valid To</span>
            <span className="timetable-viewtimetablepage-info-value">
              {formatDate(timetableInfo.endDate)}
            </span>
          </div>
          <div className="timetable-viewtimetablepage-info-item">
            <span className="timetable-viewtimetablepage-info-label">Status</span>
            <span className="timetable-viewtimetablepage-info-value">
              {getStatusBadge(timetableInfo.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="timetable-viewtimetablepage-view-options">
        <h3>View Options</h3>
        <div className="timetable-viewtimetablepage-view-buttons">
          <button
            className={`timetable-viewtimetablepage-view-button ${viewType === "weekly" ? "active" : ""}`}
            onClick={() => setViewType("weekly")}
          >
            📅 Weekly View
          </button>
          <button
            className={`timetable-viewtimetablepage-view-button ${viewType === "teacher" ? "active" : ""}`}
            onClick={() => setViewType("teacher")}
          >
            👨‍🏫 Teacher View
          </button>
          <button
            className={`timetable-viewtimetablepage-view-button ${viewType === "room" ? "active" : ""}`}
            onClick={() => setViewType("room")}
          >
            🏫 Room View
          </button>
          <button
            className={`timetable-viewtimetablepage-view-button ${viewType === "compact" ? "active" : ""}`}
            onClick={() => setViewType("compact")}
          >
            📱 Compact View
          </button>
        </div>
      </div>

      <div className="timetable-viewtimetablepage-timetable-content">
        <TimetableView
          timetable={convertedSlots}
          title={`${timetableInfo.className || ""} - ${timetableInfo.sectionName || ""} Timetable`}
          viewType={viewType}
        />
      </div>

      <div className="timetable-viewtimetablepage-timetable-stats">
        <h3>Timetable Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.teachingPeriods}</span>
            <span className="stat-label">Teaching Periods</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.freePeriods}</span>
            <span className="stat-label">Free Periods</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.labSessions}</span>
            <span className="stat-label">Lab Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.practicalSessions}</span>
            <span className="stat-label">Practical Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.teachers}</span>
            <span className="stat-label">Teachers</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.subjects}</span>
            <span className="stat-label">Subjects</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.rooms}</span>
            <span className="stat-label">Rooms</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.utilizationRate}%</span>
            <span className="stat-label">Utilization Rate</span>
          </div>
        </div>
      </div>

      <div className="conflict-checker-section">
        <ConflictChecker
          timetableData={timetable}
          onConflictsResolved={(unresolvedConflicts) => {
            console.log("Unresolved conflicts:", unresolvedConflicts);
          }}
        />
      </div>

      <div className="timetable-viewtimetablepage-teacher-section">
        <h3>Teaching Staff</h3>
        {teachers.length > 0 ? (
          <div className="timetable-viewtimetablepage-teachers-list">
            {teachers.slice(0, 5).map((teacher) => (
              <div key={teacher.id} className="timetable-viewtimetablepage-teacher-item">
                <div className="timetable-viewtimetablepage-teacher-header">
                  <div className="timetable-viewtimetablepage-teacher-avatar">
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="timetable-viewtimetablepage-teacher-info">
                    <h4>{teacher.name}</h4>
                    <p>{teacher.subjects?.length || 0} subjects</p>
                    {teacher.specialization && (
                      <p className="teacher-specialization">
                        {teacher.specialization}
                      </p>
                    )}
                  </div>
                </div>
                <div className="timetable-viewtimetablepage-teacher-subjects">
                  {teacher.subjects?.slice(0, 3).map((subject, idx) => (
                    <span key={idx} className="timetable-viewtimetablepage-subject-tag">
                      {subject}
                    </span>
                  ))}
                  {teacher.subjects?.length > 3 && (
                    <span className="timetable-viewtimetablepage-subject-tag more">
                      +{teacher.subjects.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-teachers">
            <p>No teachers found in the system.</p>
            <button className="btn-secondary" onClick={loadRealTeachers}>
              🔄 Refresh Teachers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTimetablePage;
