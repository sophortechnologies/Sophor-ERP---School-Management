// src/modules/dashboard/utils/dashboardHelpers.js - COMPLETE FILE
import { USER_ROLES } from "../../../constants/roles";

/**
 * Get dashboard configuration based on user role
 */
export const getDashboardConfig = (userRole) => {
  const configs = {
    [USER_ROLES.ADMIN]: {
      title: "Admin Dashboard",
      subtitle: "System Administration & Management",
      colorTheme: "blue",
      modules: [
        "students",
        "staff",
        "finance",
        "academics",
        "reports",
        "settings",
      ],
      canManage: true,
      isAdmin: true,
    },
    [USER_ROLES.TEACHER]: {
      title: "Teacher Dashboard",
      subtitle: "Teaching & Student Management",
      colorTheme: "green",
      modules: ["attendance", "grades", "students", "timetable", "assignments"],
      canManage: false,
      isTeacher: true,
    },
    [USER_ROLES.STUDENT]: {
      title: "Student Dashboard",
      subtitle: "Learning Portal",
      colorTheme: "purple",
      modules: ["profile", "grades", "attendance", "timetable", "assignments"],
      canManage: false,
      isStudent: true,
    },
    [USER_ROLES.PARENT]: {
      title: "Parent Dashboard",
      subtitle: "Child Monitoring & Communication",
      colorTheme: "orange",
      modules: ["children", "grades", "attendance", "fees", "messages"],
      canManage: false,
      isParent: true,
    },
    [USER_ROLES.STAFF]: {
      title: "Staff Dashboard",
      subtitle: "Staff Portal",
      colorTheme: "indigo",
      modules: ["attendance", "leave", "profile", "documents"],
      canManage: false,
      isStaff: true,
    },
    [USER_ROLES.HR]: {
      title: "HR Dashboard",
      subtitle: "Human Resources Management",
      colorTheme: "teal",
      modules: ["staff", "payroll", "leave", "recruitment", "reports"],
      canManage: true,
      isHR: true,
    },
    [USER_ROLES.ACCOUNTANT]: {
      title: "Accountant Dashboard",
      subtitle: "Financial Management",
      colorTheme: "amber",
      modules: ["accounts", "fees", "payroll", "reports", "invoices"],
      canManage: true,
      isAccountant: true,
    },
    [USER_ROLES.LIBRARIAN]: {
      title: "Librarian Dashboard",
      subtitle: "Library Management",
      colorTheme: "pink",
      modules: ["books", "members", "transactions", "inventory", "reports"],
      canManage: true,
      isLibrarian: true,
    },
  };

  return configs[userRole] || configs[USER_ROLES.STAFF];
};

/**
 * Get quick actions based on user role
 */
export const getQuickActions = (userRole, userId = null) => {
  const baseActions = {
    [USER_ROLES.ADMIN]: [
      { label: "Add Student", path: "/admin/students/admission", icon: "UserPlus" },
      { label: "Add Staff", path: "/admin/staff/add", icon: "UserPlus" },
      { label: "Create Class", path: "/admin/classes/create", icon: "BookOpen" },
      { label: "Generate Report", path: "/admin/reports", icon: "FileText" },
      { label: "System Settings", path: "/admin/settings", icon: "Settings" },
    ],
    [USER_ROLES.TEACHER]: [
      { label: "Mark Attendance", path: "/teacher/attendance", icon: "ClipboardCheck" },
      { label: "Enter Grades", path: "/teacher/grades", icon: "GraduationCap" },
      { label: "Create Assignment", path: "/teacher/assignments", icon: "BookOpen" },
      { label: "View Timetable", path: "/teacher/timetable", icon: "Calendar" },
      { label: "Send Message", path: "/teacher/messages", icon: "MessageSquare" },
    ],
    [USER_ROLES.STUDENT]: [
      { label: "View Grades", path: `/student/${userId}/grades`, icon: "Award" },
      { label: "Attendance", path: `/student/${userId}/attendance`, icon: "Calendar" },
      { label: "Timetable", path: `/student/${userId}/timetable`, icon: "Clock" },
      { label: "Assignments", path: `/student/${userId}/assignments`, icon: "BookOpen" },
      { label: "Fee Status", path: `/student/${userId}/fees`, icon: "DollarSign" },
    ],
    [USER_ROLES.PARENT]: [
      { label: "View Children", path: `/parent/${userId}/children`, icon: "Users" },
      { label: "Check Grades", path: `/parent/${userId}/grades`, icon: "Award" },
      { label: "Attendance", path: `/parent/${userId}/attendance`, icon: "Calendar" },
      { label: "Fee Payments", path: `/parent/${userId}/fees`, icon: "DollarSign" },
      { label: "Messages", path: `/parent/${userId}/messages`, icon: "MessageSquare" },
    ],
    [USER_ROLES.STAFF]: [
      { label: "Mark Attendance", path: "/staff/attendance", icon: "Clock" },
      { label: "Apply Leave", path: "/staff/leave/apply", icon: "Calendar" },
      { label: "View Payslip", path: "/staff/salary", icon: "FileText" },
      { label: "Update Profile", path: "/staff/profile", icon: "UserCircle" },
      { label: "Documents", path: "/staff/documents", icon: "Folder" },
    ],
    [USER_ROLES.HR]: [
      { label: "Add Staff", path: "/hr/staff/add", icon: "UserPlus" },
      { label: "Process Payroll", path: "/hr/payroll", icon: "DollarSign" },
      { label: "Leave Requests", path: "/hr/leave", icon: "Calendar" },
      { label: "Recruitment", path: "/hr/recruitment", icon: "Briefcase" },
      { label: "Reports", path: "/hr/reports", icon: "FileText" },
    ],
    [USER_ROLES.ACCOUNTANT]: [
      { label: "Fee Collection", path: "/accountant/fees", icon: "DollarSign" },
      { label: "Expenses", path: "/accountant/expenses", icon: "TrendingDown" },
      { label: "Reports", path: "/accountant/reports", icon: "FileText" },
      { label: "Invoices", path: "/accountant/invoices", icon: "Receipt" },
      { label: "Payroll", path: "/accountant/payroll", icon: "CreditCard" },
    ],
    [USER_ROLES.LIBRARIAN]: [
      { label: "Add Book", path: "/library/books/add", icon: "BookPlus" },
      { label: "Issue Book", path: "/library/transactions/issue", icon: "BookOpen" },
      { label: "Members", path: "/library/members", icon: "Users" },
      { label: "Reports", path: "/library/reports", icon: "FileText" },
      { label: "Inventory", path: "/library/inventory", icon: "Package" },
    ],
  };

  return baseActions[userRole] || baseActions[USER_ROLES.STAFF];
};

