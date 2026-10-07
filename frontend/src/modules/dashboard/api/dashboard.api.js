// src/modules/dashboard/api/dashboard.api.js
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";

class DashboardApi {
  async getAdminStats() {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.ADMIN_STATS);
    return response.data;
  }

  async getTeacherStats(teacherId) {
    const response = await api.get(
      `${API_ENDPOINTS.DASHBOARD.TEACHER_STATS}/${teacherId}`
    );
    return response.data;
  }

  async getStudentStats(studentId) {
    const response = await api.get(
      `${API_ENDPOINTS.DASHBOARD.STUDENT_STATS}/${studentId}`
    );
    return response.data;
  }

  async getParentStats(parentId) {
    const response = await api.get(
      `${API_ENDPOINTS.DASHBOARD.PARENT_STATS}/${parentId}`
    );
    return response.data;
  }

  async getRecentActivities() {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITIES);
    return response.data;
  }
}

export const dashboardApi = new DashboardApi();
