// Utility functions for notifications

/**
 * Format notification date to relative time
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

/**
 * Validate notification data
 */
export const validateNotification = (data) => {
  const errors = [];
  
  if (!data.userId) {
    errors.push('User ID is required');
  }
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (data.message && data.message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }
  
  if (data.sendEmail && !data.email) {
    errors.push('Email is required when sendEmail is true');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications) => {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(notification);
  });
  
  return groups;
};

/**
 * Filter notifications by type and status
 */
export const filterNotifications = (notifications, filters) => {
  return notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) {
      return false;
    }
    
    if (filters.unreadOnly && notification.read) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = notification.title.toLowerCase().includes(searchLower);
      const messageMatch = notification.message.toLowerCase().includes(searchLower);
      const typeMatch = notification.type.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !messageMatch && !typeMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default {
  formatRelativeTime,
  validateNotification,
  groupNotificationsByDate,
  filterNotifications
};