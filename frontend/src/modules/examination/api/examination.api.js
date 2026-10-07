import api from "@/api/axios";

// Helper to reliably extract arrays from NestJS response envelopes
const extractArray = (res) => {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.exams)) return d.exams;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const examinationApi = {
  // Exam Types
  getExamTypes: async () => {
    try {
      const res = await api.get("/grading/exam-types");
      return extractArray(res);
    } catch {
      return [];
    }
  },

  createExamType: async (payload) => {
    const cleanPayload = {
      name: String(payload.name).trim(),
      weightage: Number(payload.weightage || 0),
      ...(payload.description
        ? { description: String(payload.description).trim() }
        : {}),
    };
    const res = await api.post("/grading/exam-types", cleanPayload);
    return res.data?.data || res.data;
  },

  deleteExamType: async (id) => {
    const res = await api.delete(`/grading/exam-types/${Number(id)}`);
    return res.data?.data || res.data;
  },

  // Examinations Setup
  getExams: async (params = {}) => {
    try {
      const res = await api.get("/grading/exams", { params });
      return extractArray(res);
    } catch {
      return [];
    }
  },

  getExamById: async (id) => {
    const res = await api.get(`/grading/exams/${Number(id)}`);
    return res.data?.data || res.data;
  },

  createExam: async (payload) => {
    const startIso = new Date(payload.startDate).toISOString();
    const endIso = new Date(payload.endDate).toISOString();

    const basePayload = {
      name: String(payload.name).trim(),
      examTypeId: Number(payload.examTypeId),
      classId: Number(payload.classId),
      academicSessionId: Number(payload.academicSessionId),
      academicYear: String(payload.academicYear || "2026-2027"),
      term: String(payload.term || "TERM_1"),
      startDate: startIso,
      endDate: endIso,
      isPublished: true,
      ...(payload.description
        ? { description: String(payload.description).trim() }
        : {}),
    };

    const res = await api.post("/grading/exams", basePayload);
    return res.data?.data || res.data;
  },

  togglePublishExam: async (id, currentPublishedStatus) => {
    const nextStatus = !currentPublishedStatus;
    try {
      const res = await api.patch(`/grading/exams/${Number(id)}/publish`, {
        isPublished: nextStatus,
      });
      return res.data?.data || res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const resAlt = await api.patch(`/grading/exams/${Number(id)}`, {
          isPublished: nextStatus,
        });
        return resAlt.data?.data || resAlt.data;
      }
      throw err;
    }
  },

  // FIXED MARKS RETRIEVAL:
  // Since there is no exam-level GET endpoint, we retrieve results using the supported student routes or exam include
  getMarks: async ({ examId, subjectId, studentIds = [] }) => {
    const eId = Number(examId);
    const sId = Number(subjectId);

    // 1. Try GET /grading/exams/:id and see if it embeds results
    try {
      const examRes = await api.get(`/grading/exams/${eId}`);
      const examData = examRes.data?.data || examRes.data;
      const embeddedResults = examData?.results || examData?.examResults;

      if (Array.isArray(embeddedResults) && embeddedResults.length > 0) {
        return embeddedResults.filter(
          (r) => Number(r.subjectId || r.subject?.id) === sId,
        );
      }
    } catch {
      // Continue to student-based retrieval
    }

    // 2. Query each student's results via supported route: GET /grading/results/student/:studentId
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      try {
        const studentPromises = studentIds.map(async (sid) => {
          try {
            const res = await api.get(
              `/grading/results/student/${Number(sid)}`,
            );
            const d = extractArray(res);
            return d.filter(
              (r) =>
                Number(r.examId || r.exam?.id) === eId &&
                Number(r.subjectId || r.subject?.id) === sId,
            );
          } catch {
            return [];
          }
        });

        const nestedResults = await Promise.all(studentPromises);
        return nestedResults.flat();
      } catch {
        return [];
      }
    }

    return [];
  },

  submitBatchMarks: async ({ examId, subjectId, marks }) => {
    const cleanResults = marks
      .filter((m) => m.val !== "" && m.val !== null && !isNaN(Number(m.val)))
      .map((m) => ({
        studentId: Number(m.studentId),
        subjectId: Number(subjectId),
        theoryMarks: Number(m.val),
        isAbsent: Boolean(m.isAbsent || false),
        ...(m.remarks ? { remarks: String(m.remarks).trim() } : {}),
      }));

    const cleanPayload = {
      examId: Number(examId),
      results: cleanResults,
    };

    const res = await api.post("/grading/results/bulk", cleanPayload);
    return res.data?.data || res.data;
  },

  // Grade Scales
  getGradeScales: async () => {
    try {
      const res = await api.get("/grading/grade-scale");
      return extractArray(res);
    } catch {
      return [];
    }
  },

  createGradeScale: async (payload) => {
    const cleanPayload = {
      name: String(payload.name || payload.grade).trim(),
      minPercentage: Number(payload.minPercentage),
      maxPercentage: Number(payload.maxPercentage),
      gradePoint: Number(payload.gradePoint || 0),
      description: payload.description
        ? String(payload.description).trim()
        : "",
    };
    const res = await api.post("/grading/grade-scale", cleanPayload);
    return res.data?.data || res.data;
  },

  deleteGradeScale: async (id) => {
    const res = await api.delete(`/grading/grade-scale/${Number(id)}`);
    return res.data?.data || res.data;
  },

  // Student Report Cards
  getStudentReportCard: async ({ studentId, academicYear, term }) => {
    const res = await api.get(
      `/grading/report-cards/student/${Number(studentId)}`,
      {
        params: {
          ...(academicYear && { academicYear }),
          ...(term && { term }),
        },
      },
    );
    return res.data?.data || res.data;
  },
};

export default examinationApi;
