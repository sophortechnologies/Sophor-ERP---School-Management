// src/modules/dashboard/components/Sidebar/Sidebar.jsx
import React from "react";
import { Menu, X } from "lucide-react";
import CompanyLogo from "../../../../assets/images/logos/sophor-logo.jpg";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

const menuItems = [
  {
    id: "dashboard",
    icon: "BarChart3",
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    id: "students",
    icon: "Users",
    label: "Student Management",
    path: "/admin/students",
  },
  {
    id: "admission",
    icon: "UserPlus",
    label: "Admissions",
    path: "/admin/admissions",
  },
  {
    id: "staff",
    icon: "UserCircle",
    label: "Staff Management",
    path: "/admin/staff",
  },
  // Update these menu items:
  {
    id: "staff-attendance",
    icon: "ClipboardCheck",
    label: "Staff Attendance",
    path: "/admin/staff-attendance/attendance", // Explicitly point to attendance sub-route
  },
  {
    id: "staff-leave",
    icon: "CalendarDays",
    label: "Staff Leave",
    path: "/admin/staff-attendance/leave", // Use the same base path with leave sub-route
  },
  {
    id: "hr",
    icon: "ClipboardCheck",
    label: "HR & Payroll",
    path: "/admin/hr",
  },
  {
    id: "attendance",
    icon: "ClipboardCheck",
    label: "Attendance",
    path: "/admin/attendance",
  },
  {
    id: "academic-sessions", // ADD THIS NEW MENU ITEM
    icon: "Calendar",
    label: "Academic Sessions",
    path: "/admin/academic-sessions",
  },
  {
    id: "academics",
    icon: "BookOpen",
    label: "Academics",
    path: "/admin/academics",
  },
  // src/modules/dashboard/components/Sidebar/Sidebar.jsx
  // Add these items to your menuItems array:

  {
    id: "exam-setup",
    icon: "Calendar",
    label: "Exam Setup",
    path: "/admin/examination",
  },
  {
    id: "marks-entry",
    icon: "Edit3",
    label: "Marks Entry",
    path: "/admin/examination/marks-entry",
  },
  {
    id: "moderation",
    icon: "CheckCircle",
    label: "Moderation",
    path: "/admin/examination/moderation",
  },
  {
    id: "report-cards",
    icon: "FileText",
    label: "Report Cards",
    path: "/admin/examination/report-cards",
  },
  {
    id: "exam-analytics",
    icon: "BarChart3",
    label: "Analytics",
    path: "/admin/examination/analytics",
  },
  {
    id: "grade-scales",
    icon: "Award",
    label: "Grade Scales",
    path: "/admin/examination/grade-scales",
  },
  {
    id: "departments", // NEW: Department Management
    icon: "Building2",
    label: "Department Management",
    path: "/admin/departments",
  },
  // Add these menu items to your sidebar menuItems array
  {
    id: "teachers",
    icon: "UserCircle",
    label: "Teacher Management",
    path: "/admin/teachers",
  },
  {
    id: "subjects",
    icon: "BookOpen",
    label: "Subject Management",
    path: "/admin/subjects",
  },
  {
    id: "teacher-class-subject-assignment",
    icon: "GraduationCap",
    label: "Teacher - Class - Subject Assignment",
    path: "/admin/teacher-class-subject-assignment",
  },
  {
    id: "fee-accounting",
    icon: "DollarSign",
    label: "Fee Accounting",
    path: "/admin/fee-accounting", // Direct to collection page
  },
  {
    id: "library",
    icon: "Library",
    label: "Library",
    path: "/admin/library",
  },
  {
    id: "timetable",
    icon: "Calendar",
    label: "Timetable",
    path: "/admin/timetable",
  },
  {
    id: "inventory",
    icon: "Package",
    label: "Inventory & Assets",
    path: "/admin/assets",
  },
  {
    id: "budget",
    icon: "DollarSign",
    label: "Budget Management",
    path: "/admin/budget",
  },
  {
    id: "communication",
    icon: "MessageSquare",
    label: "Communication",
    path: "/admin/communication",
  },
  {
    id: "notifications", // NEW: Add this line
    icon: "Bell", // Use Bell icon for notifications
    label: "Notifications", // Label for the menu
    path: "/admin/notifications", // Route to your notification module
  },
  {
    id: "reports",
    icon: "FileText",
    label: "Reports",
    path: "/admin/reports",
  },
  {
    id: "analytics",
    icon: "TrendingUp",
    label: "Analytics",
    path: "/admin/analytics",
  },
  {
    id: "settings",
    icon: "Settings",
    label: "Settings",
    path: "/admin/settings",
  },
];

const Sidebar = ({ collapsed, onToggle, onNavigate }) => {
  return (
    <div className={`dashboard-sidebar-sidebar-sidebar ${collapsed ? "collapsed" : "expanded"}`}>
      <div className="dashboard-sidebar-sidebar-sidebar-content">
        <div className="dashboard-sidebar-sidebar-sidebar-header">
          <div className="dashboard-sidebar-sidebar-logo">
            <img
              src={CompanyLogo}
              alt="Sophor Technologies"
              className="dashboard-sidebar-sidebar-logo-img"
            />
            {!collapsed && <span className="dashboard-sidebar-sidebar-logo-text">SophorERP</span>}
          </div>
          <button className="dashboard-sidebar-sidebar-sidebar-toggle" onClick={onToggle}>
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="dashboard-sidebar-sidebar-sidebar-nav">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="dashboard-sidebar-sidebar-sidebar-footer">
          <div className="dashboard-sidebar-sidebar-user-info">
            <div className="dashboard-sidebar-sidebar-user-avatar">A</div>
            {!collapsed && (
              <div className="dashboard-sidebar-sidebar-user-details">
                <div className="dashboard-sidebar-sidebar-user-name">Administrator</div>
                <div className="dashboard-sidebar-sidebar-user-role">Admin</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
