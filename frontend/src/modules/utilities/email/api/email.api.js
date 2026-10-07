import api from "@/api/axios";

export const emailApi = {
  getEmails: async () => {
    try {
      const response = await api.get("/notifications");
      return response.data?.data || response.data || [];
    } catch (err) {
      return [];
    }
  },
  sendEmail: async (emailData) => {
    // Routes through the active backend messaging/notification system
    const payload = {
      userId: 1,
      title: emailData.subject,
      message: emailData.message,
      type: "MESSAGE",
    };
    const response = await api.post("/notifications", payload);
    return response.data?.data || response.data;
  },
  deleteEmail: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  clearAllEmails: async (ids) => {
    await Promise.all(
      ids.map((id) => api.delete(`/notifications/${id}`).catch(() => null)),
    );
    return { success: true };
  },
};
