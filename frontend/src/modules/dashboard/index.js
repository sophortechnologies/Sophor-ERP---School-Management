// src/modules/dashboard/index.js - COMPLETE FILE
// Export all dashboard components and utilities
export { default as AdminDashboard } from './pages/AdminDashboard';
export { default as TeacherDashboard } from './pages/TeacherDashboard';
export { default as StudentDashboard } from './pages/StudentDashboard';
export { default as ParentDashboard } from './pages/ParentDashboard';
export { default as StaffDashboard } from './pages/StaffDashboard';

// Export components
export { default as Header } from './components/Header';
export { default as Sidebar } from './components/Sidebar';
export { default as StatsSection } from './components/StatsSection';
export { default as QuickActions } from './components/QuickActions';
export { default as RecentActivity } from './components/RecentActivity';
export { default as LoadingSpinner } from './components/Loading';

// Export hooks
export { useDashboardData } from './hooks/useDashboardData';

// Export routes
export { default as DashboardRoutes } from './routes';

// Export utilities
export * from './utils/dashboardHelpers';