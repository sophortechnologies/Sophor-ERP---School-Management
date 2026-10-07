// src/core/auth/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DASHBOARD_ROUTES } from "../../constants/roles";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // REMOVED: isLoading check - don't show loading, just check authentication

  console.log("PUBLIC ROUTE CHECK:", {
    isAuthenticated,
    userRole: user?.role,
  });

  // If authenticated AND login was successful (user exists), redirect to dashboard
  if (isAuthenticated && user) {
    const dashboardRoute = DASHBOARD_ROUTES[user.role] || "/dashboard";
    console.log("Redirecting authenticated user to:", dashboardRoute);
    return <Navigate to={dashboardRoute} replace />;
  }

  // ALWAYS show the login page if not authenticated
  // This includes when login fails - stay on login page
  return children;
};

export default PublicRoute;