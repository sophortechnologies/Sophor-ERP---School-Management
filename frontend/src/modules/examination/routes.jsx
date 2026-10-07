import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  ExamSetupPage,
  MarksEntryPage,
  ReportCardPage,
  GradeConfigurationPage,
} from "./pages";

export const ExaminationRoutes = () => {
  return (
    <Routes>
      {/* /admin/examination -> Exam Setup */}
      <Route path="/" element={<ExamSetupPage />} />
      <Route path="/setup" element={<ExamSetupPage />} />
      <Route path="/marks-entry" element={<MarksEntryPage />} />
      <Route path="/report-cards" element={<ReportCardPage />} />
      <Route path="/grade-scales" element={<GradeConfigurationPage />} />
    </Routes>
  );
};

export default ExaminationRoutes;
