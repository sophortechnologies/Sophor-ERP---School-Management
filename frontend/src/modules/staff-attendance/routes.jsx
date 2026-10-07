import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffAttendancePage from './pages/StaffAttendancePage';
import StaffLeavePage from './pages/StaffLeavePage';

const StaffAttendanceRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/admin/staff-attendance/attendance" replace />} />
      <Route path="attendance" element={<StaffAttendancePage />} />
      <Route path="leave" element={<StaffLeavePage />} />
      <Route path="leaves" element={<Navigate to="leave" replace />} />
      <Route path="reports" element={<StaffAttendancePage />} />
      <Route path="history" element={<StaffAttendancePage />} />
      <Route path="*" element={<Navigate to="attendance" replace />} />
    </Routes>
  );
};

export default StaffAttendanceRoutes;