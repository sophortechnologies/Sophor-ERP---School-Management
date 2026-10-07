// src/modules/subject/api/subject.api.js
import api from "../../../api/axios";

/**
 * Normalize subject object from backend → frontend
 */
const transformSubject = (subject) => {
  if (!subject) return null;
  return {
    id: subject.id,
    subjectId: `SUB${String(subject.id).padStart(4, "0")}`,
    name: subject.name || "",
    code: subject.code || "",
    type: (subject.type || "CORE").toUpperCase(),
    description: subject.description || "",
    departmentId: subject.departmentId || null,
    departmentName: subject.department?.name || "",
    isActive: subject.isActive !== false,
    status: subject.isActive !== false ? "ACTIVE" : "INACTIVE",
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
};

const subjectApi = {
  // ==================== GET ALL SUBJECTS ====================
  getAllSubjects: async (params = {}) => {
    try {
      const response = await api.get("/subjects", { params });

      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response.data?.data)) {
        list = response.data.data;
      }

      return {
        data: list.map(transformSubject).filter(Boolean),
        total: list.length,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch subjects",
      };
    }
  },

  // ==================== GET SUBJECT BY ID ====================
  getSubjectById: async (id) => {
    try {
      const response = await api.get(`/subjects/${id}`);
      return {
        data: transformSubject(response.data?.data || response.data),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== CREATE SUBJECT ====================
  createSubject: async (subjectData) => {
    try {
      const payload = {
        name: subjectData.name.trim(),
        code: subjectData.code.trim().toUpperCase(),
        type: (subjectData.type || "CORE").toUpperCase(),
        ...(subjectData.description && {
          description: subjectData.description.trim(),
        }),
        ...(subjectData.departmentId && {
          departmentId: parseInt(subjectData.departmentId),
        }),
        isActive: subjectData.isActive !== false,
      };

      const response = await api.post("/subjects", payload);
      return {
        data: transformSubject(response.data),
        success: true,
        message: "Subject created successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create subject",
      };
    }
  },

  // ==================== UPDATE SUBJECT ====================
  updateSubject: async (id, subjectData) => {
    try {
      const payload = {
        name: subjectData.name.trim(),
        code: subjectData.code.trim().toUpperCase(),
        type: (subjectData.type || "CORE").toUpperCase(),
        description: subjectData.description
          ? subjectData.description.trim()
          : null,
        departmentId: subjectData.departmentId
          ? parseInt(subjectData.departmentId)
          : null,
        isActive: subjectData.isActive !== false,
      };

      const response = await api.patch(`/subjects/${id}`, payload);
      return {
        data: transformSubject(response.data),
        success: true,
        message: "Subject updated successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update subject",
      };
    }
  },

  // ==================== DELETE SUBJECT ====================
  deleteSubject: async (id) => {
    try {
      const response = await api.delete(`/subjects/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Subject deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Cannot delete subject linked to courses, timetables, or exam records.",
      };
    }
  },
};

export { subjectApi };
export default subjectApi;
