// src/modules/attendance/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AttendanceManagement from './pages/AttendanceManagement.jsx';

const AttendanceRoutes = () => {
  return (
    <Routes>
      <Route index element={<AttendanceManagement />} />
      {/* You can add more specific routes later if needed */}
    </Routes>
  );
};

export default AttendanceRoutes;