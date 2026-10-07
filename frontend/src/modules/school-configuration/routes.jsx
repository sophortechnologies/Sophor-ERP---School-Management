import React from "react";
import { SchoolConfigPage } from "./pages";

export const schoolConfigurationRoutes = [
  {
    path: "/admin/school-configuration",
    element: <SchoolConfigPage />,
    protected: true,
  },
];
