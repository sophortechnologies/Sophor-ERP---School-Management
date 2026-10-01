import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ClassesManagement } from './index';
import ClassDetails from './pages/ClassDetails';

const ClassesRoutes = () => {
  return (
    <Routes>
      <Route path="/classes" element={<ClassesManagement />} />
       <Route path="/:id" element={<ClassDetails />} />
      {/* Add more routes as needed */}
      {/* <Route path="/classes/:id" element={<ClassDetails />} /> */}
    </Routes>
  );
};

export default ClassesRoutes;