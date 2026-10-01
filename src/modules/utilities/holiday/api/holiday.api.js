import api from "@/api/axios";

export const holidayApi = {
  getHolidays: async () => {
    const response = await api.get("/holidays"); // Updated route prefix
    return response.data?.data || response.data || [];
  },
  createHoliday: async (holidayData) => {
    const response = await api.post("/holidays", holidayData); // Updated route prefix
    return response.data?.data || response.data;
  },
  deleteHoliday: async (id) => {
    const response = await api.delete(`/holidays/${id}`); // Updated route prefix
    return response.data;
  },
};
