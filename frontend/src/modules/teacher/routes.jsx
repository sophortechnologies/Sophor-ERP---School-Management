// modules/teacher/routes.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import TeacherManagementPage from './pages/TeacherManagementPage.jsx';
import TeacherProfilePage from './pages/TeacherProfilePage.jsx';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="management" replace />} />
      <Route path="management" element={<TeacherManagementPage />} />
      <Route path="profile/:teacherId" element={<TeacherProfilePage />} />
      <Route path="profile" element={<TeacherProfilePage />} />
      <Route path="*" element={<Navigate to="management" replace />} />
    </Routes>
  );
};

export default TeacherRoutes;