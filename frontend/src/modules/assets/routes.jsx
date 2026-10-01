// src/modules/assets/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AssetManagement from "./pages/AssetManagement";

const AssetRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AssetManagement />} />
      <Route path="/list" element={<AssetManagement />} />
      <Route path="/view/:id" element={<AssetManagement />} />
      <Route path="/edit/:id" element={<AssetManagement />} />
      <Route path="/create" element={<AssetManagement />} />
    </Routes>
  );
};

export default AssetRoutes;
