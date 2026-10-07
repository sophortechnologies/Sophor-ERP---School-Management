import React from "react";
import { Routes, Route } from "react-router-dom";
import { EmployeeListPage } from "./pages";

export const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeListPage />} />
    </Routes>
  );
};

export default EmployeeRoutes;
