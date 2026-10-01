import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="dashboard-loading-loadingspinner-loading-container">
      <div className="dashboard-loading-loadingspinner-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );
};

export default LoadingSpinner;
