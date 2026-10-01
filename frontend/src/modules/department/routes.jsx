import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import DepartmentManagementPage from './pages/DepartmentManagementPage.jsx';

const DepartmentRoutes = () => {
  return (
    <Routes>
      <Route index element={<DepartmentManagementPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default DepartmentRoutes;