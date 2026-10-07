import api from "@/api/axios";

export const billsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/billing/bills");
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  getById: async (id) => {
    const res = await api.get(`/billing/bills/${id}`);
    return res.data?.data || res.data;
  },

  getByStudentId: async (studentId) => {
    const res = await api.get(`/billing/bills/student/${studentId}`);
    return res.data?.data || res.data || [];
  },

  create: async (payload) => {
    // Lock bill creation to the fee configuration
    const cleanPayload = {
      studentId: Number(payload.studentId),
      billConfigId: Number(payload.billConfigId),
      ...(payload.dueDate
        ? { dueDate: new Date(payload.dueDate).toISOString() }
        : {}),
    };
    const res = await api.post("/billing/bills", cleanPayload);
    return res.data?.data || res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/billing/bills/${id}/status`, { status });
    return res.data?.data || res.data;
  },
};

export default billsApi;
