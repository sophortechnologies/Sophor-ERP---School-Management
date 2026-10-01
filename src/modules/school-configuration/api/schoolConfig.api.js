import api from "../../../api/axios";

const transformConfig = (rawData) => {
  if (!rawData) return null;
  const item = rawData.data || rawData;
  if (!item || Object.keys(item).length === 0) return null;

  return {
    id: item.id || 1,
    schoolName: item.schoolName || item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    address: item.address || "",
    currency: item.currency || "",
    academicYear: item.academicYear || "",
    startDate: item.startDate ? item.startDate.split("T")[0] : "",
    endDate: item.endDate ? item.endDate.split("T")[0] : "",
  };
};

export const schoolConfigApi = {
  getConfig: async () => {
    try {
      const response = await api.get("/school-configuration");
      const normalized = transformConfig(response.data);
      return {
        data: normalized,
        success: true,
      };
    } catch (error) {
      // If backend returns 404 because it's not initialized yet, return empty gracefully without breaking
      return {
        data: null,
        success: false,
        error:
          error.response?.status === 404
            ? null
            : error.response?.data?.message || error.message,
      };
    }
  },

  updateConfig: async (configData) => {
    try {
      const payload = {
        schoolName: configData.schoolName ? configData.schoolName.trim() : "",
        email: configData.email ? configData.email.trim() : "",
        phone: configData.phone ? configData.phone.trim() : "",
        address: configData.address ? configData.address.trim() : "",
        currency: configData.currency
          ? configData.currency.trim().substring(0, 3).toUpperCase()
          : "USD",
        academicYear: configData.academicYear
          ? configData.academicYear.trim()
          : "",
        startDate: configData.startDate
          ? new Date(configData.startDate).toISOString()
          : new Date().toISOString(),
        endDate: configData.endDate
          ? new Date(configData.endDate).toISOString()
          : new Date().toISOString(),
      };

      let response;
      try {
        response = await api.put("/school-configuration", payload);
      } catch (putErr) {
        response = await api.post("/school-configuration", payload);
      }

      const normalized = transformConfig(response.data);
      return {
        data: normalized,
        success: true,
        message: "School configuration saved permanently!",
      };
    } catch (error) {
      let errorMsg = error.response?.data?.message;
      if (Array.isArray(errorMsg)) errorMsg = errorMsg.join(", ");
      return {
        data: null,
        success: false,
        error: errorMsg || error.message || "Failed to save configuration",
      };
    }
  },
};
