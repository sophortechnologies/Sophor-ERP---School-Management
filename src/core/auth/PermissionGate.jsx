import React from "react";
import { useSelector } from "react-redux";

const PermissionGate = ({ children, allowedRoles = [], fallback = null }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return fallback;
  }

  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return fallback;
    }
  }

  return children;
};

export default PermissionGate;
