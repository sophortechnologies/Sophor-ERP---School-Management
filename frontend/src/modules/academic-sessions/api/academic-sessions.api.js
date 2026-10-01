// src/modules/academic-sessions/api/academic-sessions.api.js
import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const academicSessionsApi = {
  create: async (data) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ACADEMIC_SESSIONS.BASE,
        data,
      );
      return {
        success: true,
        data: response.data,
        message: "Academic session created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ACADEMIC_SESSIONS.BASE);
      // Handle nested paginated response { data: [...], meta: {...} } or plain array
      const rawData = response.data;
      const list = Array.isArray(rawData) ? rawData : rawData?.data || [];
      return {
        success: true,
        data: list,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getActive: async () => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.ACADEMIC_SESSIONS.BASE}/active`,
      );
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.ACADEMIC_SESSIONS.BY_ID(id));
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.ACADEMIC_SESSIONS.BY_ID(id),
        data,
      );
      return {
        success: true,
        data: response.data,
        message: "Academic session updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  setActive: async (id) => {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.ACADEMIC_SESSIONS.BY_ID(id)}/activate`,
      );
      return {
        success: true,
        data: response.data,
        message: "Academic session activated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  delete: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.ACADEMIC_SESSIONS.BY_ID(id));
      return {
        success: true,
        message: "Academic session deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getStats: async (id) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.ACADEMIC_SESSIONS.BY_ID(id)}/stats`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message,
      };
    }
  },
};
