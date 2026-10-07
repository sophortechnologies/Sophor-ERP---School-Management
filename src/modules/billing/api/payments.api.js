import api from "@/api/axios";

export const paymentsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/billing/payments");
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  getById: async (id) => {
    const res = await api.get(`/billing/payments/${id}`);
    return res.data?.data || res.data;
  },

  recordPayment: async (payload) => {
    // Only send the exact whitelisted fields accepted by CreatePaymentDto
    const cleanPayload = {
      studentId: Number(payload.studentId),
      billId: Number(payload.billId),
      amountPaid: Number(payload.amountPaid),
      paymentMethod: payload.paymentMethod || "CASH",
      paymentDate: payload.paymentDate || new Date().toISOString(),
    };

    const res = await api.post("/billing/payments", cleanPayload);
    return res.data?.data || res.data;
  },

  update: async (id, payload) => {
    const res = await api.patch(`/billing/payments/${id}`, payload);
    return res.data?.data || res.data;
  },
};

export default paymentsApi;
