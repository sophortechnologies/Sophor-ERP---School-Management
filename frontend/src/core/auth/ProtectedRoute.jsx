import React, { useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRouteSimple = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );

  const redirectCount = useRef(0);

  console.log("SIMPLE PROTECTED ROUTE:", {
    path: location.pathname,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    isLoading,
  });

  // Safety check - prevent infinite redirects
  if (redirectCount.current > 2) {
    console.error("TOO MANY REDIRECTS - STOPPING");
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Redirect Loop Detected</h2>
        <p>Please check your authentication setup.</p>
        <button onClick={() => (window.location.href = "/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    console.log(`Redirecting to login (attempt ${redirectCount.current + 1})`);
    redirectCount.current += 1;
    return <Navigate to="/login" replace />;
  }

  console.log("Access granted");
  return children;
};

export default ProtectedRouteSimple;
