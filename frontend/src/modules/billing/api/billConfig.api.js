import api from "@/api/axios";

export const billConfigApi = {
  getAll: async () => {
    try {
      const res = await api.get("/billing/configs");
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  getById: async (id) => {
    const res = await api.get(`/billing/configs/${id}`);
    return res.data?.data || res.data;
  },

  getByClass: async (classId) => {
    const res = await api.get(`/billing/configs/class/${classId}`);
    return res.data?.data || res.data || [];
  },

  create: async (payload) => {
    const cleanPayload = {
      classId: Number(payload.classId),
      feeType: String(payload.feeType),
      amount: Number(payload.amount),
      paymentMethodOptions:
        Array.isArray(payload.paymentMethodOptions) &&
        payload.paymentMethodOptions.length > 0
          ? payload.paymentMethodOptions
          : ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"],
      ...(payload.description
        ? { description: String(payload.description).trim() }
        : {}),
    };
    const res = await api.post("/billing/configs", cleanPayload);
    return res.data?.data || res.data;
  },

  update: async (id, payload) => {
    // Only send whitelisted fields for UpdateBillConfigDto (no classId, no feeType)
    const cleanPayload = {
      ...(payload.amount !== undefined && { amount: Number(payload.amount) }),
      ...(payload.paymentMethodOptions && {
        paymentMethodOptions: payload.paymentMethodOptions,
      }),
      ...(payload.description !== undefined && {
        description: String(payload.description).trim(),
      }),
    };
    const res = await api.patch(`/billing/configs/${id}`, cleanPayload);
    return res.data?.data || res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/billing/configs/${id}`);
    return res.data?.data || res.data;
  },
};

export default billConfigApi;
