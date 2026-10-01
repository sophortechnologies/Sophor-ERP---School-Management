import React from "react";
import { Routes, Route } from "react-router-dom";
import { CalendarPage } from "./calendar";
import { EmailPage } from "./email";
import { HolidayPage } from "./holiday";

export const UtilitiesRoutes = () => {
  return (
    <Routes>
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="email" element={<EmailPage />} />
      <Route path="holidays" element={<HolidayPage />} />
    </Routes>
  );
};

export default UtilitiesRoutes;
