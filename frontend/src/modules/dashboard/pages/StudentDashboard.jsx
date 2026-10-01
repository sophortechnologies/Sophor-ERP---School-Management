// src/modules/dashboard/pages/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../store/slices/authSlice";
import {
  LogOut,
  Menu,
  X,
  Calendar,
  BookOpen,
  Award,
  Clock,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  FileText,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import api from "../../../api/axios";
import CompanyLogo from "../../../assets/images/logos/sophor-logo.jpg";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [feeSummary, setFeeSummary] = useState({
    totalDue: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStudentData = async () => {
      try {
        setLoading(true);

        // 1. Resolve student database ID via search
        let resolvedStudentId = user?.student_id;
        if (!resolvedStudentId) {
          const searchIdentifier = user?.email || user?.username;
          if (searchIdentifier) {
            try {
              const searchRes = await api.get("/students/search", {
                params: { q: searchIdentifier },
              });
              if (searchRes.data?.length > 0) {
                resolvedStudentId = searchRes.data[0].id;
              }
            } catch (e) {
              console.warn("Student search error:", e);
            }
          }
        }

        // 2. Fetch Dashboard Metrics from GET /students/:id/dashboard
        if (resolvedStudentId) {
          try {
            const dashRes = await api.get(
              `/students/${resolvedStudentId}/dashboard`,
            );
            setDashboardData(dashRes.data?.data || dashRes.data);
          } catch (dashErr) {
            console.error("Error fetching student dashboard:", dashErr);
          }

          // 3. Fetch Fee Summary from GET /billing/bills/student/:studentId
          try {
            const billsRes = await api.get(
              `/billing/bills/student/${resolvedStudentId}`,
            );
            const bills = billsRes.data?.data || billsRes.data || [];
            const pending = bills.filter((b) => b.status !== "PAID");
            const totalDue = pending.reduce(
              (acc, b) => acc + (parseFloat(b.amount) || 0),
              0,
            );
            setFeeSummary({ totalDue, pendingCount: pending.length });
          } catch (feeErr) {
            console.warn("Could not load bills:", feeErr.message);
          }
        }

        // 4. Fetch Schedule from GET /timetables/my
        try {
          const timeRes = await api.get("/timetables/my");
          const slots = timeRes.data || [];
          if (Array.isArray(slots)) {
            const days = [
              "SUNDAY",
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
            ];
            const currentDay = days[new Date().getDay()];
            const todays = slots.filter(
              (s) => (s.dayOfWeek || "").toUpperCase() === currentDay,
            );
            setTodaySchedule(todays.length > 0 ? todays : slots.slice(0, 3));
          }
        } catch (timeErr) {
          console.warn("Could not load timetable:", timeErr.message);
        }
      } catch (err) {
        console.error("Error setting up student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudentData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const studentName =
    dashboardData?.profile?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Student";

  const menuItems = [
    {
      id: "dashboard",
      icon: GraduationCap,
      label: "Dashboard",
      path: "/student/dashboard",
    },
    {
      id: "grades",
      icon: Award,
      label: "My Grades",
      path: "/student/grades",
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Class Schedule",
      path: "/student/timetable",
    },
    {
      id: "attendance",
      icon: ClipboardCheck,
      label: "Attendance",
      path: "/student/attendance",
    },
    {
      id: "fees",
      icon: DollarSign,
      label: "Fee Statements",
      path: "/student/fees",
    },
  ];

  const attendanceRate =
    dashboardData?.attendance?.last30?.percentage != null
      ? `${dashboardData.attendance.last30.percentage}%`
      : dashboardData?.attendance?.overall?.percentage != null
        ? `${dashboardData.attendance.overall.percentage}%`
        : "100%";

  const presentDays =
    dashboardData?.attendance?.last30?.present ??
    dashboardData?.attendance?.overall?.presentDays ??
    0;

  const quickStats = [
    {
      label: "Attendance Rate",
      value: attendanceRate,
      icon: ClipboardCheck,
      color: "#1b633b",
    },
    {
      label: "Days Present",
      value: presentDays.toString(),
      icon: Award,
      color: "#3b82f6",
    },
    {
      label: "Class & Section",
      value: dashboardData?.profile?.class
        ? `${dashboardData.profile.class} - ${dashboardData.profile.section || "A"}`
        : "Grade 10 - A",
      icon: BookOpen,
      color: "#f59e0b",
    },
    {
      label: "Fee Balance",
      value: `${feeSummary.totalDue} ETB`,
      icon: DollarSign,
      color: feeSummary.totalDue > 0 ? "#ef4444" : "#10b981",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#172b4c", fontWeight: "600" }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-studentdashboard-student-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <div className="sidebar-content">
          <div className="dashboard-studentdashboard-sidebar-header">
            <div className="dashboard-studentdashboard-logo">
              <img src={CompanyLogo} alt="Sophor Logo" className="logo-img" />
              {!sidebarCollapsed && (
                <span className="dashboard-studentdashboard-logo-text">
                  SophorERP
                </span>
              )}
            </div>
            <button
              className="dashboard-studentdashboard-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

          <nav className="dashboard-studentdashboard-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`dashboard-studentdashboard-nav-item ${item.id === "dashboard" ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="dashboard-studentdashboard-sidebar-footer">
            <div className="dashboard-studentdashboard-user-info">
              <div className="dashboard-studentdashboard-user-avatar">
                {studentName.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="dashboard-studentdashboard-user-details">
                  <div className="dashboard-studentdashboard-user-name">
                    {studentName}
                  </div>
                  <div className="dashboard-studentdashboard-user-role">
                    Student
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}
      >
        <header className="main-header">
          <div className="header-container">
            <div className="header-info">
              <h1>Student Dashboard</h1>
              <p>Welcome back, {studentName}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="content-area">
          {/* Top Metric Cards */}
          <section className="dashboard-studentdashboard-stats-section">
            <h2>Academic Overview</h2>
            <div className="stats-grid">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stat-card">
                    <div
                      className="stat-icon"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon size={24} color={stat.color} />
                    </div>
                    <div>
                      <div className="stat-number">{stat.value}</div>
                      <div className="stat-title">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Performance Trends & Today's Schedule */}
          <div
            className="dashboard-studentdashboard-two-cols"
            style={{ marginBottom: "1.5rem" }}
          >
            {/* Today's Schedule Card */}
            <div className="dashboard-studentdashboard-box">
              <h2>Today's Class Schedule</h2>
              {todaySchedule.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {todaySchedule.map((slot, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "4px solid #1b633b",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", color: "#172b4c" }}>
                          {slot.subject?.name ||
                            slot.subjectName ||
                            "Core Subject"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {slot.room
                            ? `Room: ${slot.room}`
                            : "Standard Classroom"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#1b633b",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        <Clock size={15} />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No classes scheduled for today.
                </p>
              )}
            </div>

            {/* Performance Trend from backend performanceTrend */}
            <div className="dashboard-studentdashboard-box">
              <h2>Academic Performance Trend</h2>
              {dashboardData?.performanceTrend &&
              dashboardData.performanceTrend.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {dashboardData.performanceTrend.map((trend, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "600", color: "#172b4c" }}>
                          {trend.examName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {trend.examDate
                            ? new Date(trend.examDate).toLocaleDateString()
                            : "Term Evaluation"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", color: "#3b82f6" }}>
                          {trend.avgPercentage}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#166534" }}>
                          Average
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No historical exam trends recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Results & Upcoming Exams */}
          <div className="dashboard-studentdashboard-two-cols">
            <div className="dashboard-studentdashboard-box">
              <h2>Recent Published Results</h2>
              {dashboardData?.latestResults &&
              dashboardData.latestResults.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {dashboardData.latestResults.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "4px solid #1b633b",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "600", color: "#172b4c" }}>
                          {r.subjectName || "Subject"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {r.examName || "Term Exam"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", color: "#1b633b" }}>
                          {r.percentage}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Grade: {r.grade || "A"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No exam results published yet.
                </p>
              )}
            </div>

            <div className="dashboard-studentdashboard-box">
              <h2>Upcoming School Exams</h2>
              {dashboardData?.upcomingExams &&
              dashboardData.upcomingExams.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {dashboardData.upcomingExams.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "4px solid #f59e0b",
                      }}
                    >
                      <div style={{ fontWeight: "600", color: "#172b4c" }}>
                        {e.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Start Date: {new Date(e.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No upcoming exams scheduled.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
