// modules/teacher/routes.jsx
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import TeacherManagementPage from "./pages/TeacherManagementPage.jsx";
import TeacherProfilePage from "./pages/TeacherProfilePage.jsx";
import TeacherPersonalTimetable from "./pages/TeacherPersonalTimetable.jsx";

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="management" replace />} />
      <Route path="management" element={<TeacherManagementPage />} />
      <Route path="profile/:teacherId" element={<TeacherProfilePage />} />
      <Route path="profile" element={<TeacherProfilePage />} />
      <Route path="timetable" element={<TeacherPersonalTimetable />} />{" "}
      {/* 🔑 Add the personal schedule route */}
      <Route path="*" element={<Navigate to="management" replace />} />
    </Routes>
  );
};

export default TeacherRoutes;
