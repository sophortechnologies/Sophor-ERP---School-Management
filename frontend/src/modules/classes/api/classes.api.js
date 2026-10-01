// src/modules/classes/api/classes.api.js
import api from "../../../api/axios";

const classesApi = {
  // ==================== CLASSES ====================
  getClasses: async (params = {}) => {
    try {
      const response = await api.get("/classes", { params });
      // Backend returns { count, total_pages, data: [...] }
      const items =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      return {
        success: true,
        data: items,
        count: response.data?.count || items.length,
      };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getClassById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      console.error("Error fetching class:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getClassCapacity: async (id) => {
    try {
      const response = await api.get(`/classes/${id}/capacity`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createClass: async (classData) => {
    try {
      const payload = {
        name: classData.name.trim(),
        ...(classData.academicSessionId && {
          academicSessionId: parseInt(classData.academicSessionId),
        }),
      };
      const response = await api.post("/classes", payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create class",
      };
    }
  },

  updateClass: async (id, classData) => {
    try {
      const payload = {
        name: classData.name.trim(),
        ...(classData.academicSessionId !== undefined && {
          academicSessionId: classData.academicSessionId
            ? parseInt(classData.academicSessionId)
            : null,
        }),
      };
      const response = await api.patch(`/classes/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update class",
      };
    }
  },

  deleteClass: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete class",
      };
    }
  },

  // ==================== SECTIONS ====================
  getSections: async (params = {}) => {
    try {
      const response = await api.get("/sections", {
        params: { limit: 100, ...params },
      });
      // Backend returns { data: [...], meta: { ... } }
      const items =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      return { success: true, data: items };
    } catch (error) {
      console.error("Error fetching sections:", error);
      return { success: false, data: [] };
    }
  },

  getSectionsByClass: async (classId) => {
    try {
      const response = await api.get(`/sections/class/${classId}`);
      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      return { success: true, data: items };
    } catch (error) {
      console.error("Error fetching class sections:", error);
      return { success: false, data: [] };
    }
  },

  createSection: async (sectionData) => {
    try {
      const payload = {
        name: sectionData.name.trim(),
        classId: parseInt(sectionData.classId),
        ...(sectionData.capacity && {
          capacity: parseInt(sectionData.capacity),
        }),
      };
      const response = await api.post("/sections", payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create section",
      };
    }
  },

  updateSection: async (id, sectionData) => {
    try {
      const payload = {
        name: sectionData.name.trim(),
        ...(sectionData.capacity && {
          capacity: parseInt(sectionData.capacity),
        }),
      };
      const response = await api.patch(`/sections/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update section",
      };
    }
  },

  deleteSection: async (id) => {
    try {
      const response = await api.delete(`/sections/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete section",
      };
    }
  },

  // ==================== ACADEMIC SESSIONS ====================
  getAcademicSessions: async () => {
    try {
      const response = await api.get("/academic-sessions");
      const list = response.data?.data || response.data || [];
      return {
        success: true,
        data: Array.isArray(list) ? list : [],
      };
    } catch (error) {
      console.warn(
        "Could not fetch /academic-sessions, using fallback:",
        error,
      );
      return {
        success: true,
        data: [
          {
            id: 1,
            name: "2025-2026 Academic Year",
            startDate: "2025-09-01",
            endDate: "2026-06-30",
            isActive: true,
          },
        ],
      };
    }
  },

  // ==================== TEACHERS ====================
  getTeachers: async () => {
    try {
      const response = await api.get("/teacher", {
        params: { page_size: 100 },
      });
      const list = response.data?.data || response.data || [];
      return {
        success: true,
        data: Array.isArray(list) ? list : [],
      };
    } catch (error) {
      console.warn("Could not fetch teachers list:", error);
      return { success: true, data: [] };
    }
  },
};

export { classesApi };
export default classesApi;
