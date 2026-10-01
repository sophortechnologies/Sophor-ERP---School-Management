// src/modules/department/utils/departmentHelpers.js

export const formatDepartmentCode = (code) => {
  if (!code) return "N/A";
  return code.toUpperCase();
};

export const getDepartmentStatusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "#10b981";
  if (s === "inactive") return "#ef4444";
  return "#6b7280";
};
