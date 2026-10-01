import React from "react";
import "./StatsSection.css";

const StatCard = ({ number, title, trend }) => {
  return (
    <div className="stat-card">
      <div className="dashboard-statssection-statssection-stat-number">{number}</div>
      <div className="dashboard-statssection-statssection-stat-title">{title}</div>
      {trend && <div className="dashboard-statssection-statssection-stat-trend">{trend}</div>}
    </div>
  );
};

export default StatCard;
