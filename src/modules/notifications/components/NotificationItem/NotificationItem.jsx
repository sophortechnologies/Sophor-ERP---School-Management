import React from 'react';
import PropTypes from 'prop-types';
import { 
  NOTIFICATION_TYPE_ICONS, 
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_LABELS 
} from '../../constants/notificationTypes';
import './NotificationItem.css';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  showActions = true 
}) => {
  const {
    id,
    type = 'INFO',
    title,
    message,
    createdAt,
    read,
    metadata = {}
  } = notification;

  const handleMarkAsRead = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div 
      className={`notifications-notificationitem-notificationitem-notification-item ${read ? 'read' : 'unread'}`}
      onClick={handleMarkAsRead}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleMarkAsRead()}
    >
      <div className="notifications-notificationitem-notificationitem-notification-header">
        <div className="notifications-notificationitem-notificationitem-notification-type">
          <span 
            className="notifications-notificationitem-notificationitem-type-icon"
            style={{ backgroundColor: NOTIFICATION_TYPE_COLORS[type] || '#54a0ff' }}
          >
            {NOTIFICATION_TYPE_ICONS[type] || 'ℹ️'}
          </span>
          <span className="notifications-notificationitem-notificationitem-type-label">
            {NOTIFICATION_TYPE_LABELS[type] || 'Notification'}
          </span>
        </div>
        
        {showActions && (
          <div className="notifications-notificationitem-notificationitem-notification-actions">
            {!read && (
              <button 
                className="notifications-notificationitem-notificationitem-action-btn notifications-notificationitem-notificationitem-mark-read-btn"
                onClick={handleMarkAsRead}
                title="Mark as read"
              >
                ✓
              </button>
            )}
            <button 
              className="notifications-notificationitem-notificationitem-action-btn notifications-notificationitem-notificationitem-delete-btn"
              onClick={handleDelete}
              title="Delete"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="notifications-notificationitem-notificationitem-notification-content">
        <h4 className="notifications-notificationitem-notificationitem-notification-title">{title}</h4>
        <p className="notifications-notificationitem-notificationitem-notification-message">{message}</p>
        
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="notifications-notificationitem-notificationitem-notification-metadata">
            {Object.entries(metadata).map(([key, value]) => (
              <span key={key} className="notifications-notificationitem-notificationitem-metadata-item">
                <strong>{key}:</strong> {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="notifications-notificationitem-notificationitem-notification-footer">
        <span className="notifications-notificationitem-notificationitem-notification-time">
          {formatDate(createdAt)}
        </span>
        {!read && <span className="notifications-notificationitem-notificationitem-unread-dot"></span>}
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    read: PropTypes.bool,
    metadata: PropTypes.object
  }).isRequired,
  onMarkAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool
};

export default NotificationItem;