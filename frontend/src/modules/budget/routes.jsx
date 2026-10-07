import React from "react";
import { Routes, Route } from "react-router-dom";
import BudgetManagement from "./pages/BudgetManagement";

const BudgetRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BudgetManagement />} />
      <Route path="/list" element={<BudgetManagement />} />
      <Route path="/view/:id" element={<BudgetManagement />} />
      <Route path="/edit/:id" element={<BudgetManagement />} />
      <Route path="/create" element={<BudgetManagement />} />
    </Routes>
  );
};

export default BudgetRoutes;
