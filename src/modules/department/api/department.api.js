// src/modules/department/api/department.api.js
import api from "../../../api/axios";

/**
 * Normalize department object from backend → frontend
 */
const transformDepartment = (dept) => {
  if (!dept) return null;

  const isActive = dept.isActive !== undefined ? dept.isActive : true;

  return {
    id: dept.id,
    name: dept.name || "",
    code: dept.code || "",
    description: dept.description || "",
    headId: dept.headId || dept.head_id || null,
    isActive: isActive,
    status: isActive ? "active" : "inactive",
    counts: dept._count || { teachers: 0, staff: 0, subjects: 0 },
    createdAt: dept.createdAt || dept.created_at,
    updatedAt: dept.updatedAt || dept.updated_at,
  };
};

const departmentApi = {
  // ==================== GET ALL DEPARTMENTS ====================
  getAllDepartments: async (params = {}) => {
    try {
      const response = await api.get("/departments", { params });

      let departments = [];
      let total = 0;

      if (response.data?.data && Array.isArray(response.data.data)) {
        departments = response.data.data;
        total = response.data.meta?.total || departments.length;
      } else if (Array.isArray(response.data)) {
        departments = response.data;
        total = departments.length;
      }

      return {
        data: departments.map(transformDepartment),
        total,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        error: error.response?.data?.message || error.message,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== GET ACTIVE DEPARTMENTS ====================
  getActiveDepartments: async () => {
    try {
      const response = await api.get("/departments/active");
      const departments = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      return {
        data: departments.map(transformDepartment),
        total: departments.length,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        error: error.response?.data?.message || error.message,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== GET DEPARTMENT BY ID ====================
  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return {
        data: transformDepartment(response.data?.data || response.data),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== CREATE DEPARTMENT ====================
  createDepartment: async (departmentData) => {
    try {
      const payload = {
        name: departmentData.name,
        code: departmentData.code,
        ...(departmentData.description && {
          description: departmentData.description,
        }),
        ...(departmentData.headId && {
          headId: parseInt(departmentData.headId),
        }),
      };

      const response = await api.post("/departments", payload);
      return {
        data: transformDepartment(response.data?.data || response.data),
        success: true,
        message: "Department created successfully",
      };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create department";
      return {
        data: null,
        success: false,
        error: errMsg,
        message: errMsg,
      };
    }
  },

  // ==================== UPDATE DEPARTMENT ====================
  updateDepartment: async (id, departmentData) => {
    try {
      const payload = {
        ...(departmentData.name && { name: departmentData.name }),
        ...(departmentData.code && { code: departmentData.code }),
        ...(departmentData.description !== undefined && {
          description: departmentData.description,
        }),
        ...(departmentData.headId !== undefined && {
          headId: departmentData.headId
            ? parseInt(departmentData.headId)
            : null,
        }),
      };

      const response = await api.patch(`/departments/${id}`, payload);
      return {
        data: transformDepartment(response.data?.data || response.data),
        success: true,
        message: "Department updated successfully",
      };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update department";
      return {
        data: null,
        success: false,
        error: errMsg,
        message: errMsg,
      };
    }
  },

  // ==================== DELETE DEPARTMENT ====================
  deleteDepartment: async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      return { success: true, message: "Department deleted successfully" };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete department";
      return {
        success: false,
        error: errMsg,
        message: errMsg,
      };
    }
  },

  // ==================== GET DEPARTMENT STATISTICS ====================
  getDepartmentStatistics: async (id = null) => {
    try {
      const url = id
        ? `/departments/${id}/statistics`
        : "/departments/statistics";
      const response = await api.get(url);
      const rawData = response.data?.data || response.data;

      if (Array.isArray(rawData)) {
        const totalTeachers = rawData.reduce(
          (acc, d) => acc + (d.totalTeachers || 0),
          0,
        );
        const totalStaff = rawData.reduce(
          (acc, d) => acc + (d.totalStaff || 0),
          0,
        );
        const totalSubjects = rawData.reduce(
          (acc, d) => acc + (d.totalSubjects || 0),
          0,
        );
        return {
          data: {
            totalTeachers,
            totalStaff,
            totalSubjects,
            totalMembers: totalTeachers + totalStaff,
            byDepartment: rawData,
          },
          success: true,
        };
      }

      return {
        data: rawData,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // ==================== ACTIVATE / DEACTIVATE ====================
  updateDepartmentStatus: async (id, action) => {
    try {
      const response = await api.patch(`/departments/${id}/${action}`);
      return {
        data: transformDepartment(response.data?.data || response.data),
        success: true,
        message: `Department ${action}d successfully`,
      };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${action} department`;
      return {
        success: false,
        error: errMsg,
        message: errMsg,
      };
    }
  },
};

export { departmentApi };
