import api from "@/api/axios";

export const employeeApi = {
  getAllEmployees: async () => {
    const res = await api.get("/employees");
    return res.data?.data || res.data || [];
  },

  getAssignableUsers: async () => {
    try {
      const res = await api.get("/users");
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getEmployeeById: async (id) => {
    const res = await api.get(`/employees/${id}`);
    return res.data?.data || res.data;
  },

  createEmployee: async (payload) => {
    const cleanPayload = {
      userId: Number(payload.userId),
      designation: String(payload.designation).trim(),
      employmentType: payload.employmentType || "PERMANENT",
      status: payload.status || "ACTIVE",
    };

    if (payload.departmentId) {
      cleanPayload.departmentId = Number(payload.departmentId);
    }

    if (payload.joiningDate) {
      cleanPayload.joiningDate = payload.joiningDate;
    }

    const res = await api.post("/employees", cleanPayload);
    return res.data?.data || res.data;
  },

  updateEmployee: async (id, payload) => {
    const cleanPayload = {};

    if (payload.designation !== undefined) {
      cleanPayload.designation = String(payload.designation).trim();
    }
    if (payload.employmentType !== undefined) {
      cleanPayload.employmentType = payload.employmentType;
    }
    if (payload.status !== undefined) {
      cleanPayload.status = payload.status;
    }
    if (payload.departmentId !== undefined && payload.departmentId !== "") {
      cleanPayload.departmentId = Number(payload.departmentId);
    }
    if (payload.joiningDate !== undefined) {
      cleanPayload.joiningDate = payload.joiningDate;
    }

    const res = await api.patch(`/employees/${id}`, cleanPayload);
    return res.data?.data || res.data;
  },

  deleteEmployee: async (id) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
};

export default employeeApi;
