// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  schoolConfigurationRoutes,
  SchoolConfigPage,
} from "@/modules/school-configuration";
import { ProtectedRoute, PublicRoute } from "./core/auth";
import LoginPage from "./modules/authentication/pages/LoginPage";
import DebugLogin from "./components/DebugLogin";
import AdminDashboard from "./modules/dashboard/pages/AdminDashboard";
import TeacherDashboard from "./modules/dashboard/pages/TeacherDashboard";
import StudentDashboard from "./modules/dashboard/pages/StudentDashboard";
import ParentDashboard from "./modules/dashboard/pages/ParentDashboard";
import StudentManagement from "./modules/students/pages/StudentManagement";
import StudentAdmissionForm from "./modules/students/components/StudentAdmissionForm";
import ClassesManagement from "./modules/classes/pages/ClassesManagement";
import { DASHBOARD_ROUTES } from "./constants/roles";
import StaffRoutes from "./modules/staff/routes.jsx";
import AttendanceRoutes from "./modules/attendance/routes.jsx";
import AttendanceManagement from "./modules/attendance/pages/AttendanceManagement.jsx";
import { UtilitiesRoutes } from "@/modules/utilities/routes";
// FIX: Import ExaminationRoutes from the barrel file, not directly
import { ExaminationRoutes } from "./modules/examination/index.js";
import MarksEntryPage from "./modules/examination/pages/MarksEntryPage.jsx";
import { DepartmentRoutes } from "./modules/department";
import CommunicationRoutes from "./modules/communication/routes";
// Imports near top of AppRoutes.jsx:
import StudentGradesPage from "./modules/students/pages/StudentGradesPage.jsx";
import StudentSchedulePage from "./modules/students/pages/StudentSchedulePage.jsx";
import StudentAttendancePage from "./modules/students/pages/StudentAttendancePage.jsx";
import StudentFeesPage from "./modules/students/pages/StudentFeesPage.jsx";
// Import Teacher and Subject routes
import { TeacherRoutes } from "./modules/teacher";
import { SubjectRoutes } from "./modules/subject";
import { FeeAccountingRoutes } from "./modules/fee-accounting";
import { TimetableRoutes, TeacherTimetableRoutes } from "./modules/timetable";
import { StaffAttendanceRoutes } from "./modules/staff-attendance";
import { NotificationRoutes } from "./modules/notifications";
import { TeacherClassSubjectAssignment } from "./modules/assignments";
import TeacherMyStudentsPage from "./modules/teacher/pages/TeacherMyStudentsPage.jsx";
import TeacherProfileSelfPage from "./modules/teacher/pages/TeacherProfileSelfPage.jsx";
import { AcademicSessionRoutes } from "./modules/academic-sessions";
import AssetRoutes from "./modules/assets/routes";
import BudgetRoutes from "./modules/budget/routes";
import { StudentTimetableRoutes } from "./modules/timetable";
import ReportCardPage from "./modules/examination/pages/ReportCardPage.jsx";
const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  console.log("APP ROUTES RENDERED", {
    isAuthenticated,
    user: user?.username,
    userRole: user?.role,
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/debug" element={<DebugLogin />} />

      {/* ============ ADMIN ROUTES ============ */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "SUPER_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "SUPER_ADMIN", "TEACHER", "STAFF"]}
          >
            <CommunicationRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-class-subject-assignment"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin"]}>
            <TeacherClassSubjectAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin"]}>
            <StudentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/admission"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin"]}>
            <StudentAdmissionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "hr", "HR"]}>
            <StaffRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilities/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "SUPER_ADMIN", "staff", "Staff"]}
          >
            <UtilitiesRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "teacher", "Teacher"]}
          >
            <AttendanceRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff-attendance/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "hr", "HR", "teacher", "Teacher"]}
          >
            <StaffAttendanceRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/examination/*"
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
              "Admin",
              "teacher",
              "Teacher",
              "exam_officer",
              "Exam_Officer",
            ]}
          >
            <ExaminationRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assets/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "SUPER_ADMIN", "FINANCE"]}
          >
            <AssetRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/budget/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "SUPER_ADMIN", "FINANCE"]}
          >
            <BudgetRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "SUPER_ADMIN", "hr", "HR"]}
          >
            {" "}
            <DepartmentRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "teacher", "Teacher"]}
          >
            <ClassesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fee-accounting/*"
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
              "Admin",
              "accountant",
              "Accountant",
              "finance",
              "Finance",
            ]}
          >
            <FeeAccountingRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "teacher", "Teacher"]}
          >
            <TimetableRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/academic-sessions/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "SUPER_ADMIN"]}>
            <AcademicSessionRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "hr", "HR"]}>
            <TeacherRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "teacher", "Teacher"]}
          >
            <SubjectRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "Admin", "teacher", "Teacher", "hr", "HR"]}
          >
            <NotificationRoutes />
          </ProtectedRoute>
        }
      />

      {/* ============ TEACHER ROUTES ============ */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["teacher", "Teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/communication/*"
        element={
          <ProtectedRoute
            allowedRoles={["teacher", "Teacher", "admin", "Admin"]}
          >
            <CommunicationRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/timetable/*"
        element={
          <ProtectedRoute
            allowedRoles={["teacher", "Teacher", "admin", "Admin"]}
          >
            <TeacherTimetableRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRoles={["teacher", "Teacher"]}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/grades"
        element={
          <ProtectedRoute allowedRoles={["teacher", "Teacher"]}>
            <MarksEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute allowedRoles={["teacher", "Teacher"]}>
            <TeacherMyStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={["teacher", "Teacher"]}>
            <TeacherProfileSelfPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student", "Student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/grades"
        element={
          <ProtectedRoute allowedRoles={["student", "Student"]}>
            <StudentGradesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <ProtectedRoute allowedRoles={["student", "Student"]}>
            <StudentSchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["student", "Student"]}>
            <StudentAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/fees"
        element={
          <ProtectedRoute allowedRoles={["student", "Student"]}>
            <StudentFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute allowedRoles={["parent", "Parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/school-configuration/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "Admin", "SUPER_ADMIN"]}>
            <SchoolConfigPage />
          </ProtectedRoute>
        }
      />
      {/* Root route */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={DASHBOARD_ROUTES[user.role] || "/admin/dashboard"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
