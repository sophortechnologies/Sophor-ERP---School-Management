// src/modules/dashboard/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../store/slices/authSlice";
import {
  Sidebar,
  Header,
  StatsSection,
  QuickActions,
  RecentActivity,
  LoadingSpinner,
} from "../components";
import { useDashboardData } from "../hooks/useDashboardData";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const { stats, activities, loading, loadDashboardData } = useDashboardData();

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading && stats.totalStudents === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-admindashboard-admin-dashboard">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <div
        className={`dashboard-admindashboard-main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        <Header onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} />

        <main className="dashboard-admindashboard-content-area">
          <StatsSection stats={stats} />
          <QuickActions onNavigate={handleNavigate} />
          <RecentActivity activities={activities} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
