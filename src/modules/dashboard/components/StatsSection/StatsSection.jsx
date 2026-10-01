// src/components/StatsSection.js
import React from "react";
import StatCard from "./StatCard";
import "./StatsSection.css";

const StatsSection = ({ stats }) => {
  const statCards = [
    {
      id: "students",
      number: stats.totalStudents,
      title: "Total Students",
      // trend: "Total Count",
    },
    {
      id: "teachers", // ADDED: Total Teachers
      number: stats.totalTeachers,
      title: "Total Teachers",
      // trend: "Total Count",
    },
    {
      id: "staff",
      number: stats.totalStaff,
      title: "Staff Members",
      // trend: "Total Count",
    },
    {
      id: "classes",
      number: stats.activeClasses,
      title: "Active Classes",
      // trend: "Total Count",
    },
    {
      id: "revenue",
      number: `$${stats.revenue}`,
      title: "Revenue",
      // trend: "Total Amount",
    },
  ];

  return (
    <section className="dashboard-statssection-statssection-stats-section">
      <h2>System Overview</h2>
      <div className="stats-grid">
        {statCards.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default StatsSection;