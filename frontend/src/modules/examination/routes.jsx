// src/modules/examination/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../../core/auth";

// Import all examination pages
import ExamSetupPage from "./pages/ExamSetupPage";
import MarksEntryPage from "./pages/MarksEntryPage";
import ModerationPage from "./pages/ModerationPage";
import ReportCardPage from "./pages/ReportCardPage";
import PerformanceAnalyticsPage from "./pages/PerformanceAnalyticsPage";
import GradeConfigurationPage from "./pages/GradeConfigurationPage";

const ExaminationRoutes = () => {
  return (
    <Routes>
      {/* Main exam setup page */}
      <Route path="/" element={<ExamSetupPage />} />
      <Route path="/exam-setup" element={<ExamSetupPage />} />

      {/* Marks Entry */}
      <Route path="/marks-entry" element={<MarksEntryPage />} />

      {/* Moderation (Review & Approve) */}
      <Route path="/moderation" element={<ModerationPage />} />

      {/* Report Cards */}
      <Route path="/report-cards" element={<ReportCardPage />} />

      {/* Performance Analytics */}
      <Route path="/analytics" element={<PerformanceAnalyticsPage />} />

      {/* Grade Configuration */}
      <Route path="/grade-scales" element={<GradeConfigurationPage />} />
    </Routes>
  );
};

export default ExaminationRoutes;
