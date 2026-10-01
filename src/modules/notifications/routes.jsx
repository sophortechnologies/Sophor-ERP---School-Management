import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationsPage } from './pages';

const NotificationRoutes = () => {
  return (
    <Routes>
      {/* Main notifications page */}
      <Route index element={<NotificationsPage />} />
      
      {/* View specific notification */}
      <Route path="view/:id" element={
        <div className="container">
          <h1>Notification Details</h1>
          <p>Detailed view of notification will be implemented here</p>
        </div>
      } />
      
      {/* Create notification */}
      <Route path="create" element={
        <div className="container">
          <h1>Create Notification</h1>
          <p>Form for creating notifications will be implemented here</p>
        </div>
      } />
      
      {/* Manage notification templates */}
      <Route path="templates" element={
        <div className="container">
          <h1>Notification Templates</h1>
          <p>Manage notification templates and presets</p>
        </div>
      } />
      
      {/* Notification settings */}
      <Route path="settings" element={
        <div className="container">
          <h1>Notification Settings</h1>
          <p>Configure notification preferences and delivery methods</p>
        </div>
      } />
      
      {/* Email notifications */}
      <Route path="email" element={
        <div className="container">
          <h1>Email Notifications</h1>
          <p>Manage email notification templates and settings</p>
        </div>
      } />
      
      {/* SMS notifications */}
      <Route path="sms" element={
        <div className="container">
          <h1>SMS Notifications</h1>
          <p>Manage SMS notification settings and templates</p>
        </div>
      } />
      
      {/* Push notifications */}
      <Route path="push" element={
        <div className="container">
          <h1>Push Notifications</h1>
          <p>Configure push notification settings</p>
        </div>
      } />
      
      {/* User notification preferences */}
      <Route path="preferences" element={
        <div className="container">
          <h1>Notification Preferences</h1>
          <p>User-specific notification preferences</p>
        </div>
      } />
      
      {/* Notification logs/audit */}
      <Route path="logs" element={
        <div className="container">
          <h1>Notification Logs</h1>
          <p>View notification delivery logs and history</p>
        </div>
      } />
      
      {/* Notification analytics */}
      <Route path="analytics" element={
        <div className="container">
          <h1>Notification Analytics</h1>
          <p>View notification metrics and performance analytics</p>
        </div>
      } />
      
      {/* Bulk notification sending */}
      <Route path="bulk" element={
        <div className="container">
          <h1>Bulk Notifications</h1>
          <p>Send notifications to multiple users at once</p>
        </div>
      } />
      
      {/* Scheduled notifications */}
      <Route path="scheduled" element={
        <div className="container">
          <h1>Scheduled Notifications</h1>
          <p>Manage scheduled and automated notifications</p>
        </div>
      } />
      
      {/* Integration settings */}
      <Route path="integrations" element={
        <div className="container">
          <h1>Notification Integrations</h1>
          <p>Configure external notification services and integrations</p>
        </div>
      } />
      
      {/* 404 route */}
      <Route path="*" element={
        <div className="container">
          <h1>404 - Notification Not Found</h1>
          <p>The requested notification page does not exist.</p>
        </div>
      } />
    </Routes>
  );
};

export default NotificationRoutes;