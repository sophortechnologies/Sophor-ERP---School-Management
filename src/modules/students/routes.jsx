// src/modules/students/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudentManagement from "./modules/students/pages/StudentManagement";
import StudentAdmissionForm from "./modules/students/components/StudentAdmissionForm";
import StudentDetails from "./modules/students/pages/StudentDetails";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Student Management Routes */}
      <Route
        path="/admin/students"
        element={
          // If using ProtectedRoute:
          // <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <StudentManagement />
          // </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students/admission"
        element={
          // <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <StudentAdmissionForm />
          // </ProtectedRoute>
        }
      />

      {/* Student Details View Route */}
      <Route
        path="/admin/students/:id"
        element={
          // <ProtectedRoute allowedRoles={['admin', 'teacher', 'staff']}>
          <StudentDetails />
          // </ProtectedRoute>
        }
      />

      {/* Optional: Redirect to students page as default */}
      <Route path="/" element={<Navigate to="/admin/students" replace />} />

      {/* Optional: 404 fallback */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;