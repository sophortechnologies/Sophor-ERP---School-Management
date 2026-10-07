import axiosInstance from "../../../api/axios";

export const parentApi = {
  // 1. Fetch students to extract parent/guardian records
  getStudents: async (params = {}) => {
    const response = await axiosInstance.get("/students", { params });
    return response.data;
  },

  // 2. Fetch classes for cascading dropdown
  getClasses: async () => {
    try {
      const response = await axiosInstance.get("/classes");
      return response.data;
    } catch {
      return [];
    }
  },

  // 3. Update guardian details on the student record (PATCH /api/students/:id)
  updateGuardianDetails: async (studentId, payload) => {
    const response = await axiosInstance.patch(
      `/students/${studentId}`,
      payload,
    );
    return response.data;
  },

  // 4. Standalone Parent actions
  registerParent: async (parentData) => {
    const response = await axiosInstance.post("/parent/register", parentData);
    return response.data;
  },

  assignChild: async (payload) => {
    const response = await axiosInstance.post("/parent/assign-child", payload);
    return response.data;
  },

  removeChild: async (payload) => {
    const response = await axiosInstance.post("/parent/remove-child", payload);
    return response.data;
  },

  // 5. Parent Self-Service Portal
  getMyChildren: async () => {
    const response = await axiosInstance.get("/parent/my-children");
    return response.data;
  },

  getChildAttendance: async (studentId, params = {}) => {
    const response = await axiosInstance.get(
      `/parent/children/${studentId}/attendance`,
      { params },
    );
    return response.data;
  },

  getChildReportCard: async (studentId, params = {}) => {
    const response = await axiosInstance.get(
      `/parent/children/${studentId}/report-card`,
      { params },
    );
    return response.data;
  },
};

export default parentApi;
