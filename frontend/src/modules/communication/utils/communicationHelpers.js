import { 
  MAX_ATTACHMENT_SIZE, 
  MAX_MESSAGE_LENGTH, 
  ATTACHMENT_TYPES,
  NOTIFICATION_TYPES 
} from '../constants';

export const validateMessage = (message) => {
  const errors = {};

  if (!message.subject?.trim()) {
    errors.subject = 'Subject is required';
  } else if (message.subject.length > 200) {
    errors.subject = 'Subject must be less than 200 characters';
  }

  if (!message.content?.trim()) {
    errors.content = 'Message content is required';
  } else if (message.content.length > MAX_MESSAGE_LENGTH) {
    errors.content = `Message must be less than ${MAX_MESSAGE_LENGTH} characters`;
  }

  if (!message.receiverId && !message.receiverType) {
    errors.receiver = 'Please select a recipient';
  }

  return errors;
};

export const formatMessageDate = (dateString) => {
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
    year: diffDays < 365 ? undefined : 'numeric',
  });
};

export const validateAttachment = (file) => {
  const errors = [];

  if (file.size > MAX_ATTACHMENT_SIZE) {
    errors.push(`File size must be less than ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`);
  }

  if (!ATTACHMENT_TYPES.includes(file.type)) {
    errors.push('File type not supported. Please upload images, PDFs, or documents');
  }

  return errors;
};

export const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.MESSAGE]: '📨',
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: '📢',
    [NOTIFICATION_TYPES.GRADE_UPDATE]: '📊',
    [NOTIFICATION_TYPES.ATTENDANCE_UPDATE]: '✅',
    [NOTIFICATION_TYPES.FEE_REMINDER]: '💰',
    [NOTIFICATION_TYPES.EXAM_SCHEDULE]: '📝',
    [NOTIFICATION_TYPES.EVENT_REMINDER]: '📅',
    [NOTIFICATION_TYPES.SYSTEM]: '⚙️',
  };
  return icons[type] || '🔔';
};

export const filterMessagesByRole = (messages, userRole) => {
  if (!messages) return [];
  
  if (userRole === 'admin') {
    return messages;
  }

  return messages.filter(message => {
    if (userRole === 'teacher') {
      return message.sender_type === 'teacher' || 
             message.receiver_type === 'teacher' ||
             message.receiver_type === 'class';
    }

    if (userRole === 'parent') {
      return message.receiver_id === userRole.id || 
             message.sender_id === userRole.id;
    }

    if (userRole === 'student') {
      return message.receiver_id === userRole.id || 
             message.sender_id === userRole.id;
    }

    return true;
  });
};