// src/modules/dashboard/pages/TeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../store/slices/authSlice";
import {
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  Menu,
  X,
  Calendar,
  MessageSquare,
  FileText,
  ClipboardCheck,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import api from "../../../api/axios";
import CompanyLogo from "../../../assets/images/logos/sophor-logo.jpg";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teacher/dashboard");
        console.log("Dashboard data:", response.data);
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setDashboardData({
          teacher: { name: user?.name || "Teacher" },
          summary: {
            totalStudents: 0,
            totalClasses: 0,
            totalSubjects: 0,
            upcomingExams: 0,
          },
          classes: [],
          upcomingExams: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // src/modules/dashboard/pages/TeacherDashboard.jsx - Add this useEffect for timetable

  const [timetable, setTimetable] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Fetch teacher's timetable separately
  useEffect(() => {
    const fetchTeacherTimetable = async () => {
      try {
        setLoadingTimetable(true);
        // Use the /my endpoint which gets the logged-in user's timetable
        const response = await api.get("/timetables/my");
        console.log("Teacher timetable from /my:", response.data);

        // Transform the data
        const formattedTimetable = (response.data || []).map((slot) => ({
          ...slot,
          dayOfWeek: slot.dayOfWeek,
          subjectName: slot.subject?.name || slot.subjectName,
          className: slot.section?.class?.name,
          sectionName: slot.section?.name,
          formattedStartTime: new Date(slot.startTime).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            },
          ),
          formattedEndTime: new Date(slot.endTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        }));

        setTimetable(formattedTimetable);
      } catch (err) {
        console.error("Error fetching teacher timetable:", err);
        setTimetable([]);
      } finally {
        setLoadingTimetable(false);
      }
    };

    fetchTeacherTimetable();
  }, []);
  const menuItems = [
    {
      id: "dashboard",
      icon: BarChart3,
      label: "Dashboard",
      path: "/teacher/dashboard",
    },
    {
      id: "students",
      icon: Users,
      label: "My Students",
      path: "/teacher/students",
    },
    {
      id: "attendance",
      icon: ClipboardCheck,
      label: "Attendance",
      path: "/teacher/attendance",
    },
    {
      id: "grades",
      icon: GraduationCap,
      label: "Grades",
      path: "/teacher/grades",
    },
    {
      id: "timetable",
      icon: Calendar,
      label: "My Schedule",
      path: "/teacher/timetable",
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      path: "/teacher/communication",
    }, // ← FIXED: points to communication module
    {
      id: "profile",
      icon: UserCircle,
      label: "Profile",
      path: "/teacher/profile",
    },
  ];

  const quickStats = [
    {
      label: "Total Students",
      value: dashboardData?.summary?.totalStudents?.toString() || "0",
      icon: Users,
      color: "#3b82f6",
    },
    {
      label: "Classes",
      value: dashboardData?.summary?.totalClasses?.toString() || "0",
      icon: BookOpen,
      color: "#10b981",
    },
    {
      label: "Subjects",
      value: dashboardData?.summary?.totalSubjects?.toString() || "0",
      icon: GraduationCap,
      color: "#f59e0b",
    },
    {
      label: "Upcoming Exams",
      value: dashboardData?.summary?.upcomingExams?.toString() || "0",
      icon: Calendar,
      color: "#ef4444",
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-teacherdashboard-teacher-dashboard">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <div className="sidebar-content">
          <div className="dashboard-teacherdashboard-sidebar-header">
            <div className="dashboard-teacherdashboard-logo">
              <img
                src={CompanyLogo}
                alt="Sophor Technologies"
                className="logo-img"
              />
              {!sidebarCollapsed && (
                <span className="dashboard-teacherdashboard-logo-text">
                  SophorERP
                </span>
              )}
            </div>
            <button
              className="dashboard-teacherdashboard-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
          <nav className="dashboard-teacherdashboard-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="dashboard-teacherdashboard-nav-item"
                  onClick={() => handleNavigate(item.path)}
                  title={item.label}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="dashboard-teacherdashboard-sidebar-footer">
            <div className="dashboard-teacherdashboard-user-info">
              <div className="dashboard-teacherdashboard-user-avatar">
                {dashboardData?.teacher?.name?.charAt(0) || "T"}
              </div>
              {!sidebarCollapsed && (
                <div className="dashboard-teacherdashboard-user-details">
                  <div className="dashboard-teacherdashboard-user-name">
                    {dashboardData?.teacher?.name || "Teacher"}
                  </div>
                  <div className="dashboard-teacherdashboard-user-role">
                    Teacher
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}
      >
        <header className="main-header">
          <div className="header-container">
            <div className="header-info">
              <h1>Teacher Dashboard</h1>
              <p>
                Welcome back,{" "}
                {dashboardData?.teacher?.name ||
                  (user?.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : user?.username) ||
                  "Teacher"}
              </p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="content-area">
          <section className="dashboard-teacherdashboard-stats-section">
            <h2>Overview</h2>
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
                    <div className="stat-info">
                      <div className="stat-number">{stat.value}</div>
                      <div className="stat-title">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="dashboard-teacherdashboard-actions-section">
            <h2>Quick Actions</h2>
            <div className="dashboard-teacherdashboard-actions-grid">
              <button
                className="action-btn"
                onClick={() => handleNavigate("/teacher/attendance")}
              >
                <ClipboardCheck size={24} />
                <span>Mark Attendance</span>
              </button>
              <button
                className="action-btn"
                onClick={() => handleNavigate("/teacher/grades")}
              >
                <GraduationCap size={24} />
                <span>Enter Grades</span>
              </button>
              <button
                className="action-btn"
                onClick={() => handleNavigate("/teacher/timetable")}
              >
                <Calendar size={24} />
                <span>View Schedule</span>
              </button>
              <button
                className="action-btn"
                onClick={() => handleNavigate("/teacher/communication")}
              >
                <MessageSquare size={24} />
                <span>Send Message</span>
              </button>
            </div>
          </section>

          <section className="classes-section">
            <h2>My Classes</h2>
            <div className="classes-list">
              {dashboardData?.classes && dashboardData.classes.length > 0 ? (
                dashboardData.classes.map((cls, index) => (
                  <div key={index} className="class-card">
                    <div className="class-header">
                      <div className="class-name">{cls.className}</div>
                      <div className="class-subject">{cls.subjectName}</div>
                    </div>
                    <div className="class-stats">
                      <Users size={14} />
                      <span>{cls.statistics?.totalStudents || 0} Students</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <BookOpen size={32} />
                  <p>No classes assigned yet</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
