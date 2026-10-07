import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  ExternalLink,
  Mail,
  Megaphone,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';
import { useNotifications } from '../../hooks';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    unreadCount 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIconComponent = (type) => {
    switch (type) {
      case 'message': return <Mail size={16} />;
      case 'announcement': return <Megaphone size={16} />;
      case 'grade_update': return <TrendingUp size={16} />;
      case 'event_reminder': return <Calendar size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.referenceId) {
      switch (notification.type) {
        case 'message':
          window.location.href = `/communication/messages/${notification.referenceId}`;
          break;
        case 'announcement':
          window.location.href = `/communication/announcements/${notification.referenceId}`;
          break;
        case 'grade_update':
          window.location.href = `/examination/grades`;
          break;
        default:
          setIsOpen(false);
      }
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="communication-notificationcenter-notificationcenter-notification-center">
        <button className="communication-notificationcenter-notificationcenter-notification-bell">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="communication-notificationcenter-notificationcenter-notification-badge">{unreadCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="communication-notificationcenter-notificationcenter-notification-center">
      <button 
        className="communication-notificationcenter-notificationcenter-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="communication-notificationcenter-notificationcenter-notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="communication-notificationcenter-notificationcenter-notification-dropdown">
          <div className="communication-notificationcenter-notificationcenter-notification-header">
            <h3>Notifications</h3>
            <div className="communication-notificationcenter-notificationcenter-notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="communication-notificationcenter-notificationcenter-action-button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <Check size={16} />
                </button>
              )}
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="communication-notificationcenter-notificationcenter-filter-select"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button 
                className="communication-notificationcenter-notificationcenter-close-button"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="communication-notificationcenter-notificationcenter-notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="communication-notificationcenter-notificationcenter-empty-notifications">
                <Bell size={32} />
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id || notification._id}
                  className={`communication-notificationcenter-notificationcenter-notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="communication-notificationcenter-notificationcenter-notification-icon">
                    {getNotificationIconComponent(notification.type)}
                  </div>
                  
                  <div className="communication-notificationcenter-notificationcenter-notification-content">
                    <div className="communication-notificationcenter-notificationcenter-notification-title">
                      {notification.title}
                    </div>
                    <div className="communication-notificationcenter-notificationcenter-notification-message">
                      {notification.message}
                    </div>
                    <div className="communication-notificationcenter-notificationcenter-notification-meta">
                      <span className="communication-notificationcenter-notificationcenter-notification-time">
                        {formatDate(notification.createdAt || notification.created_at)}
                      </span>
                      {!notification.isRead && (
                        <span className="communication-notificationcenter-notificationcenter-unread-dot"></span>
                      )}
                    </div>
                  </div>

                  <div className="communication-notificationcenter-notificationcenter-notification-actions-item">
                    <button 
                      className="communication-notificationcenter-notificationcenter-action-button-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id || notification._id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    {notification.referenceId && (
                      <button 
                        className="communication-notificationcenter-notificationcenter-action-button-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                        title="View"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="communication-notificationcenter-notificationcenter-notification-footer">
              <a href="/communication/notifications" className="communication-notificationcenter-notificationcenter-view-all">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;