/**
 * Get dashboard statistics endpoint based on role
 */
export const getDashboardStatsEndpoint = (userRole, userId) => {
  const endpoints = {
    [USER_ROLES.ADMIN]: "/dashboard/admin",
    [USER_ROLES.TEACHER]: `/dashboard/teacher/${userId}`,
    [USER_ROLES.STUDENT]: `/dashboard/student/${userId}`,
    [USER_ROLES.PARENT]: `/dashboard/parent/${userId}`,
    [USER_ROLES.STAFF]: `/dashboard/staff/${userId}`,
    [USER_ROLES.HR]: `/dashboard/hr/${userId}`,
    [USER_ROLES.ACCOUNTANT]: `/dashboard/accountant/${userId}`,
    [USER_ROLES.LIBRARIAN]: `/dashboard/library/${userId}`,
  };

  return endpoints[userRole] || "/dashboard/stats";
};

/**
 * Check if user has access to a specific module
 */
export const hasModuleAccess = (userRole, module) => {
  const config = getDashboardConfig(userRole);
  return config.modules.includes(module) || config.canManage;
};

/**
 * Format dashboard data for display
 */
export const formatDashboardData = (rawData, userRole) => {
  if (!rawData) return {};

  const baseStats = {
    total: rawData.total || 0,
    today: rawData.today || 0,
    pending: rawData.pending || 0,
    completed: rawData.completed || 0,
  };

  // Add role-specific formatting
  switch (userRole) {
    case USER_ROLES.ADMIN:
      return {
        ...baseStats,
        revenue: rawData.revenue || 0,
        activeUsers: rawData.activeUsers || 0,
        systemHealth: rawData.systemHealth || "Good",
      };
    case USER_ROLES.TEACHER:
      return {
        ...baseStats,
        averageGrade: rawData.averageGrade || 0,
        attendanceRate: rawData.attendanceRate || 0,
        assignmentsDue: rawData.assignmentsDue || 0,
      };
    case USER_ROLES.STUDENT:
      return {
        ...baseStats,
        averageScore: rawData.averageScore || 0,
        attendancePercentage: rawData.attendancePercentage || 0,
        feesDue: rawData.feesDue || 0,
      };
    default:
      return baseStats;
  }
};

/**
 * Get color theme for dashboard
 */
export const getDashboardTheme = (userRole) => {
  const themes = {
    [USER_ROLES.ADMIN]: {
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      accent: "#60a5fa",
    },
    [USER_ROLES.TEACHER]: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#34d399",
    },
    [USER_ROLES.STUDENT]: {
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#a78bfa",
    },
    [USER_ROLES.PARENT]: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#fbbf24",
    },
    [USER_ROLES.STAFF]: {
      primary: "#6366f1",
      secondary: "#4f46e5",
      accent: "#818cf8",
    },
  };

  return themes[userRole] || themes[USER_ROLES.STAFF];
};