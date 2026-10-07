import api from "@/api/axios";

const STORAGE_KEY = "school_salary_structures_cache";

export const salaryStructureApi = {
  // 1. Fetch all employees
  getStaffMembers: async () => {
    try {
      const res = await api.get("/employees");
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 2. Cache helpers
  getCachedStructures: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveCachedStructure: (userId, structure) => {
    try {
      const current = salaryStructureApi.getCachedStructures();
      current[String(userId)] = structure;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  },

  // 3. POST /salary-structures
  createSalaryStructure: async (payload) => {
    const cleanPayload = {
      userId: Number(payload.userId),
      basePay: Number(payload.basePay),
      isActive: Boolean(payload.isActive ?? true),
      components: [
        {
          name: String(payload.componentName || "Basic Salary").trim(),
          type: String(payload.componentType || "EARNING").toUpperCase(),
          calculationType: String(
            payload.calculationType || "FIXED",
          ).toUpperCase(),
          value: Number(payload.componentValue || payload.basePay),
        },
      ],
    };

    let serverData = null;
    try {
      const response = await api.post("/salary-structures", cleanPayload);
      serverData = response.data?.data || response.data;
    } catch (err) {
      console.warn(
        "Server POST returned an error:",
        err.response?.data || err.message,
      );
      throw err;
    }

    const savedRecord = serverData || {
      id: Date.now(),
      userId: cleanPayload.userId,
      basePay: cleanPayload.basePay,
      isActive: cleanPayload.isActive,
      components: cleanPayload.components,
    };

    salaryStructureApi.saveCachedStructure(cleanPayload.userId, savedRecord);
    return savedRecord;
  },

  // 4. PATCH /salary-structures/:id
  updateSalaryStructure: async (id, payload, userId) => {
    const cleanPayload = {
      basePay: Number(payload.basePay),
      isActive: Boolean(payload.isActive ?? true),
    };

    if (payload.componentName && payload.componentValue !== undefined) {
      cleanPayload.components = [
        {
          name: String(payload.componentName).trim(),
          type: String(payload.componentType || "EARNING").toUpperCase(),
          calculationType: String(
            payload.calculationType || "FIXED",
          ).toUpperCase(),
          value: Number(payload.componentValue),
        },
      ];
    }

    let updatedServer = null;
    try {
      const response = await api.patch(
        `/salary-structures/${id}`,
        cleanPayload,
      );
      updatedServer = response.data?.data || response.data;
    } catch {
      // Fallback to local sync
    }

    const result = {
      id,
      userId: Number(userId),
      basePay: cleanPayload.basePay,
      isActive: cleanPayload.isActive,
      components: cleanPayload.components,
      ...(updatedServer || {}),
    };

    if (userId) {
      salaryStructureApi.saveCachedStructure(userId, result);
    }

    return result;
  },

  // 5. Toggle Active/Deactivate
  toggleStructureActive: async (id, isActive, currentBasePay, userId) => {
    const cleanPayload = {
      isActive: Boolean(isActive),
      basePay: Number(currentBasePay),
    };

    try {
      await api.patch(`/salary-structures/${id}`, cleanPayload);
    } catch {
      // Fallback
    }

    const currentCached =
      salaryStructureApi.getCachedStructures()[String(userId)] || {};
    const updated = {
      ...currentCached,
      id,
      userId: Number(userId),
      isActive: Boolean(isActive),
      basePay: Number(currentBasePay),
    };

    if (userId) {
      salaryStructureApi.saveCachedStructure(userId, updated);
    }

    return updated;
  },
};

export default salaryStructureApi;
