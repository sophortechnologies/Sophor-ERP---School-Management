import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { notificationApi } from '../../api/notification.api';
import './NotificationBadge.css';

const NotificationBadge = ({ 
  userId, 
  onClick, 
  showCount = true,
  maxCount = 9,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        userId,
        unreadOnly: true
      });
      setUnreadCount(response.data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    if (autoRefresh) {
      const interval = setInterval(fetchUnreadCount, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, autoRefresh, refreshInterval]);

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;

  return (
    <div 
      className="notifications-notificationbadge-notificationbadge-notification-badge-container"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick(e)}
      title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      <div className="notifications-notificationbadge-notificationbadge-notification-icon">
        🔔
      </div>
      
      {showCount && unreadCount > 0 && (
        <div className="notifications-notificationbadge-notificationbadge-badge-count">
          {loading ? '...' : displayCount}
        </div>
      )}
    </div>
  );
};

NotificationBadge.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  showCount: PropTypes.bool,
  maxCount: PropTypes.number,
  autoRefresh: PropTypes.bool,
  refreshInterval: PropTypes.number
};

NotificationBadge.defaultProps = {
  showCount: true,
  maxCount: 9,
  autoRefresh: true,
  refreshInterval: 30000
};

export default NotificationBadge;