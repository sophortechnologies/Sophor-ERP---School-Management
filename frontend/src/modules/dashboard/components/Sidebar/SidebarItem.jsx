// src/modules/dashboard/components/Sidebar/SidebarItem.jsx
import React from "react";
import * as Icons from "lucide-react";

const SidebarItem = ({ item, collapsed, onNavigate }) => {
  const Icon = Icons[item.icon];
  const isActive = window.location.pathname === item.path;

  return (
    <button
      className={`dashboard-sidebar-sidebar-nav-item ${isActive ? "active" : ""}`}
      onClick={() => onNavigate(item.path)}
      title={item.label}
    >
      {Icon && <Icon size={20} />}
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
};

export default SidebarItem;
