import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks';
import { Check, Trash2, Bell } from 'lucide-react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications, loading, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="communication-notificationspage-notifications-page">
        <div className="communication-notificationspage-loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="communication-notificationspage-notifications-page">
      <div className="communication-notificationspage-notifications-header">
        <h1>Notifications</h1>
        <div className="communication-notificationspage-notifications-actions">
          <button className="communication-notificationspage-mark-all-read" onClick={markAllAsRead}>
            <Check size={16} />
            Mark all as read
          </button>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="communication-notificationspage-notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="communication-notificationspage-empty-notifications">
            <Bell size={48} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div key={notification.id || notification._id} className={`communication-notificationspage-notification-card ${!notification.isRead ? 'unread' : ''}`}>
              <div className="communication-notificationspage-notification-icon">
                <Bell size={20} />
              </div>
              <div className="communication-notificationspage-notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="communication-notificationspage-notification-meta">
                  <span className="communication-notificationspage-time">
                    {new Date(notification.createdAt || notification.created_at).toLocaleDateString()}
                  </span>
                  {!notification.isRead && <span className="communication-notificationspage-unread-badge">New</span>}
                </div>
              </div>
              <button
                className="communication-notificationspage-delete-btn"
                onClick={() => deleteNotification(notification.id || notification._id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;