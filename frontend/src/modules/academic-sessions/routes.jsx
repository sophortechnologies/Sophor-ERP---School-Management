// src/modules/academic-sessions/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../../core/auth";
import AcademicSessionList from "./components/AcademicSessionList";

const AcademicSessionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "SUPER_ADMIN"]}>
            <AcademicSessionList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AcademicSessionRoutes;
