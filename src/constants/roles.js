export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
};

export const DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.TEACHER]: "/teacher/dashboard",
  [USER_ROLES.STUDENT]: "/student/dashboard",
  [USER_ROLES.PARENT]: "/parent/dashboard",
};
