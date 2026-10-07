// import { useState, useCallback, useEffect } from 'react';
// import { communicationAPI } from '../api';

// export const useNotifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);

//   const fetchNotifications = useCallback(async (params = {}) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await communicationAPI.getAllNotifications(params);
//       setNotifications(data || []);

//       // Calculate unread count
//       const unread = (data || []).filter(n => !n.isRead).length;
//       setUnreadCount(unread);

//       return data;
//     } catch (err) {
//       setError(err.message || 'Failed to fetch notifications');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const createNotification = useCallback(async (notificationData) => {
//     try {
//       const response = await communicationAPI.createNotification(notificationData);
//       return response;
//     } catch (err) {
//       console.error('Failed to create notification:', err);
//       throw err;
//     }
//   }, []);

//   const markAsRead = useCallback(async (notificationId) => {
//     try {
//       await communicationAPI.markNotificationAsRead(notificationId);
//       setNotifications(prev =>
//         prev.map(notif =>
//           notif.id === notificationId || notif._id === notificationId
//             ? { ...notif, isRead: true, readAt: new Date().toISOString() }
//             : notif
//         )
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) {
//       console.error('Failed to mark notification as read:', err);
//     }
//   }, []);

//   const markAllAsRead = useCallback(async () => {
//     try {
//       await communicationAPI.markAllNotificationsAsRead();
//       setNotifications(prev =>
//         prev.map(notif => ({
//           ...notif,
//           isRead: true,
//           readAt: new Date().toISOString(),
//         }))
//       );
//       setUnreadCount(0);
//     } catch (err) {
//       console.error('Failed to mark all notifications as read:', err);
//     }
//   }, []);

//   const deleteNotification = useCallback(async (notificationId) => {
//     try {
//       await communicationAPI.deleteNotification(notificationId);
//       const wasUnread = notifications.find(
//         n => (n.id === notificationId || n._id === notificationId) && !n.isRead
//       );
//       setNotifications(prev =>
//         prev.filter(notif =>
//           notif.id !== notificationId && notif._id !== notificationId
//         )
//       );
//       if (wasUnread) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (err) {
//       console.error('Failed to delete notification:', err);
//     }
//   }, [notifications]);

//   const fetchUnreadCount = useCallback(async () => {
//     try {
//       const response = await communicationAPI.getUnreadNotificationCount();
//       setUnreadCount(response?.count || 0);
//     } catch (err) {
//       console.error('Failed to fetch unread count:', err);
//     }
//   }, []);

//   // Auto-refresh notifications
//   useEffect(() => {
//     fetchNotifications();

//     // Refresh every 30 seconds
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [fetchNotifications]);

//   return {
//     notifications,
//     loading,
//     error,
//     unreadCount,
//     fetchNotifications,
//     createNotification,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     fetchUnreadCount,
//   };
// };
