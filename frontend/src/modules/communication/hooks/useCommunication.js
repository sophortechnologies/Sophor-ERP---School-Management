import { useState, useEffect, useCallback } from "react";
import communicationApi from "../api/communication.api";

export const useCommunication = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
  });

  const loadInbox = useCallback(async (userId, params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await communicationApi.getInbox(userId, params);

      if (response.success && response.data) {
        setMessages(response.data.data || []);
        setPagination({
          currentPage: response.data.current_page || 1,
          totalPages: response.data.total_pages || 1,
          totalItems: response.data.count || 0,
          pageSize: response.data.page_size || 20,
        });
      } else {
        setMessages([]);
        setError(response.message);
      }
    } catch (err) {
      console.error("Error loading inbox:", err);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async (userId) => {
    try {
      const response = await communicationApi.getUnreadCount(userId);
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  }, []);

  const sendMessage = useCallback(async (messageData) => {
    try {
      setLoading(true);
      const response = await communicationApi.sendMessage(messageData);
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error sending message:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (messageId, userId) => {
      try {
        const response = await communicationApi.markAsRead(messageId, userId);
        if (response.success) {
          await loadUnreadCount(userId);
          return { success: true };
        }
        return { success: false };
      } catch (err) {
        console.error("Error marking as read:", err);
        return { success: false };
      }
    },
    [loadUnreadCount],
  );

  const deleteMessage = useCallback(
    async (messageId, userId) => {
      try {
        const response = await communicationApi.deleteMessage(messageId);
        if (response.success) {
          await loadInbox(userId);
          await loadUnreadCount(userId);
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error deleting message:", err);
        return { success: false, error: err.message };
      }
    },
    [loadInbox, loadUnreadCount],
  );

  const getConversation = useCallback(async (userId1, userId2) => {
    try {
      const response = await communicationApi.getConversation(userId1, userId2);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Error fetching conversation:", err);
      return [];
    }
  }, []);

  return {
    messages,
    loading,
    error,
    unreadCount,
    pagination,
    loadInbox,
    loadUnreadCount,
    sendMessage,
    markAsRead,
    deleteMessage,
    getConversation,
  };
};

export default useCommunication;
