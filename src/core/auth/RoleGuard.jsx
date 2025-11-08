import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default RoleGuard;
