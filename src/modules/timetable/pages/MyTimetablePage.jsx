// src/modules/timetable/pages/MyTimetablePage.jsx
import React, { useEffect } from "react";
import { useTimetable } from "../hooks/useTimetable";
import TimetableView from "../components/TimetableView";
// import "./TimetablePage.css";

const MyTimetablePage = () => {
  const { timetable, loading, error, loadMyTimetable } = useTimetable();

  useEffect(() => {
    loadMyTimetable();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button className="btn btn-primary" onClick={loadMyTimetable}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="timetable-page">
      <TimetableView
        timetable={timetable}
        title="My Class Schedule"
        vi