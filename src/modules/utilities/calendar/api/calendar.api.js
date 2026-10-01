import api from "@/api/axios";

export const calendarApi = {
  getEvents: async () => {
    const response = await api.get("/calendar");
    return response.data?.data || response.data || [];
  },
  createEvent: async (eventData) => {
    const response = await api.post("/calendar", eventData);
    return response.data?.data || response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },
};
