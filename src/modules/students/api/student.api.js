// src/modules/students/api/student.api.js
import api from "../../../api/axios";

export const studentAPI = {
  // ==================== ACADEMIC SESSIONS ====================
  getAcademicSessions: async () => {
    try {
      const response = await api.get("/academic-sessions");
      return {
        data: response.data?.data || response.data || [],
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch academic sessions",
      };
    }
  },
  createAcademicSession: (sessionData) =>
    api.post("/academic-sessions", sessionData),

  // ==================== STUDENTS CRUD ====================
  createStudentAdmission: (studentData) => api.post("/students", studentData),
  getStudents: (params = {}) => api.get("/students", { params }),
  getStudentById: (studentId) => api.get(`/students/${studentId}`),
  updateStudent: (studentId, updateData) =>
    api.patch(`/students/${studentId}`, updateData),
  deleteStudent: (studentId) => api.delete(`/students/${studentId}`),
  getAdmissionHistory: (studentId) =>
    api.get(`/students/${studentId}/admission-history`),

  // ==================== ACCOUNT ACTIVATION ====================
  activateStudent: (studentId, password) =>
    api.post(`/students/activate-student/${studentId}`, { password }),

  // ==================== DOCUMENTS ====================
  uploadDocument: (studentId, documentType, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    return api.post(`/students/${studentId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getStudentDocuments: (studentId) =>
    api.get(`/students/${studentId}/documents`),

  // ==================== CLASSES & SECTIONS ====================
  getClasses: async () => {
    try {
      const response = await api.get("/classes");
      return {
        data: response.data?.data || response.data || [],
        success: true,
        message: "Classes fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch classes",
      };
    }
  },

  getClassesList: async () => {
    try {
      const response = await api.get("/class");
      return {
        data: response.data?.data || response.data || [],
        success: true,
        message: "Classes list fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching classes list:", error);
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch classes list",
      };
    }
  },

  getSections: async () => {
    try {
      const response = await api.get("/sections");
      return {
        data: response.data?.data || response.data || [],
        success: true,
        message: "Sections fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching sections:", error);
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch sections",
      };
    }
  },

  getSectionsList: async () => {
    try {
      const response = await api.get("/section");
      return {
        data: response.data?.data || response.data || [],
        success: true,
        message: "Sections list fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching sections list:", error);
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch sections list",
      };
    }
  },

  getSectionsByClass: async (classId) => {
    try {
      const response = await api.get("/section", { params: { classId } });
      return {
        data: response.data?.data || response.data || [],
        success: true,
        message: `Sections for class ${classId} fetched successfully`,
      };
    } catch (error) {
      console.error(`Error fetching sections for class ${classId}:`, error);
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          `Failed to fetch sections for class ${classId}`,
      };
    }
  },

  // ==================== SEARCH, STATS & WORKFLOWS ====================
  searchStudents: (query) =>
    api.get("/students/search", { params: { q: query } }),
  generateAdmissionConfirmation: (studentId) =>
    api.get(`/students/${studentId}/confirmation-receipt`),
  getStudentStatistics: () => api.get("/students/statistics"),
  getStudentDashboard: (studentId) =>
    api.get(`/students/${studentId}/dashboard`),
  assignClass: (studentId, classId, sectionId) =>
    api.patch(`/students/${studentId}/assign-class`, { classId, sectionId }),
  scheduleTest: (studentId, testDate, testType) =>
    api.post(`/students/${studentId}/schedule-test`, { testDate, testType }),
  recordTestResult: (studentId, score, result, remarks) =>
    api.post(`/students/${studentId}/record-test-result`, {
      score,
      result,
      remarks,
    }),
};
