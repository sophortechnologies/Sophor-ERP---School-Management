// src/modules/timetable/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TimetableManagement from "./pages/TimetableManagement";

export const TimetableRoutes = () => {
  return (
    <Routes>
      <Route index element={<TimetableManagement />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export const AdminTimetableRoutes = TimetableRoutes;
export const TeacherTimetableRoutes = TimetableRoutes;
export const StudentTimetableRoutes = TimetableRoutes;

export default TimetableRoutes;
