// src/modules/teacher/api/teacher.api.js
import api from "../../../api/axios";
import { subjectApi } from "../../subject/api/subject.api";

/**
 * Normalize teacher object from backend → frontend
 */
const transformTeacher = (teacher) => {
  if (!teacher) return null;

  // Hydrate missing fields from local metadata if backend omitted them
  const emailKey = teacher.email
    ? `teacher_meta_${teacher.email.toLowerCase()}`
    : null;
  const idKey = `teacher_meta_id_${teacher.id}`;
  const rawCached =
    (emailKey && localStorage.getItem(emailKey)) || localStorage.getItem(idKey);
  const cached = rawCached ? JSON.parse(rawCached) : {};

  const departmentName =
    teacher.department || cached.departmentName || "Computer Science";
  const specialization =
    teacher.specialization || cached.specialization || "Physics";
  const employmentType =
    teacher.employmentType || cached.employmentType || "full_time";
  const qualification =
    teacher.qualification || cached.qualification || "bachelor";
  const gender = teacher.gender || cached.gender || "male";
  const address = teacher.address || cached.address || "Addis Ababa, Ethiopia";

  return {
    id: teacher.id,
    userId: teacher.userId || teacher.user?.id || cached.userId || teacher.id,
    teacherId: `TC${String(teacher.id).padStart(4, "0")}`,
    username:
      teacher.username || cached.username || teacher.email?.split("@")[0] || "",
    email: teacher.email || "",
    firstName: teacher.first_name || teacher.firstName || "",
    lastName: teacher.last_name || teacher.lastName || "",
    phone: teacher.phone || "",
    dateOfBirth: teacher.dateOfBirth
      ? teacher.dateOfBirth.split("T")[0]
      : cached.dateOfBirth || "",
    gender,
    address,
    qualification,
    specialization,
    employmentType,
    dateOfJoining: teacher.dateOfJoining
      ? teacher.dateOfJoining.split("T")[0]
      : cached.dateOfJoining || "",
    salary: teacher.salary || cached.salary || 0,
    status: teacher.status || cached.status || "active",
    isActive:
      (teacher.status || cached.status || "active").toLowerCase() === "active",
    departmentId: teacher.departmentId || cached.departmentId || null,
    departmentName,
    fullName:
      `${teacher.first_name || teacher.firstName || ""} ${teacher.last_name || teacher.lastName || ""}`.trim(),
    createdAt: teacher.createdAt,
  };
};

const teacherApi = {
  // ==================== GET ALL TEACHERS (Max 10 / Page) ====================
  getAllTeachers: async (params = {}) => {
    try {
      const page = params.page || 1;
      const pageSize = params.page_size || 10; // 👈 Max 10 per page

      const response = await api.get("/teacher", {
        params: { ...params, page, page_size: pageSize },
      });

      let teachers = [];
      let total = 0;

      if (response.data?.data && Array.isArray(response.data.data)) {
        teachers = response.data.data;
        total = response.data.count || teachers.length;
      } else if (Array.isArray(response.data)) {
        teachers = response.data;
        total = teachers.length;
      }

      const transformed = teachers.map(transformTeacher).filter(Boolean);

      return {
        data: transformed,
        total,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== GET TEACHER BY ID ====================
  getTeacherById: async (id) => {
    try {
      const response = await api.get(`/teacher/${id}`);
      const teacherData = response.data?.data || response.data;
      return {
        data: transformTeacher(teacherData),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== CREATE TEACHER ====================
  createTeacher: async (teacherData) => {
    try {
      const payload = {
        username: teacherData.username || teacherData.email.split("@")[0],
        email: teacherData.email,
        password: teacherData.password,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        phone: teacherData.phone,
        dateOfBirth: teacherData.dateOfBirth || null,
        gender: teacherData.gender || "male",
        address: teacherData.address || null,
        qualification: teacherData.qualification || "bachelor",
        specialization: teacherData.specialization || "Physics",
        employmentType: teacherData.employmentType || "full_time",
        dateOfJoining:
          teacherData.dateOfJoining || new Date().toISOString().split("T")[0],
        salary: teacherData.salary ? parseFloat(teacherData.salary) : 0,
        status: (teacherData.status || "active").toLowerCase(),
        emergencyContact: teacherData.emergencyContact || null,
        emergencyPhone: teacherData.emergencyPhone || null,
        departmentId: parseInt(teacherData.departmentId),
      };

      const response = await api.post("/teacher/register", payload);
      return {
        data: transformTeacher(response.data),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create teacher",
      };
    }
  },

  // ==================== UPDATE TEACHER ====================
  updateTeacher: async (id, teacherData) => {
    try {
      const payload = {
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        phone: teacherData.phone,
        email: teacherData.email,
        employmentType: teacherData.employmentType,
        gender: teacherData.gender,
        qualification: teacherData.qualification,
        specialization: teacherData.specialization,
        status: (teacherData.status || "active").toLowerCase(),
      };

      if (teacherData.departmentId) {
        payload.departmentId = parseInt(teacherData.departmentId);
      }
      if (teacherData.salary) {
        payload.salary = parseFloat(teacherData.salary);
      }
      if (teacherData.address) payload.address = teacherData.address;
      if (teacherData.dateOfBirth)
        payload.dateOfBirth = teacherData.dateOfBirth;

      const response = await api.patch(`/teacher/${id}`, payload);
      return {
        data: transformTeacher(response.data),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== DELETE / DEACTIVATE TEACHER ====================
  deleteTeacher: async (id) => {
    try {
      // The backend does not expose DELETE /teacher/:id (returns 404).
      // We gracefully deactivate the teacher via PATCH /teacher/:id with status: 'inactive'
      const response = await api.patch(`/teacher/${id}`, {
        status: "inactive",
      });
      return {
        success: true,
        message:
          "Teacher deactivated successfully (Backend does not support hard delete)",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to deactivate teacher.",
      };
    }
  },

  getSpecializationsFromSubjects: async () => {
    try {
      const response = await subjectApi.getAllSubjects();
      const subjects = response.data || [];
      const specs = Array.from(
        new Set(subjects.map((s) => s.name).filter(Boolean)),
      ).sort();
      return {
        data:
          specs.length > 0
            ? specs
            : ["Physics", "Mathematics", "English", "Chemistry", "Biology"],
        success: true,
      };
    } catch {
      return {
        data: ["Physics", "Mathematics", "English", "Chemistry", "Biology"],
        success: true,
      };
    }
  },
};

export { teacherApi };
