// src/modules/staff-attendance/index.js
// Main barrel export for the staff-attendance module

// Export APIs
export { staffAttendanceApi } from './api/staffAttendance.api';
export { staffLeaveApi } from './api/staffLeave.api';

// Export components
export { default as StaffAttendanceMarking } from './components/StaffAttendanceMarking';
export { default as StaffAttendanceReport } from './components/StaffAttendanceReport';
export { default as StaffLeaveManagement } from './components/StaffLeaveManagement';

// Export hooks
export { default as useStaffAttendance } from './hooks/useStaffAttendance';
export { default as useStaffLeave } from './hooks/useStaffLeave';

// Export pages
export { default as StaffAttendancePage } from './pages/StaffAttendancePage';
export { default as StaffLeavePage } from './pages/StaffLeavePage';

// Export utils
export * from './utils';

// Export constants
export * from './constants';

// Export routes
export { default as StaffAttendanceRoutes } from './routes';