import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from '../NotificationItem/NotificationItem';
import { NOTIFICATION_TYPES } from '../../constants/notificationTypes';
import './NotificationList.css';

const NotificationList = ({ 
  notifications, 
  onMarkAsRead, 
  onDelete,
  loading = false,
  emptyMessage = "No notifications found"
}) => {
  const [filter, setFilter] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter !== 'ALL' && notification.type !== filter) {
      return false;
    }
    if (showUnreadOnly && notification.read) {
      return false;
    }
    return true;
  });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleMarkAsRead = (id) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="notifications-notificationlist-notificationlist-notification-list loading">
        <div className="notifications-notificationlist-notificationlist-loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="notifications-notificationlist-notificationlist-notification-list empty">
        <div className="notifications-notificationlist-notificationlist-empty-state">
          <div className="notifications-notificationlist-notificationlist-empty-icon">📭</div>
          <h3>{emptyMessage}</h3>
          <p>When you have notifications, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-notificationlist-notificationlist-notification-list">
      <div className="notifications-notificationlist-notificationlist-notification-filters">
        <div className="notifications-notificationlist-notificationlist-filter-buttons">
          <button 
            className={`notifications-notificationlist-notificationlist-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => handleFilterChange('ALL')}
          >
            All
          </button>
          {Object.values(NOTIFICATION_TYPES).map(type => (
            <button 
              key={type}
              className={`notifications-notificationlist-notificationlist-filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => handleFilterChange(type)}
            >
              {type.toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="notifications-notificationlist-notificationlist-toggle-filter">
          <label className="notifications-notificationlist-notificationlist-toggle-switch">
            <input 
              type="checkbox" 
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            <span className="notifications-notificationlist-notificationlist-toggle-slider"></span>
            <span className="notifications-notificationlist-notificationlist-toggle-label">Show unread only</span>
          </label>
        </div>
      </div>

      <div className="notifications-notificationlist-notificationlist-notification-stats">
        <span className="notifications-notificationlist-notificationlist-stat-item">
          Total: <strong>{notifications.length}</strong>
        </span>
        <span className="notifications-notificationlist-notificationlist-stat-item">
          Unread: <strong>{notifications.filter(n => !n.read).length}</strong>
        </span>
        <span className="notifications-notificationlist-notificationlist-stat-item">
          Showing: <strong>{filteredNotifications.length}</strong>
        </span>
      </div>

      <div className="notifications-notificationlist-notificationlist-notifications-container">
        {filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      read: PropTypes.bool,
      createdAt: PropTypes.string
    })
  ).isRequired,
  onMarkAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string
};

export default NotificationList;