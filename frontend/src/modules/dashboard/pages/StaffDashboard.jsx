// src/modules/dashboard/pages/StaffDashboard.jsx - COMPLETE FILE
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../store/slices/authSlice";
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  Clock,
  DollarSign,
  Package,
  Bell,
  Settings,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import CompanyLogo from "../../../assets/images/logos/sophor-logo.jpg";
import "./StaffDashboard.css";

const StaffDashboard = ({ isHR = false, isAccountant = false, isLibrarian = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [stats, setStats] = useState({
    attendance: 95,
    pendingTasks: 3,
    leaveBalance: 15,
    salaryDue: 0,
  });

  useEffect(() => {
    // Fetch staff-specific data
    const fetchStaffData = async () => {
      try {
        // You'll need to implement API call here
        // const response = await api.get(`/staff/${user.id}/dashboard`);
        // setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch staff data:", error);
      }
    };

    if (user) {
      fetchStaffData();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Determine dashboard type
  const getDashboardType = () => {
    if (isHR) return "HR Dashboard";
    if (isAccountant) return "Accountant Dashboard";
    if (isLibrarian) return "Librarian Dashboard";
    return "Staff Dashboard";
  };

  // Get role-specific menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        id: "dashboard",
        icon: "BarChart3",
        label: "Dashboard",
        path: "/staff/dashboard",
      },
      {
        id: "attendance",
        icon: "Clock",
        label: "Attendance",
        path: "/staff/attendance",
      },
      {
        id: "leave",
        icon: "Calendar",
        label: "Leave",
        path: "/staff/leave",
      },
      {
        id: "profile",
        icon: "UserCircle",
        label: "Profile",
        path: "/staff/profile",
      },
    ];

    if (isHR) {
      return [
        ...baseItems,
        {
          id: "staff-management",
          icon: "Users",
          label: "Staff Management",
          path: "/hr/staff",
        },
        {
          id: "payroll",
          icon: "DollarSign",
          label: "Payroll",
          path: "/hr/payroll",
        },
        {
          id: "recruitment",
          icon: "UserPlus",
          label: "Recruitment",
          path: "/hr/recruitment",
        },
      ];
    }

    if (isAccountant) {
      return [
        ...baseItems,
        {
          id: "accounts",
          icon: "DollarSign",
          label: "Accounts",
          path: "/accountant/accounts",
        },
        {
          id: "fees",
          icon: "FileText",
          label: "Fee Management",
          path: "/accountant/fees",
        },
        {
          id: "reports",
          icon: "BarChart3",
          label: "Financial Reports",
          path: "/accountant/reports",
        },
      ];
    }

    if (isLibrarian) {
      return [
        ...baseItems,
        {
          id: "books",
          icon: "BookOpen",
          label: "Books",
          path: "/library/books",
        },
        {
          id: "members",
          icon: "Users",
          label: "Members",
          path: "/library/members",
        },
        {
          id: "transactions",
          icon: "RefreshCw",
          label: "Transactions",
          path: "/library/transactions",
        },
      ];
    }

    return baseItems;
  };

  // Get role-specific quick stats
  const getQuickStats = () => {
    const baseStats = [
      {
        label: "Attendance",
        value: `${stats.attendance}%`,
        trend: "This month",
      },
      {
        label: "Pending Tasks",
        value: stats.pendingTasks.toString(),
        trend: "To complete",
      },
      {
        label: "Leave Balance",
        value: stats.leaveBalance.toString(),
        trend: "Days remaining",
      },
      {
        label: "Salary Due",
        value: `$${stats.salaryDue}`,
        trend: "Next payment",
      },
    ];

    if (isHR) {
      return [
        { label: "Total Staff", value: "45", trend: "Active employees" },
        { label: "Open Positions", value: "3", trend: "To fill" },
        { label: "Pending Leave", value: "8", trend: "Requests" },
        { label: "This Month Payroll", value: "$45,000", trend: "Total" },
      ];
    }

    if (isAccountant) {
      return [
        { label: "Revenue", value: "$85,000", trend: "This month" },
        { label: "Pending Fees", value: "$12,500", trend: "To collect" },
        { label: "Expenses", value: "$42,000", trend: "This month" },
        { label: "Profit", value: "$43,000", trend: "Net" },
      ];
    }

    if (isLibrarian) {
      return [
        { label: "Total Books", value: "5,240", trend: "In collection" },
        { label: "Active Members", value: "320", trend: "Students & Staff" },
        { label: "Books Issued", value: "45", trend: "Today" },
        { label: "Overdue Books", value: "3", trend: "To collect" },
      ];
    }

    return baseStats;
  };

  // Get role-specific quick actions
  const getQuickActions = () => {
    const baseActions = [
      {
        id: "mark-attendance",
        icon: "Clock",
        label: "Mark Attendance",
        path: "/staff/attendance/mark",
      },
      {
        id: "apply-leave",
        icon: "Calendar",
        label: "Apply Leave",
        path: "/staff/leave/apply",
      },
      {
        id: "view-payslip",
        icon: "FileText",
        label: "View Payslip",
        path: "/staff/salary",
      },
      {
        id: "update-profile",
        icon: "UserCircle",
        label: "Update Profile",
        path: "/staff/profile/edit",
      },
    ];

    if (isHR) {
      return [
        {
          id: "add-staff",
          icon: "UserPlus",
          label: "Add New Staff",
          path: "/hr/staff/add",
        },
        {
          id: "process-payroll",
          icon: "DollarSign",
          label: "Process Payroll",
          path: "/hr/payroll/process",
        },
        {
          id: "view-applications",
          icon: "FileText",
          label: "View Applications",
          path: "/hr/recruitment/applications",
        },
        {
          id: "generate-reports",
          icon: "BarChart3",
          label: "Generate Reports",
          path: "/hr/reports",
        },
      ];
    }

    return baseActions;
  };

  const menuItems = getMenuItems();
  const quickStats = getQuickStats();
  const quickActions = getQuickActions();
  const dashboardType = getDashboardType();

  return (
    <div className="dashboard-staffdashboard-staff-dashboard">
      {/* Sidebar */}
      <div className={`dashboard-staffdashboard-sidebar ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <div className="dashboard-staffdashboard-sidebar-content">
          <div className="dashboard-staffdashboard-sidebar-header">
            <div className="dashboard-staffdashboard-logo">
              <img
                src={CompanyLogo}
                alt="Sophor Technologies"
                className="dashboard-staffdashboard-logo-img"
              />
              {!sidebarCollapsed && (
                <span className="dashboard-staffdashboard-logo-text">SophorERP</span>
              )}
            </div>
            <button
              className="dashboard-staffdashboard-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

          <nav className="dashboard-staffdashboard-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = require("lucide-react")[item.icon] || UserCircle;
              return (
                <button
                  key={item.id}
                  className="dashboard-staffdashboard-nav-item"
                  onClick={() => handleNavigate(item.path)}
                  title={item.label}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="dashboard-staffdashboard-sidebar-footer">
            <div className="dashboard-staffdashboard-user-info">
              <div className="dashboard-staffdashboard-user-avatar">
                {user?.name?.charAt(0) || "S"}
              </div>
              {!sidebarCollapsed && (
                <div className="dashboard-staffdashboard-user-details">
                  <div className="dashboard-staffdashboard-user-name">{user?.name || "Staff"}</div>
                  <div className="dashboard-staffdashboard-user-role">
                    {isHR ? "HR Manager" : isAccountant ? "Accountant" : isLibrarian ? "Librarian" : "Staff"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`dashboard-staffdashboard-main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        <header className="dashboard-staffdashboard-main-header">
          <div className="dashboard-staffdashboard-header-container">
            <div className="dashboard-staffdashboard-header-info">
              <h1>{dashboardType}</h1>
              <p>Welcome back, {user?.name || "Staff Member"}</p>
            </div>
            <button className="dashboard-staffdashboard-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="dashboard-staffdashboard-content-area">
          {/* Stats Section */}
          <section className="dashboard-staffdashboard-stats-section">
            <h2>Overview</h2>
            <div className="stats-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="dashboard-staffdashboard-stat-number">{stat.value}</div>
                  <div className="dashboard-staffdashboard-stat-title">{stat.label}</div>
                  <div className="dashboard-staffdashboard-stat-trend">{stat.trend}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="dashboard-staffdashboard-actions-section">
            <h2>Quick Actions</h2>
            <div className="dashboard-staffdashboard-actions-grid">
              {quickActions.map((action) => {
                const Icon = require("lucide-react")[action.icon] || UserCircle;
                return (
                  <button
                    key={action.id}
                    className="dashboard-staffdashboard-action-btn"
                    onClick={() => handleNavigate(action.path)}
                  >
                    <Icon size={24} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-staffdashboard-activity-section">
            <h2>Recent Activity</h2>
            <div className="dashboard-staffdashboard-activity-list">
              <div className="dashboard-staffdashboard-activity-item">
                <div className="dashboard-staffdashboard-activity-icon">
                  <Bell size={16} />
                </div>
                <div className="dashboard-staffdashboard-activity-content">
                  <div className="dashboard-staffdashboard-activity-text">
                    {isHR
                      ? "New staff application received"
                      : isAccountant
                      ? "Fee payment received from student"
                      : isLibrarian
                      ? "New book added to collection"
                      : "Attendance marked for today"}
                  </div>
                  <div className="dashboard-staffdashboard-activity-time">2 hours ago</div>
                </div>
              </div>
              <div className="dashboard-staffdashboard-activity-item">
                <div className="dashboard-staffdashboard-activity-icon">
                  <Calendar size={16} />
                </div>
                <div className="dashboard-staffdashboard-activity-content">
                  <div className="dashboard-staffdashboard-activity-text">
                    {isHR
                      ? "Payroll processed for month"
                      : isAccountant
                      ? "Financial report generated"
                      : isLibrarian
                      ? "Book returned by student"
                      : "Leave request submitted"}
                  </div>
                  <div className="dashboard-staffdashboard-activity-time">1 day ago</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;