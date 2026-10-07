import React from "react";
import { MarkEntryPage } from "./pages/MarkEntryPage";
import { ReportCardsPage } from "./pages/ReportCardsPage";

export const gradingRoutes = [
  {
    path: "/grading/marks",
    element: <MarkEntryPage />,
  },
  {
    path: "/grading/report-cards",
    element: <ReportCardsPage />,
  },
];

export default gradingRoutes;
