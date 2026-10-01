import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DASHBOARD_ROUTES } from "../constants/roles";
import Loader from "../shared/components/UI/Loader/Loader";

const DashboardRedirect = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading || !user) {
    return <Loader text="Loading your dashboard..." />;
  }

  const dashboardRoute = DASHBOARD_ROUTES[user.role] || "/admin/dashboard";
  console.log("🎯 Dashboard redirect to:", dashboardRoute);

  return <Navigate to={dashboardRoute} replace />;
};

export default DashboardRedirect;
