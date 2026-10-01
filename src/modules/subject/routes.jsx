// modules/subject/routes.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SubjectManagementPage from './pages/SubjectManagementPage.jsx';

const SubjectRoutes = () => {
  return (
    <Routes>
      <Route index element={<SubjectManagementPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default SubjectRoutes;