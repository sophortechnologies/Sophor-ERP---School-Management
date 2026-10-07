// src/config/swagger.config.js - COMPLETE FILE
export const API_CONFIG = {
  // BASE_URL: import.meta.env.VITE_API_URL || "http://192.168.123.49:5000",
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  TIMEOUT: 90000,
};

export const API_ENDPOINTS = {
  // Authentication - ONE universal login endpoint
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    GET_CURRENT_USER: "/auth/profile",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REGISTER: "/auth/register",
    CHANGE_PASSWORD: "/auth/change-password",
    LOGOUT_ALL: "/auth/logout-all",
    SESSIONS: "/auth/sessions",
    HEALTH: "/auth/health",
  },

  // Students
  STUDENTS: {
    BASE: "/students",
    BY_ID: (id) => `/students/${id}`,
    ATTENDANCE: (id) => `/students/${id}/attendance`,
    GRADES: (id) => `/students/${id}/grades`,
    DOCUMENTS: (id) => `/students/${id}/documents`,
    HISTORY: (id) => `/students/${id}/history`,
    SEARCH: "/students/search",
    STATISTICS: "/students/statistics",
    CHECK_DUPLICATE: "/students/check-duplicate",
    CONFIRMATION: (id) => `/students/${id}/confirmation`,
    DASHBOARD_DATA: (id) => `/students/${id}/dashboard`,
  },

  // Teachers
  TEACHERS: {
    BASE: "/teacher",
    BY_ID: (id) => `/teacher/${id}`,
    REGISTER: "/teachers/register",
    DASHBOARD: "/teachers/dashboard",
    ATTENDANCE_BY_CLASS: (classId) => `/teachers/classes/${classId}/attendance`,
    UPDATE: (id) => `/teachers/${id}`,
    SEARCH: "/teachers/search",
    STATISTICS: "/teachers/statistics",
    PROFILE: (id) => `/teachers/${id}/profile`,
    CLASSES: (teacherId) => `/teacher/${teacherId}/classes`,
    TIMETABLE: (teacherId) => `/teachers/${teacherId}/timetable`,
    STUDENTS: (teacherId) => `/teachers/${teacherId}/students`,
    LEAVE: (teacherId) => `/teachers/${teacherId}/leave`,
    SALARY: (teacherId) => `/teachers/${teacherId}/salary`,
    ATTENDANCE: (teacherId) => `/teachers/${teacherId}/attendance`,
    PERFORMANCE: (teacherId) => `/teachers/${teacherId}/performance`,
  },

  // Staff
  STAFF: {
    BASE: "/staff",
    BY_ID: (id) => `/staff/${id}`,
    REGISTER: "/staff/register",
    STATUS: (id) => `/staff/${id}/status`,
    SEARCH: "/staff/search",
    STATISTICS: "/staff/statistics",
    BULK_IMPORT: "/staff/bulk-import",
    DOCUMENTS: (id) => `/staff/${id}/documents`,
    ATTENDANCE: (id) => `/staff/${id}/attendance`,
    SALARY: (id) => `/staff/${id}/salary`,
    LEAVE: (id) => `/staff/${id}/leave`,
    DASHBOARD_DATA: (id) => `/staff/${id}/dashboard`,
  },

  // Parents
  PARENTS: {
    BASE: "/parents",
    BY_ID: (id) => `/parents/${id}`,
    CHILDREN: (parentId) => `/parents/${parentId}/children`,
    DASHBOARD_DATA: (parentId) => `/parents/${parentId}/dashboard`,
    NOTIFICATIONS: (parentId) => `/parents/${parentId}/notifications`,
  },

  // Academic Sessions
  ACADEMIC_SESSIONS: {
    BASE: "/academic-sessions",
    BY_ID: (id) => `/academic-sessions/${id}`,
  },

  // Classes
  CLASSES: {
    BASE: "/classes",
    BY_ID: (id) => `/classes/${id}`,
    LIST: "/classes/list",
  },

  // Sections
  SECTIONS: {
    BASE: "/sections",
    BY_ID: (id) => `/sections/${id}`,
    BY_CLASS: (classId) => `/classes/${classId}/sections`,
    LIST: "/sections/list",
  },

  // Attendance
  ATTENDANCE: {
    BASE: "/attendance",
    BY_ID: (id) => `/attendance/${id}`,
    STUDENT_ATTENDANCE: (studentId) => `/attendance/student/${studentId}`,
    CLASS_DATE_ATTENDANCE: (classId, date) =>
      `/attendance/class/${classId}/date/${date}`,
    CLASS_REPORT: (classId) => `/attendance/report/${classId}`,
    STUDENT_SUMMARY: (studentId) => `/attendance/summary/student/${studentId}`,
    PARENT_ATTENDANCE: (parentUserId) => `/attendance/parent/${parentUserId}`,
    BULK: "/attendance/bulk",
    UPLOAD: "/attendance/upload",
    STATISTICS: "/attendance/statistics",
    TEACHER_CLASSES: (teacherId) => `/attendance/teacher/${teacherId}/classes`,
    // Add Staff Attendance endpoints
    STAFF: {
      BASE: "/staff-attendance",
      MARK: "/staff-attendance/mark",
      BY_ID: (id) => `/staff-attendance/${id}`,
      USER_ATTENDANCE: (userId) => `/staff-attendance/user/${userId}`,
      TODAY_SUMMARY: "/staff-attendance/today-summary",
      REPORT: "/staff-attendance/report",
      STATISTICS: "/staff-attendance/statistics",
    },
  },

  // Add Staff Leave endpoints
  STAFF_LEAVE: {
    BASE: "/staff-leave",
    APPLY: "/staff-leave/apply",
    MY_LEAVES: "/staff-leave/my-leaves",
    PENDING: "/staff-leave/pending",
    BY_ID: (id) => `/staff-leave/${id}`,
    REVIEW: (id) => `/staff-leave/${id}/review`,
  },

  // Examination Module
  // Examination Module
  EXAMINATION: {
    EXAMS: {
      BASE: "/grading/exams",
      BY_ID: (id) => `/grading/exams/${id}`,
      PUBLISH: (id) => `/grading/exams/${id}/publish`,
      WITH_SUBJECTS: "/grading/exams/with-subjects",
      STATISTICS: (id) => `/grading/exams/${id}/statistics`,
      REPORT_CARDS: (id) => `/grading/exams/${id}/report-cards`,
    },
    EXAM_TYPES: {
      BASE: "/grading/exam-types",
      BY_ID: (id) => `/grading/exam-types/${id}`,
    },
    GRADES: {
      BASE: "/grading/grades",
      BULK: "/grading/grades/bulk",
      STUDENT_GRADES: (studentId) => `/grading/students/${studentId}/grades`,
    },
    RESULTS: {
      BULK: "/grading/results/bulk",
      VERIFY: "/grading/results/verify",
    },
    ANALYTICS: {
      BASE: "/grading/analytics",
      CLASS_PERFORMANCE: (classId) => `/grading/classes/${classId}/performance`,
    },
    GRADE_SCALES: {
      BASE: "/grading/grade-scales",
      CREATE: "/grading/grade-scales",
      INITIALIZE: "/grading/grade-scales/initialize",
    },
    REPORT_CARDS: {
      BASE: "/grading/report-card",
      PUBLISH: "/grading/report-card/publish",
      EXPORT: "/grading/report/export",
    },
    REPORTS: {
      BASE: "/grading/reports",
      EXPORT: "/grading/reports/export",
      EXAM_REPORT_CARDS: (examId) => `/grading/reports/exams/${examId}`,
      STUDENT_REPORT_CARD: (examId, studentId) =>
        `/grading/reports/exams/${examId}/students/${studentId}`,
      PUBLISH: (examId) => `/grading/reports/exams/${examId}/publish`,
    },
    TRANSCRIPT: {
      BASE: (studentId) => `/grading/students/${studentId}/transcript`,
    },
  },

  // File Upload
  UPLOAD: {
    STUDENT_PHOTO: "/upload/student-photo",
    TEACHER_PHOTO: "/upload/teacher-photo",
    DOCUMENTS: "/upload/documents",
    BULK_DATA: "/upload/bulk-data",
  },

  // Subjects
  SUBJECTS: {
    BASE: "/subjects",
    BY_ID: (id) => `/subjects/${id}`,
    CREATE: "/subjects",
    UPDATE: (id) => `/subjects/${id}`,
    DELETE: (id) => `/subjects/${id}`,
    SEARCH: "/subjects/search",
    LIST: "/subjects/list",
    BY_CLASS: (classId) => `/subjects/class/${classId}`,
    BY_TEACHER: (teacherId) => `/subjects/teacher/${teacherId}`,
    ASSIGN_TEACHER: (subjectId) => `/subjects/${subjectId}/assign-teacher`,
    UNASSIGN_TEACHER: (subjectId) => `/subjects/${subjectId}/unassign-teacher`,
    STATISTICS: "/subjects/statistics",
    CATEGORIES: "/subjects/categories",
    TYPES: "/subjects/types",
  },

  // Departments
  DEPARTMENTS: {
    BASE: "/departments",
    BY_ID: (id) => `/departments/${id}`,
    ACTIVE: "/departments/active",
    STATISTICS: (id) => `/departments/${id}/statistics`,
    DEACTIVATE: (id) => `/departments/${id}/deactivate`,
    ACTIVATE: (id) => `/departments/${id}/activate`,
  },

  // Dashboard Data
  DASHBOARD: {
    ADMIN: "/dashboard/admin",
    TEACHER: "/dashboard/teacher",
    STUDENT: "/dashboard/student",
    PARENT: "/dashboard/parent",
    STAFF: "/dashboard/staff",
  },
  // Timetable Module
  TIMETABLE: {
    // Basic CRUD
    BASE: "/timetables",
    BY_ID: (id) => `/timetables/${id}`,

    // View-specific timetables
    SECTION_TIMETABLE: (sectionId) => `/timetables/section/${sectionId}`,
    TEACHER_TIMETABLE: (teacherId) => `/timetables/teacher/${teacherId}`,
    MY_TIMETABLE: "/timetables/my",
  },

  // Holidays Module - Simplified to match backend
  HOLIDAYS: {
    BASE: "/holidays",
    BY_ID: (id) => `/holidays/${id}`,
  },
  // Communication Module
  COMMUNICATION: {
    BASE: "/communication",
    SEND: "/communication/send",
    INBOX: (userId) => `/communication/inbox/${userId}`,
    CONVERSATION: (userId1, userId2) =>
      `/communication/conversation/${userId1}/${userId2}`,
    MARK_READ: (id) => `/communication/${id}/read`,
    UNREAD_COUNT: (userId) => `/communication/unread/${userId}`,
    DELETE_MESSAGE: (id) => `/communication/${id}`,
  },
  // Update the BILLING section to match your backend
  BILLING: {
    // Payments endpoints (as you provided)
    PAYMENTS: {
      BASE: "/billing/payments",
      BY_ID: (id) => `/billing/payments/${id}`,
    },

    // Bills endpoints (as you provided)
    BILLS: {
      BASE: "/billing/bills",
      BY_ID: (id) => `/billing/bills/${id}`,
      BY_STUDENT: (studentId) => `/billing/bills/student/${studentId}`,
      UPDATE_STATUS: (billId) => `/billing/bills/${billId}/status`,
    },

    // Fee Configurations (as you provided)
    CONFIGS: {
      BASE: "/billing/configs",
      BY_ID: (id) => `/billing/configs/${id}`,
      BY_CLASS: (classId) => `/billing/configs/class/${classId}`,
      SOFT_DELETE: (id) => `/billing/configs/${id}/delete`,
    },
    // Add to API_ENDPOINTS

    // Note: These endpoints don't exist in your backend, we'll handle them differently
    // SUMMARY: "/billing/summary",  // Doesn't exist
    // COLLECTION_REPORT: "/billing/collection-report",  // Doesn't exist
    // OUTSTANDING_REPORT: "/billing/outstanding",  // Doesn't exist
  },
  // In your existing swagger.config.js, update the TIMETABLE section:

  // Timetable Module - Updated to match your backend endpoints
  // Add to API_ENDPOINTS object in swagger.config.js
  // Add to API_ENDPOINTS object
  USERS: {
    BASE: "/users",
    SEARCH: "/users/search",
    BY_ID: (id) => `/users/${id}`,
    ROLES: "/users/roles",
    STATS: "/users/stats",
  },
  BUDGET: {
    BASE: "/budget",
    BY_ID: (id) => `/budget/${id}`,
    DASHBOARD: "/budget/dashboard",
    DEPARTMENT_SUMMARY: (id) => `/budget/department/${id}`,
    UTILIZATION: (id) => `/budget/${id}/utilization`,
    VARIANCE: (id) => `/budget/${id}/variance`,
    SUBMIT: (id) => `/budget/${id}/submit`,
    APPROVE: (id) => `/budget/${id}/approve`,
    REJECT: (id) => `/budget/${id}/reject`,
    FREEZE: (id) => `/budget/${id}/freeze`,
    UNFREEZE: (id) => `/budget/${id}/unfreeze`,
    REQUEST_TRANSFER: "/budget/transfers/request",
    APPROVE_TRANSFER: (id) => `/budget/transfers/${id}/approve`,
    EXECUTE_TRANSFER: (id) => `/budget/transfers/${id}/execute`,
    REJECT_TRANSFER: (id) => `/budget/transfers/${id}/reject`,
    REFUND_TRANSFER: (id) => `/budget/transfers/${id}/refund`, // ← ADD THIS
    DELETE_TRANSFER: (id) => `/budget/transfers/${id}`,
    PENDING_TRANSFERS: "/budget/transfers/pending",
    ACTIVE_ALERTS: "/budget/alerts/active",
    RESOLVE_ALERT: (id) => `/budget/alerts/${id}/resolve`,
    CHECK_AVAILABILITY: (id) => `/budget/check-availability/${id}`,
    EXPORT_REPORT: "/budget/reports/export",
    BUDGET_VS_ACTUAL: "/budget/reports/budget-vs-actual",
  },
  ASSETS: {
    BASE: "/assets",
    BY_ID: (id) => `/assets/${id}`,
    BY_TAG: (tag) => `/assets/tag/${tag}`,
    BY_USER: (userId) => `/assets/user/${userId}`,
    ASSIGN: (id) => `/assets/${id}/assign`,
    RETURN: (id) => `/assets/${id}/return`,
    TRANSFER: (id) => `/assets/${id}/transfer`,
    MAINTENANCE: (id) => `/assets/${id}/maintenance`,
    DISPOSE: (id) => `/assets/${id}/dispose`,
    DUE_MAINTENANCE: "/assets/maintenance/due",
    WARRANTY_EXPIRING: "/assets/warranty/expiring",
    DASHBOARD_STATS: "/assets/dashboard/stats",
    REPORT_REGISTER: "/assets/reports/register",
    DEPRECIATION_SCHEDULE: (id) => `/assets/${id}/depreciation/schedule`,
    DEPRECIATION_MONTHLY: "/assets/depreciation/monthly",
  },
  // Add to API_ENDPOINTS in swagger.config.js

  PROFILE_PHOTO: {
    BASE: "/profile-photo",
    UPLOAD_ME: "/profile-photo/me",
    UPDATE_ME: "/profile-photo/me",
    DELETE_ME: "/profile-photo/me",
    GET_ME: "/profile-photo/me/info",
    UPLOAD_USER: (userId) => `/profile-photo/user/${userId}`,
    DELETE_USER: (userId) => `/profile-photo/user/${userId}`,
    GET_USER: (userId) => `/profile-photo/user/${userId}`,
  },
  TIMETABLE: {
    // Basic CRUD
    BASE: "/timetables",
    BY_ID: (id) => `/timetables/${id}`,

    // View-specific timetables
    SECTION_TIMETABLE: (sectionId) => `/timetables/section/${sectionId}`,
    TEACHER_TIMETABLE: (teacherId) => `/timetables/teacher/${teacherId}`,
    MY_TIMETABLE: "/timetables/my",

    // No extra endpoints - these are all the endpoints you have
    // POST, GET, GET :id, GET section/:sectionId, GET teacher/:teacherId, GET my, PATCH :id, DELETE :id
  },
};
