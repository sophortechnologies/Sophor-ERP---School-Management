import api from "@/api/axios";

const extractNotificationData = (res) => {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  if (Array.isArray(d)) return { items: d, total: d.length, unreadCount: 0 };
  if (Array.isArray(d?.items)) {
    return {
      items: d.items,
      total: d.total || d.items.length,
      unreadCount: d.unreadCount || 0,
    };
  }
  if (Array.isArray(d?.notifications)) {
    return {
      items: d.notifications,
      total: d.total || d.notifications.length,
      unreadCount: d.unreadCount || 0,
    };
  }
  if (Array.isArray(d?.data)) {
    return {
      items: d.data,
      total: d.count || d.total || d.data.length,
      unreadCount: d.unreadCount || 0,
    };
  }
  return { items: [], total: 0, unreadCount: 0 };
};

export const notificationApi = {
  // GET /notifications (No forbidden query params like limit/pageSize)
  getNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      return extractNotificationData(res);
    } catch {
      return { items: [], total: 0, unreadCount: 0 };
    }
  },

  // PATCH /notifications/:id/read
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${Number(id)}/read`);
    return res.data?.data || res.data;
  },

  // PATCH /notifications/read-all
  markAllAsRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data?.data || res.data;
  },

  // POST /notifications
  createNotification: async ({ title, message, type, userIds = [] }) => {
    const cleanType = String(type || "SYSTEM").toUpperCase();

    if (Array.isArray(userIds) && userIds.length > 0) {
      const requests = userIds.map((uid) =>
        api.post("/notifications", {
          title: String(title).trim(),
          message: String(message).trim(),
          type: cleanType,
          userId: Number(uid),
        }),
      );
      const responses = await Promise.allSettled(requests);
      const successful = responses
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value.data?.data || r.value.data);

      const failed = responses.find((r) => r.status === "rejected");
      if (successful.length === 0 && failed) {
        throw failed.reason;
      }
      return successful[0] || { success: true };
    }

    throw new Error("Target user ID is required");
  },
};

export default notificationApi;
