// src/modules/attendance/index.js
// Barrel exports for attendance module
export { attendanceApi } from './api/attendance.api.js';
export { staffAttendanceApi } from './api/staffAttendance.api.js';
export { staffLeaveApi } from './api/staffLeave.api.js';
export * from './components/index.js';
export * from './constants/index.js';
export { default as useAttendance } from './hooks/useAttendance.js';
export { default as AttendanceManagement } from './pages/AttendanceManagement.jsx';
export * from './utils/index.js';