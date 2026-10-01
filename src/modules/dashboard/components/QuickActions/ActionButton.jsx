// src/components/ActionButton.js
import React from "react";
import * as Icons from "lucide-react";
import "./QuickActionss.css";

const ActionButton = ({ action, onNavigate }) => {
  const Icon = Icons[action.icon];

  return (
    <button className="dashboard-quickactions-quickactionss-action-btn" onClick={() => onNavigate(action.path)}>
      <div className="dashboard-quickactions-quickactionss-action-content">
        <div className="dashboard-quickactions-quickactionss-icon-container">
          {Icon && <Icon className="dashboard-quickactions-quickactionss-action-icon" size={20} />}
        </div>
        <span className="dashboard-quickactions-quickactionss-action-label">{action.label}</span>
      </div>
    </button>
  );
};

export default ActionButton;