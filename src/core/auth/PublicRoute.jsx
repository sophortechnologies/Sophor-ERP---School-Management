import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DASHBOARD_ROUTES } from "../../constants/roles";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const dashboardRoute = DASHBOARD_ROUTES[user.role] || "/dashboard";
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default PublicRoute;
