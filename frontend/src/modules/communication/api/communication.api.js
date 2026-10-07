import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const communicationApi = {
  // ==================== MESSAGES ====================
  sendMessage: async (payload) => {
    try {
      const cleanPayload = {
        message: String(payload.message || payload.content || "").trim(),
        messageType: String(
          payload.messageType || payload.type || "ANNOUNCEMENT",
        ).toUpperCase(),
        ...(payload.senderId ? { senderId: Number(payload.senderId) } : {}),
        ...(payload.receiverId
          ? { receiverId: Number(payload.receiverId) }
          : payload.recipientId
            ? { receiverId: Number(payload.recipientId) }
            : {}),
      };

      const response = await api.post(
        `${API_ENDPOINTS.COMMUNICATION.BASE}/send`,
        cleanPayload,
      );

      const createdItem = response.data?.data || response.data;
      return {
        success: true,
        data: createdItem,
        message: "Message sent successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join(", ")
          : error.response?.data?.message || "Failed to send message",
      };
    }
  },

  getInbox: async (userId, params = {}) => {
    try {
      const { page = 1, pageSize = 100, status } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("pageSize", pageSize);
      if (status) queryParams.append("status", status);

      const endpoint = API_ENDPOINTS.COMMUNICATION.INBOX
        ? API_ENDPOINTS.COMMUNICATION.INBOX(userId)
        : `/communication/inbox/${userId}`;

      const response = await api.get(`${endpoint}?${queryParams}`);
      const rawData = response.data?.data || response.data;
      const list = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.messages)
            ? rawData.messages
            : Array.isArray(rawData?.items)
              ? rawData.items
              : [];

      return {
        success: true,
        data: list,
        message: "Inbox fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch inbox",
      };
    }
  },

  getConversation: async (userId1, userId2) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.COMMUNICATION.CONVERSATION(userId1, userId2),
      );
      return {
        success: true,
        data: response.data?.data || response.data,
        message: "Conversation fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch conversation",
      };
    }
  },

  markAsRead: async (messageId, userId) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.COMMUNICATION.MARK_READ(messageId),
      );
      return {
        success: true,
        data: response.data,
        message: "Message marked as read",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to mark message as read",
      };
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.COMMUNICATION.UNREAD_COUNT(userId),
      );
      return {
        success: true,
        data: response.data,
        message: "Unread count fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        unreadCount: 0,
        message:
          error.response?.data?.message || "Failed to fetch unread count",
      };
    }
  },

  searchUsers: async (searchTerm) => {
    try {
      const term = String(searchTerm || "").trim();
      if (!term || term.length < 2) {
        return { success: true, data: [], message: "No results" };
      }

      const response = await api.get("/users/search", {
        params: { q: term },
        paramsSerializer: { indexes: null },
      });

      return {
        success: true,
        data: response.data?.data || response.data || [],
        message: "Users fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to search users",
      };
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.COMMUNICATION.DELETE_MESSAGE(messageId),
      );
      return {
        success: true,
        data: response.data,
        message: "Message deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete message",
      };
    }
  },
};

export default communicationApi;
