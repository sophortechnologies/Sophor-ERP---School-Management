import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  ParentManagementPage,
  ParentDetailsPage,
  ParentPortalPage,
} from "./pages";
import ProtectedRoute from "../../core/auth/ProtectedRoute";

export const ParentRoutes = () => {
  return (
    <Routes>
      {/* Admin management routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <ParentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:id"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
            <ParentDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Parent portal self-service view */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute roles={["PARENT"]}>
            <ParentPortalPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default ParentRoutes;
