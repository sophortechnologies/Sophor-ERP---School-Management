import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const communicationApi = {
  // ==================== MESSAGES ====================
  sendMessage: async (messageData) => {
    try {
      console.log("📤 Sending message API call:", messageData);
      const response = await api.post(
        `${API_ENDPOINTS.COMMUNICATION.BASE}/send`,
        messageData,
      );
      console.log("✅ Send message response:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Message sent successfully",
      };
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to send message",
      };
    }
  },

  getInbox: async (userId, params = {}) => {
    try {
      const { page = 1, pageSize = 20, status } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("pageSize", pageSize);
      if (status) queryParams.append("status", status);

      const response = await api.get(
        `${API_ENDPOINTS.COMMUNICATION.INBOX(userId)}?${queryParams}`,
      );
      return {
        success: true,
        data: response.data,
        message: "Inbox fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching inbox:", error);
      return {
        success: false,
        data: null,
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
        data: response.data,
        message: "Conversation fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching conversation:", error);
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
      console.error("Error marking message as read:", error);
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
      console.error("Error fetching unread count:", error);
      return {
        success: false,
        unreadCount: 0,
        message:
          error.response?.data?.message || "Failed to fetch unread count",
      };
    }
  },
  // src/modules/communication/api/communication.api.js

  // src/modules/communication/api/communication.api.js

  // src/modules/communication/api/communication.api.js

  searchUsers: async (searchTerm) => {
    try {
      // Ensure searchTerm is a string and encode it
      const term = String(searchTerm || "").trim();
      if (!term || term.length < 2) {
        return { success: true, data: [], message: "No results" };
      }

      console.log("Searching for:", term);

      const response = await api.get("/users/search", {
        params: { q: term },
        // Add this to ensure proper formatting
        paramsSerializer: { indexes: null },
      });

      console.log("Search results:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.error("Error searching users:", error);
      console.error("Error response:", error.response?.data);
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
      console.error("Error deleting message:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete message",
      };
    }
  },
};

export default communicationApi;
