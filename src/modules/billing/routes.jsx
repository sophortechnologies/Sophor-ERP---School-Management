import React from "react";
import { Routes, Route } from "react-router-dom";
import { InvoicesPage, FeeSetupPage, PaymentsPage } from "./pages";

export const BillingRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<InvoicesPage />} />
      <Route index element={<InvoicesPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="*" element={<InvoicesPage />} />
    </Routes>
  );
};

export const FeeSetupRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<FeeSetupPage />} />
      <Route index element={<FeeSetupPage />} />
      <Route path="*" element={<FeeSetupPage />} />
    </Routes>
  );
};

export default BillingRoutes;
