import React from "react";
import { LogOut } from "lucide-react";
import "./Header.css";

const Header = ({ onLogout, sidebarCollapsed }) => {
  return (
    <header className="dashboard-header-header-main-header">
      <div className="dashboard-header-header-header-container">
        <div className="dashboard-header-header-header-info">
          <h1>Admin Dashboard</h1>
          <p>
            Welcome to your fresh ERP system! Start by adding students, staff,
            and classes.
          </p>
        </div>
        <button className="dashboard-header-header-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
