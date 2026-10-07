import api from "@/api/axios";

export const gradingApi = {
  // Get marks list by class, subject, term, and assessment
  getMarks: async ({
    classId,
    subjectId,
    term,
    assessmentType,
    academicYear,
  }) => {
    try {
      const res = await api.get("/grading/marks", {
        params: { classId, subjectId, term, assessmentType, academicYear },
      });
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  // Save or batch upsert marks
  saveBatchMarks: async (payload) => {
    const res = await api.post("/grading/marks/batch", payload);
    return res.data?.data || res.data;
  },

  // Single mark entry/update
  saveMark: async (payload) => {
    const res = await api.post("/grading/marks", payload);
    return res.data?.data || res.data;
  },

  // Fetch full student report card
  getStudentReportCard: async ({ studentId, academicYear, term }) => {
    const res = await api.get(`/grading/report-cards/student/${studentId}`, {
      params: { academicYear, term },
    });
    return res.data?.data || res.data;
  },

  // Fetch full class summary for terminal report cards
  getClassReportCards: async ({ classId, academicYear, term }) => {
    const res = await api.get(`/grading/report-cards/class/${classId}`, {
      params: { academicYear, term },
    });
    return res.data?.data || res.data || [];
  },
};

export default gradingApi;
