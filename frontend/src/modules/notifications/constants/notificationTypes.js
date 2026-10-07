export const NOTIFICATION_TYPES = {
  SYSTEM: "SYSTEM",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  EVENT: "EVENT",
  EXAM: "EXAM",
  ATTENDANCE: "ATTENDANCE",
  FEE: "FEE",
  PAYROLL: "PAYROLL",
  LEAVE: "LEAVE",
  MESSAGE: "MESSAGE",
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
};

export const NOTIFICATION_TYPE_COLORS = {
  SYSTEM: "#475569",
  ANNOUNCEMENT: "#d97706",
  EVENT: "#2563eb",
  EXAM: "#7c3aed",
  ATTENDANCE: "#ea580c",
  FEE: "#059669",
  PAYROLL: "#0891b2",
  LEAVE: "#d97706",
  MESSAGE: "#4f46e5",
  INFO: "#0284c7",
  SUCCESS: "#059669",
  WARNING: "#d97706",
  ERROR: "#dc2626",
};

export const NOTIFICATION_TYPE_ICONS = {
  SYSTEM: "⚙️",
  ANNOUNCEMENT: "📢",
  EVENT: "🎉",
  EXAM: "🎓",
  ATTENDANCE: "📅",
  FEE: "💰",
  PAYROLL: "💳",
  LEAVE: "🏖️",
  MESSAGE: "💬",
  INFO: "ℹ️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  ERROR: "🚨",
};

export const NOTIFICATION_TYPE_LABELS = {
  SYSTEM: "System",
  ANNOUNCEMENT: "Announcement",
  EVENT: "Event",
  EXAM: "Exam & Grades",
  ATTENDANCE: "Attendance",
  FEE: "Fee & Billing",
  PAYROLL: "Payroll",
  LEAVE: "Leave Request",
  MESSAGE: "Message Alert",
  INFO: "Information",
  SUCCESS: "Success",
  WARNING: "Warning",
  ERROR: "Alert / Error",
};

export const NOTIFICATION_TYPE_CONFIG = {
  SYSTEM: {
    label: "System",
    icon: "⚙️",
    badgeColor: "#475569",
    bg: "#f1f5f9",
  },
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: "📢",
    badgeColor: "#d97706",
    bg: "#fffbeb",
  },
  EVENT: {
    label: "Event",
    icon: "🎉",
    badgeColor: "#2563eb",
    bg: "#eff6ff",
  },
  EXAM: {
    label: "Exam & Grades",
    icon: "🎓",
    badgeColor: "#7c3aed",
    bg: "#faf5ff",
  },
  ATTENDANCE: {
    label: "Attendance",
    icon: "📅",
    badgeColor: "#ea580c",
    bg: "#fff7ed",
  },
  FEE: {
    label: "Fee & Billing",
    icon: "💰",
    badgeColor: "#059669",
    bg: "#ecfdf5",
  },
  PAYROLL: {
    label: "Payroll",
    icon: "💳",
    badgeColor: "#0891b2",
    bg: "#ecfeff",
  },
  LEAVE: {
    label: "Leave Request",
    icon: "🏖️",
    badgeColor: "#d97706",
    bg: "#fef3c7",
  },
  MESSAGE: {
    label: "Message Alert",
    icon: "💬",
    badgeColor: "#4f46e5",
    bg: "#eef2ff",
  },
  INFO: {
    label: "Information",
    icon: "ℹ️",
    badgeColor: "#0284c7",
    bg: "#f0f9ff",
  },
  SUCCESS: {
    label: "Success",
    icon: "✅",
    badgeColor: "#059669",
    bg: "#ecfdf5",
  },
  WARNING: {
    label: "Warning",
    icon: "⚠️",
    badgeColor: "#d97706",
    bg: "#fffbeb",
  },
  ERROR: {
    label: "Alert / Error",
    icon: "🚨",
    badgeColor: "#dc2626",
    bg: "#fef2f2",
  },
};

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_CONFIG,
};
