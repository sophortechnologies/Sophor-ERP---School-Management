import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  FeeAccountingLanding,
  FeeCollectionPage,
  FeeConfigurationPage,
  FinancialReportsPage,
  PaymentHistoryPage,
} from './pages';

const FeeAccountingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FeeAccountingLanding />} />
      <Route path="/collection" element={<FeeCollectionPage />} />
      <Route path="/configuration" element={<FeeConfigurationPage />} />
      <Route path="/history" element={<PaymentHistoryPage />} />
      <Route path="/reports" element={<FinancialReportsPage />} />
      {/* Disable non-existent routes for now */}
      {/* <Route path="/outstanding" element={<Navigate to="/" replace />} />
      <Route path="/students" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
};

export default FeeAccountingRoutes;