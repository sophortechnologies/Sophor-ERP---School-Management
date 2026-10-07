// src/modules/dashboard/components/Sidebar/Sidebar.jsx
import React from "react";
import { Menu, X } from "lucide-react";
import CompanyLogo from "../../../../assets/images/logos/sophor-logo.jpg";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

const menuItems = [
  {
    id: "academic-sessions",
    icon: "Calendar",
    label: "Academic Sessions",
    path: "/admin/academic-sessions",
  },

  {
    id: "calendar",
    icon: "Calendar",
    label: "Academic Calendar",
    path: "/admin/utilities/calendar",
  },
  {
    id: "admission",
    icon: "UserPlus",
    label: "Admissions",
    path: "/admin/admissions",
  },

  {
    id: "analytics",
    icon: "TrendingUp",
    label: "Analytics (Reports)",
    path: "/admin/analytics",
  },
  {
    id: "attendance",
    icon: "ClipboardCheck",
    label: "Attendance",
    path: "/admin/attendance",
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
    id: "dashboard",
    icon: "BarChart3",
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    id: "departments",
    icon: "Building2",
    label: "Department Management",
    path: "/admin/departments",
  },
  {
    id: "email",
    icon: "Mail",
    label: "Email Center",
    path: "/admin/utilities/email",
  },
  {
    id: "employees",
    icon: "Users",
    label: "Employees",
    path: "/admin/employees",
  },
  {
    id: "exam-setup",
    icon: "Calendar",
    label: "Exam Setup",
    path: "/admin/examination/setup",
  },
  {
    id: "fee-accounting",
    icon: "DollarSign",
    label: "Fee Accounting",
    path: "/admin/fee-accounting",
  },
  {
    id: "fee-setup",
    icon: "Settings",
    label: "Fee Setup",
    path: "/admin/fee-setup",
  },
  {
    id: "grade-scales",
    icon: "Award",
    label: "Grade Scales",
    path: "/admin/examination/grade-scales",
  },
  {
    id: "hr",
    icon: "ClipboardCheck",
    label: "HR & Payroll",
    path: "/admin/hr",
  },
  {
    id: "inventory",
    icon: "Package",
    label: "Inventory & Assets",
    path: "/admin/assets",
  },
  {
    id: "library",
    icon: "Library",
    label: "Library",
    path: "/admin/library",
  },
  {
    id: "marks-entry",
    icon: "Edit3",
    label: "Marks Entry",
    path: "/admin/examination/marks-entry",
  },
  {
    id: "parents",
    icon: "Users", // Or your icon library's equivalent (e.g., "UserCheck", "Family")
    label: "Parents",
    path: "/admin/parents",
  },
  {
    id: "notifications",
    icon: "Bell",
    label: "Notifications",
    path: "/admin/notifications",
  },
  {
    id: "reports",
    icon: "FileText",
    label: "Reports",
    path: "/admin/reports",
  },
  {
    id: "report-cards",
    icon: "FileText",
    label: "Report Cards",
    path: "/admin/examination/report-cards",
  },
  {
    id: "payroll-management",
    icon: "DollarSign",
    label: "Payroll Management",
    path: "/admin/payroll",
  },
  {
    id: "salary-structures",
    icon: "FileText",
    label: "Salary Structures",
    path: "/admin/payroll/structures",
  },
  {
    id: "school-configuration",
    icon: "Settings",
    label: "School Configuration",
    path: "/admin/school-configuration",
  },
  {
    id: "holidays",
    icon: "Sun",
    label: "School Holidays",
    path: "/admin/utilities/holidays",
  },

  {
    id: "settings",
    icon: "Settings",
    label: "Settings",
    path: "/admin/settings",
  },
  {
    id: "staff-attendance",
    icon: "ClipboardCheck",
    label: "Staff Attendance",
    path: "/admin/staff-attendance/attendance",
  },
  {
    id: "staff-leave",
    icon: "CalendarDays",
    label: "Staff Leave",
    path: "/admin/staff-attendance/leave",
  },
  {
    id: "staff",
    icon: "UserCircle",
    label: "Staff Management",
    path: "/admin/staff",
  },
  {
    id: "students",
    icon: "Users",
    label: "Student Management",
    path: "/admin/students",
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
    id: "teachers",
    icon: "UserCircle",
    label: "Teacher Management",
    path: "/admin/teachers",
  },
  {
    id: "timetable",
    icon: "Calendar",
    label: "Timetable",
    path: "/admin/timetable",
  },
];

const Sidebar = ({ collapsed, onToggle, onNavigate }) => {
  return (
    <div
      className={`dashboard-sidebar-sidebar-sidebar ${collapsed ? "collapsed" : "expanded"}`}
    >
      <div className="dashboard-sidebar-sidebar-sidebar-content">
        <div className="dashboard-sidebar-sidebar-sidebar-header">
          <div className="dashboard-sidebar-sidebar-logo">
            <img
              src={CompanyLogo}
              alt="Sophor Technologies"
              className="dashboard-sidebar-sidebar-logo-img"
            />
            {!collapsed && (
              <span className="dashboard-sidebar-sidebar-logo-text">
                SophorERP
              </span>
            )}
          </div>
          <button
            className="dashboard-sidebar-sidebar-sidebar-toggle"
            onClick={onToggle}
          >
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
                <div className="dashboard-sidebar-sidebar-user-name">
                  Administrator
                </div>
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
