// src/modules/dashboard/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// import DashboardLayout from "./components/DashboardLayout";

import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import StaffDashboard from "./pages/StaffDashboard";

import ProtectedRoute from "../../core/auth/ProtectedRoute";
import { USER_ROLES } from "../../constants/roles";

const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Routes>
        {/* ================= ADMIN ================= */}
        <Route
          path="admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.SUPER_ADMIN,
                USER_ROLES.PRINCIPAL,
                USER_ROLES.VICE_PRINCIPAL,
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER ================= */}
        <Route
          path="teacher"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.TEACHER,
                USER_ROLES.CLASS_TEACHER,
                USER_ROLES.SUBJECT_TEACHER,
              ]}
            >
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ================= */}
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= PARENT ================= */}
        <Route
          path="parent"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= STAFF (GENERAL) ================= */}
        <Route
          path="staff"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.STAFF,
                USER_ROLES.HR,
                USER_ROLES.ACCOUNTANT,
                USER_ROLES.LIBRARIAN,
                USER_ROLES.EXAM_OFFICER,
                USER_ROLES.CLERK,
                USER_ROLES.DRIVER,
                USER_ROLES.SECURITY,
                USER_ROLES.CLEANER,
              ]}
            >
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= STAFF SPECIAL ROLES ================= */}
        <Route
          path="hr"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
              <StaffDashboard isHR />
            </ProtectedRoute>
          }
        />

        <Route
          path="accountant"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ACCOUNTANT]}>
              <StaffDashboard isAccountant />
            </ProtectedRoute>
          }
        />

        <Route
          path="library"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.LIBRARIAN]}>
              <StaffDashboard isLibrarian />
            </ProtectedRoute>
          }
        />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRoutes;
