export const MESSAGE_TYPES = [
  { value: "DIRECT", label: "Direct Message", icon: "💬", color: "#3b82f6" },
  {
    value: "ANNOUNCEMENT",
    label: "Announcement",
    icon: "📢",
    color: "#f59e0b",
  },
  {
    value: "PROGRESS_UPDATE",
    label: "Progress Update",
    icon: "📈",
    color: "#10b981",
  },
  { value: "HOMEWORK", label: "Homework", icon: "📚", color: "#8b5cf6" },
];

export const MESSAGE_STATUS = [
  { value: "SENT", label: "Sent", color: "#6b7280" },
  { value: "READ", label: "Read", color: "#10b981" },
  { value: "DELIVERED", label: "Delivered", color: "#3b82f6" },
];

export const DEFAULT_MESSAGE_FORM = {
  receiverId: "",
  message: "",
  messageType: "DIRECT",
};

export default {
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  DEFAULT_MESSAGE_FORM,
};
