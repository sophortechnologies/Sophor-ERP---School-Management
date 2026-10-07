import React from "react";
import { Routes, Route } from "react-router-dom";
import CommunicationPage from "./pages/CommunicationPage";

const CommunicationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CommunicationPage />} />
      <Route path="/inbox" element={<CommunicationPage />} />
      <Route path="/sent" element={<CommunicationPage />} />
    </Routes>
  );
};

export default CommunicationRoutes;
