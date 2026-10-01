import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList, NotificationBadge } from '../components';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    userId: '',
    type: NOTIFICATION_TYPES.INFO,
    title: '',
    message: '',
    sendEmail: false,
    email: '',
    metadata: {}
  });
  const [testData, setTestData] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNotification(newNotification);
      setShowCreateModal(false);
      setNewNotification({
        userId: '',
        type: NOTIFICATION_TYPES.INFO,
        title: '',
        message: '',
        sendEmail: false,
        email: '',
        metadata: {}
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNotification(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTestNotification = async () => {
    try {
      const testNotification = {
        userId: 1,
        type: testData || NOTIFICATION_TYPES.ALERT,
        title: 'Test Notification',
        message: 'This is a test notification created from the frontend.',
        sendEmail: false,
        email: 'test@example.com',
        metadata: {
          source: 'test',
          timestamp: new Date().toISOString()
        }
      };
      
      await createNotification(testNotification);
      alert('Test notification created successfully!');
    } catch (error) {
      alert('Error creating test notification');
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <div className="notifications-notificationspage-notifications-page">
      <div className="notifications-notificationspage-page-header">
        <div className="notifications-notificationspage-header-left">
          <h1>
            Notifications
            <NotificationBadge 
              showCount={true}
              onClick={() => setShowCreateModal(true)}
            />
          </h1>
          <p className="notifications-notificationspage-page-subtitle">
            Manage all your notifications and alerts
          </p>
        </div>
        
        <div className="notifications-notificationspage-header-actions">
          <button 
            className="btn notifications-notificationspage-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Notification
          </button>
          <button 
            className="btn notifications-notificationspage-btn-success"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            ✓ Mark All Read
          </button>
        </div>
      </div>

      {error && (
        <div className="notifications-notificationspage-error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="notifications-notificationspage-page-content">
        <div className="notifications-notificationspage-stats-cards">
          <div className="stat-card">
            <div className="stat-value">{notifications.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card unread">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {notifications.filter(n => n.type === NOTIFICATION_TYPES.ALERT).length}
            </div>
            <div className="stat-label">Alerts</div>
          </div>
        </div>

        <div className="notifications-notificationspage-test-section">
          <h3>Quick Test</h3>
          <div className="notifications-notificationspage-test-controls">
            <select 
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="notifications-notificationspage-test-select"
            >
              <option value="">Select type...</option>
              {Object.values(NOTIFICATION_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button 
              className="btn notifications-notificationspage-btn-outline"
              onClick={handleTestNotification}
              disabled={!testData}
            >
              Send Test Notification
            </button>
          </div>
        </div>

        <div className="notifications-notificationspage-notifications-section">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            loading={loading}
            emptyMessage="You have no notifications yet."
          />
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="notifications-notificationspage-modal-overlay">
          <div className="notifications-notificationspage-modal-content">
            <div className="notifications-notificationspage-modal-header">
              <h2>Create New Notification</h2>
              <button 
                className="notifications-notificationspage-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit}>
              <div className="notifications-notificationspage-modal-body">
                <div className="notifications-notificationspage-form-group">
                  <label>User ID:</label>
                  <input
                    type="number"
                    name="userId"
                    value={newNotification.userId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="notifications-notificationspage-form-group">
                  <label>Type:</label>
                  <select
                    name="type"
                    value={newNotification.type}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.values(NOTIFICATION_TYPES).map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="notifications-notificationspage-form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={newNotification.title}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="notifications-notificationspage-form-group">
                  <label>Message:</label>
                  <textarea
                    name="message"
                    value={newNotification.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="notifications-notificationspage-form-group notifications-notificationspage-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="sendEmail"
                      checked={newNotification.sendEmail}
                      onChange={handleInputChange}
                    />
                    Send Email Notification
                  </label>
                </div>

                {newNotification.sendEmail && (
                  <div className="notifications-notificationspage-form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={newNotification.email}
                      onChange={handleInputChange}
                      required={newNotification.sendEmail}
                    />
                  </div>
                )}
              </div>

              <div className="notifications-notificationspage-modal-footer">
                <button 
                  type="button" 
                  className="btn notifications-notificationspage-btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;