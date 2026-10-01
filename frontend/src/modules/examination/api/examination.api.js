// src/modules/examination/api/examination.api.js
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const examinationApi = {
  // ==================== EXAMS ====================
  // In src/modules/examination/api/examination.api.js
  getExams: async (params = {}) => {
    try {
      console.log("📤 [API DEBUG] Fetching exams with params:", params);

      const response = await api.get(API_ENDPOINTS.EXAMINATION.EXAMS.BASE, {
        params,
      });

      console.log("✅ [API DEBUG] Exams response:", response);
      console.log("✅ [API DEBUG] Response data:", response.data);
      console.log("✅ [API DEBUG] Response data type:", typeof response.data);
      console.log("✅ [API DEBUG] Is array?", Array.isArray(response.data));

      // Check if data is nested
      if (response.data.data) {
        console.log(
          "✅ [API DEBUG] Data is nested, extracting:",
          response.data.data,
        );
        return response.data; // Return whole object { data: [...] }
      }

      // Check if response.data is already an array
      if (Array.isArray(response.data)) {
        console.log("✅ [API DEBUG] Data is already an array");
        return { data: response.data }; // Wrap in object
      }

      console.log("✅ [API DEBUG] Returning response.data as-is");
      return response.data;
    } catch (error) {
      console.error("❌ [API DEBUG] Error fetching exams:", error);
      console.error("❌ [API DEBUG] Error response:", error.response?.data);
      throw error;
    }
  },

  getExamById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.EXAMINATION.EXAMS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching exam:", error);
      throw error;
    }
  },
  // Add these to your examinationApi object:
  getExamWithSubjects: async (examId) => {
    const response = await api.get(`/grading/exams/${examId}/with-subjects`);
    return response.data;
  },

  getClassStudents: async (classId) => {
    const response = await api.get(`/students?classId=${classId}`);
    return response.data;
  },

  getExamResultsByExam: async (examId) => {
    const response = await api.get(`/grading/exams/${examId}/results`);
    return response.data;
  },
  // In src/modules/examination/api/examination.api.js
  // Add inside examinationApi object in examination.api.js:
  deleteExam: async (id) => {
    try {
      const response = await api.delete(`/grading/exams/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Exam deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete exam",
      };
    }
  },
  createExam: async (examData) => {
    try {
      console.log("📤 [DEBUG] ========== CREATE EXAM START ==========");
      console.log("📤 [DEBUG] Raw exam data received:", examData);

      // Detailed type checking
      console.log("📤 [DEBUG] Data types analysis:");
      console.table({
        name: {
          value: examData.name,
          type: typeof examData.name,
          valid:
            typeof examData.name === "string" &&
            examData.name.trim().length > 0,
        },
        examTypeId: {
          value: examData.examTypeId,
          type: typeof examData.examTypeId,
          valid:
            !isNaN(parseInt(examData.examTypeId)) && examData.examTypeId > 0,
        },
        classId: {
          value: examData.classId,
          type: typeof examData.classId,
          valid: !isNaN(parseInt(examData.classId)) && examData.classId > 0,
        },
        academicSessionId: {
          value: examData.academicSessionId,
          type: typeof examData.academicSessionId,
          valid:
            !isNaN(parseInt(examData.academicSessionId)) &&
            examData.academicSessionId > 0,
        },
        academicYear: {
          value: examData.academicYear,
          type: typeof examData.academicYear,
          valid:
            typeof examData.academicYear === "string" &&
            examData.academicYear.length > 0,
        },
        term: {
          value: examData.term,
          type: typeof examData.term,
          valid: typeof examData.term === "string" && examData.term.length > 0,
        },
        startDate: {
          value: examData.startDate,
          type: typeof examData.startDate,
          isDate: examData.startDate instanceof Date,
          isString: typeof examData.startDate === "string",
          isoString:
            typeof examData.startDate === "string" ? examData.startDate : "N/A",
        },
        endDate: {
          value: examData.endDate,
          type: typeof examData.endDate,
          isDate: examData.endDate instanceof Date,
          isString: typeof examData.endDate === "string",
          isoString:
            typeof examData.endDate === "string" ? examData.endDate : "N/A",
        },
        description: {
          value: examData.description,
          type: typeof examData.description,
          valid: typeof examData.description === "string",
        },
      });

      // Validate required fields
      const requiredFields = [
        "name",
        "examTypeId",
        "classId",
        "academicSessionId",
        "academicYear",
        "term",
        "startDate",
        "endDate",
      ];
      const missingFields = requiredFields.filter((field) => {
        const value = examData[field];
        if (value === undefined || value === null || value === "") return true;
        if (typeof value === "number" && isNaN(value)) return true;
        if (typeof value === "string" && value.trim() === "") return true;
        return false;
      });

      if (missingFields.length > 0) {
        console.error(
          "❌ [DEBUG] Missing or invalid required fields:",
          missingFields,
        );
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      console.log("📤 [DEBUG] Endpoint:", API_ENDPOINTS.EXAMINATION.EXAMS.BASE);
      console.log(
        "📤 [DEBUG] Full URL:",
        api.defaults.baseURL + API_ENDPOINTS.EXAMINATION.EXAMS.BASE,
      );
      console.log("📤 [DEBUG] Request headers:", api.defaults.headers);

      // Make sure we're sending proper JSON
      const requestData = {
        name: String(examData.name).trim(),
        examTypeId: parseInt(examData.examTypeId, 10),
        classId: parseInt(examData.classId, 10),
        academicSessionId: parseInt(examData.academicSessionId, 10),
        academicYear: String(examData.academicYear),
        term: String(examData.term),
        startDate: examData.startDate,
        endDate: examData.endDate,
        description: examData.description
          ? String(examData.description).trim()
          : "",
      };

      // Ensure dates are ISO strings if they're Date objects
      if (requestData.startDate instanceof Date) {
        requestData.startDate = requestData.startDate.toISOString();
      }
      if (requestData.endDate instanceof Date) {
        requestData.endDate = requestData.endDate.toISOString();
      }

      console.log(
        "📤 [DEBUG] Final request data:",
        JSON.stringify(requestData, null, 2),
      );

      // Send the request with timing
      const startTime = Date.now();
      console.log(
        "📤 [DEBUG] Sending request at:",
        new Date(startTime).toISOString(),
      );

      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.EXAMS.BASE,
        requestData,
      );

      const endTime = Date.now();
      console.log(
        "✅ [DEBUG] Request completed in:",
        endTime - startTime,
        "ms",
      );

      console.log("✅ [DEBUG] Exam created successfully!");
      console.log("✅ [DEBUG] Response status:", response.status);
      console.log("✅ [DEBUG] Response headers:", response.headers);
      console.log("✅ [DEBUG] Response data:", response.data);

      // Validate response structure
      if (!response.data) {
        console.warn("⚠️ [DEBUG] Response data is empty or undefined");
      } else if (response.data.id) {
        console.log("✅ [DEBUG] Exam created with ID:", response.data.id);
      }

      console.log("✅ [DEBUG] ========== CREATE EXAM END ==========");

      return response.data;
    } catch (error) {
      console.error("❌ [DEBUG] ========== CREATE EXAM ERROR ==========");
      console.error("❌ [DEBUG] Error name:", error.name);
      console.error("❌ [DEBUG] Error message:", error.message);
      console.error("❌ [DEBUG] Error stack:", error.stack);

      if (error.response) {
        // Server responded with error status
        console.error("❌ [DEBUG] Response status:", error.response.status);
        console.error(
          "❌ [DEBUG] Response status text:",
          error.response.statusText,
        );
        console.error(
          "❌ [DEBUG] Response headers:",
          JSON.stringify(error.response.headers, null, 2),
        );

        if (error.response.data) {
          console.error("❌ [DEBUG] Response data (raw):", error.response.data);
          console.error(
            "❌ [DEBUG] Response data (JSON):",
            JSON.stringify(error.response.data, null, 2),
          );

          // Try to extract meaningful error message
          let errorMessage = "Unknown server error";
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            if (Array.isArray(error.response.data.message)) {
              errorMessage = error.response.data.message.join(", ");
            } else {
              errorMessage = error.response.data.message;
            }
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
          console.error("❌ [DEBUG] Extracted error message:", errorMessage);
        }

        console.error("❌ [DEBUG] Request config:", {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          data: error.config?.data ? JSON.parse(error.config.data) : "No data",
          headers: error.config?.headers,
        });
      } else if (error.request) {
        // Request was made but no response received
        console.error(
          "❌ [DEBUG] No response received - request object:",
          error.request,
        );
        console.error("❌ [DEBUG] Request was made to:", error.config?.url);
        console.error("❌ [DEBUG] Request method:", error.config?.method);
        console.error(
          "❌ [DEBUG] This usually indicates a network error or CORS issue",
        );
      } else {
        // Error in request setup
        console.error("❌ [DEBUG] Request setup error:", error.message);
        console.error("❌ [DEBUG] Error config:", error.config);
      }

      // Check for common issues
      console.error("❌ [DEBUG] Common issue checks:");
      console.error(
        "❌ [DEBUG] - Network connectivity:",
        navigator.onLine ? "Online" : "Offline",
      );
      console.error(
        "❌ [DEBUG] - CORS issue possible:",
        error.message?.includes("CORS") ||
          error.message?.includes("cross-origin")
          ? "YES"
          : "NO",
      );
      console.error(
        "❌ [DEBUG] - Authentication token present:",
        api.defaults.headers?.Authorization ? "YES" : "NO",
      );

      // Re-throw with enhanced error message
      let enhancedError = error;
      if (error.response?.data) {
        const serverError = new Error(
          `Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        );
        serverError.response = error.response;
        serverError.config = error.config;
        enhancedError = serverError;
      }

      console.error("❌ [DEBUG] ========== ERROR END ==========");
      throw enhancedError;
    } finally {
      console.log("🔚 [DEBUG] createExam function execution completed");
    }
  },

  createExamWithSubjects: async (examData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.EXAMS.WITH_SUBJECTS,
        examData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error creating exam with subjects:", error);
      throw error;
    }
  },

  updateExam: async (id, examData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.EXAMINATION.EXAMS.BY_ID(id),
        examData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error updating exam:", error);
      throw error;
    }
  },

  publishExam: async (id) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.EXAMS.PUBLISH(id),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error publishing exam:", error);
      throw error;
    }
  },

  getExamStatistics: async (id) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.EXAMS.STATISTICS(id),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching exam statistics:", error);
      throw error;
    }
  },

  generateReportCards: async (id) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.EXAMS.REPORT_CARDS(id),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error generating report cards:", error);
      throw error;
    }
  },
  // Update the getExamTypes function in examination.api.js
  getExamTypes: async () => {
    try {
      console.log(
        "📤 Fetching exam types from:",
        API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BASE,
      );

      const response = await api.get(API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BASE);
      console.log("✅ Exam types fetched successfully:", response.data);

      // Return the data in the expected format
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching exam types:", error);
      console.error("❌ Error response:", error.response?.data);

      // Return fallback exam types if API fails
      const fallbackTypes = {
        data: [
          {
            id: 1,
            name: "Monthly Test",
            description: "Monthly examination",
            weightage: 10,
            order: 1,
            isActive: true,
          },
          {
            id: 2,
            name: "Quarterly Exam",
            description: "Quarterly examination",
            weightage: 20,
            order: 2,
            isActive: true,
          },
          {
            id: 3,
            name: "Half Yearly Exam",
            description: "Half yearly examination",
            weightage: 30,
            order: 3,
            isActive: true,
          },
          {
            id: 4,
            name: "Final Exam",
            description: "Final examination",
            weightage: 40,
            order: 4,
            isActive: true,
          },
        ],
      };

      console.log("🔄 Using fallback exam types");
      return fallbackTypes;
    }
  },

  // Update all exam type functions to use the correct endpoint
  createExamType: async (examTypeData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BASE,
        examTypeData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error creating exam type:", error);
      throw error;
    }
  },

  getExamTypeById: async (id) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BY_ID(id),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching exam type:", error);
      throw error;
    }
  },

  updateExamType: async (id, examTypeData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BY_ID(id),
        examTypeData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error updating exam type:", error);
      throw error;
    }
  },

  deleteExamType: async (id) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.EXAMINATION.EXAM_TYPES.BY_ID(id),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting exam type:", error);
      throw error;
    }
  },

  // ==================== ACADEMIC SESSIONS ====================
  getAcademicSessions: async () => {
    try {
      console.log("📤 Fetching academic sessions...");
      const response = await api.get(API_ENDPOINTS.ACADEMIC_SESSIONS.BASE);
      console.log("✅ Academic sessions fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching academic sessions:", error);

      // Return fallback sessions
      const currentYear = new Date().getFullYear();
      const fallbackData = {
        data: [
          {
            id: 1,
            name: `${currentYear}-${currentYear + 1}`,
            startYear: currentYear,
            endYear: currentYear + 1,
            isActive: true,
          },
        ],
      };
      console.log("🔄 Using fallback academic sessions");
      return fallbackData;
    }
  },

  // ==================== GRADES ====================
  createGrade: async (gradeData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.GRADES.BASE,
        gradeData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error creating grade:", error);
      throw error;
    }
  },

  bulkCreateGrades: async (gradesData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.GRADES.BULK,
        gradesData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error bulk creating grades:", error);
      throw error;
    }
  },

  getStudentGrades: async (studentId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.GRADES.STUDENT_GRADES(studentId),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching student grades:", error);
      throw error;
    }
  },

  // ==================== RESULTS ====================
  bulkCreateResults: async (resultsData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.RESULTS.BULK,
        resultsData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error bulk creating results:", error);
      throw error;
    }
  },

  verifyResults: async (verificationData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.RESULTS.VERIFY,
        verificationData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error verifying results:", error);
      throw error;
    }
  },

  // ==================== ANALYTICS ====================
  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.EXAMINATION.ANALYTICS.BASE, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      throw error;
    }
  },

  getClassPerformance: async (classId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.ANALYTICS.CLASS_PERFORMANCE(classId),
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching class performance:", error);
      throw error;
    }
  },

  // ==================== GRADE SCALES ====================
  getGradeScales: async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.GRADE_SCALES.BASE,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching grade scales:", error);
      throw error;
    }
  },

  createGradeScale: async (gradeScaleData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.GRADE_SCALES.CREATE,
        gradeScaleData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error creating grade scale:", error);
      throw error;
    }
  },

  initializeGradeScales: async () => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.GRADE_SCALES.INITIALIZE,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error initializing grade scales:", error);
      throw error;
    }
  },

  // ==================== REPORT CARDS ====================
  getReportCard: async (params = {}) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.REPORT_CARDS.BASE,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching report card:", error);
      throw error;
    }
  },

  publishReportCard: async (publishData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.EXAMINATION.REPORT_CARDS.PUBLISH,
        publishData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error publishing report card:", error);
      throw error;
    }
  },

  exportReport: async (exportData) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.EXAMINATION.REPORT_CARDS.EXPORT,
        {
          params: exportData,
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error exporting report:", error);
      throw error;
    }
  },

  // ==================== HELPER FUNCTIONS ====================
  getClasses: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CLASSES.BASE);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      throw error;
    }
  },

  getStudentsByClass: async (classId) => {
    try {
      console.warn(
        "⚠️ getStudentsByClass endpoint might not exist - using mock",
      );
      return { data: [] };
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      return { data: [] };
    }
  },
};
