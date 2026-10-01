// src/components/QuickActions.js
import React from "react";
import ActionButton from "./ActionButton";
import "./QuickActionss.css";

const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      id: "add-student",
      icon: "UserPlus",
      label: "Add Student",
      path: "/admin/students",
    },
    {
      id: "add-staff",
      icon: "UserPlus",
      label: "Add Staff",
      path: "/admin/staff",
    },
    {
      id: "create-class",
      icon: "BookOpen",
      label: "Create Class",
      path: "/admin/classes",
    },
    {
      id: "setup-fees",
      icon: "DollarSign",
      label: "Setup Fees",
      path: "/admin/finance",
    },
  ];

  return (
    <section className="dashboard-quickactions-quickactionss-actions-section">
      <h2>Quick Actions</h2>
      <div className="dashboard-quickactions-quickactionss-actions-grid">
        {actions.map((action) => (
          <div className="dashboard-quickactions-quickactionss-action-card" key={action.id}>
            <ActionButton
              action={action}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;