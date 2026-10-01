import React from "react";
import * as Icons from "lucide-react";
import "./RecentActivity.css";

const ActivityItem = ({ activity }) => {
  const Icon = Icons[activity.icon];

  return (
    <div className="dashboard-recentactivity-recentactivity-activity-item">
      <div className="dashboard-recentactivity-recentactivity-activity-icon">{Icon && <Icon size={16} />}</div>
      <div className="dashboard-recentactivity-recentactivity-activity-content">
        <div className="dashboard-recentactivity-recentactivity-activity-text">{activity.action}</div>
        <div className="dashboard-recentactivity-recentactivity-activity-time">{activity.time}</div>
      </div>
    </div>
  );
};

export default ActivityItem;
