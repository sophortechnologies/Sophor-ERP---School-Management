import api from '../../../services/api';

export const notificationApi = {
  // Create a new notification
  createNotification: (notificationData) => {
    return api.post('/notifications', notificationData);
  },

  // Get all notifications with optional filters
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params });
  },

  // Mark a single notification as read
  markAsRead: (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.patch('/notifications/read-all');
  },

  // Delete a notification
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/notifications', { params: { unreadOnly: true } })
      .then(response => response.data.length);
  }
};