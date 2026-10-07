import React from "react";
import { Routes, Route } from "react-router-dom";
import { PayrollPage, SalaryStructurePage } from "./pages";

export const PayrollRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PayrollPage />} />
      <Route path="/structures" element={<SalaryStructurePage />} />
    </Routes>
  );
};

export default PayrollRoutes;
