//staff/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StaffManagement, StaffDetails } from './pages';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route index element={<StaffManagement />} />
      <Route path=":id" element={<StaffDetails />} /> {/* ADD THIS ROUTE */}
    </Routes>
  );
};

export default StaffRoutes;