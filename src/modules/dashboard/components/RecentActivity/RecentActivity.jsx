import React from "react";
import ActivityItem from "./ActivityItem";
import "./RecentActivity.css";

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "student":
        return "Users";
      case "finance":
        return "DollarSign";
      case "academic":
        return "BookOpen";
      case "staff":
        return "UserPlus";
      default:
        return "Bell";
    }
  };

  const activitiesWithIcons = activities.map((activity) => ({
    ...activity,
    icon: getActivityIcon(activity.type),
  }));

  return (
    <section className="dashboard-recentactivity-recentactivity-activity-section">
      <h2>Recent Activity</h2>
      <div className="dashboard-recentactivity-recentactivity-activity-list">
        {activitiesWithIcons.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
};

export default RecentActivity;
