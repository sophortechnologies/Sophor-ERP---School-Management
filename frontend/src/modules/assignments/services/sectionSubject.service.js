// src/modules/assignments/services/sectionSubject.service.js
import api from "../../../api/axios";

export const sectionSubjectService = {
  async listAll() {
    try {
      // Fetch all teachers to gather their assignments
      const teachersRes = await api.get("/teacher");
      const teachers = teachersRes.data?.data || teachersRes.data || [];

      let allAssignments = [];
      for (const t of teachers) {
        try {
          const assignRes = await api.get(`/teacher/${t.id}/assignments`);
          const assignments =
            assignRes.data?.assignments || assignRes.data || [];
          const teacherName =
            `${t.firstName || t.first_name || ""} ${t.lastName || t.last_name || ""}`.trim() ||
            t.username;

          assignments.forEach((a) => {
            allAssignments.push({
              id: a.id,
              teacherId: t.id,
              teacherName: teacherName,
              classId: a.classId,
              className: a.className || `Class ${a.classId}`,
              sectionId: a.sectionId || 1,
              sectionName: a.sectionName || "A",
              subjectId: a.subjectId,
              subjectName: a.subjectName || `Subject ${a.subjectId}`,
              subjectCode: a.subjectCode || "SUB",
            });
          });
        } catch (e) {
          // Skip if teacher has no assignments endpoint data
        }
      }
      return allAssignments;
    } catch (error) {
      console.error("Error listing assignments:", error);
      return [];
    }
  },
  async assignClassTeacher({ teacherId, classId }) {
    const endpoint = `/teacher/${teacherId}/assign-class`;
    const payload = { classId: Number(classId) };
    console.log(`📤 Posting class teacher assignment to ${endpoint}:`, payload);
    const res = await api.post(endpoint, payload);
    return res.data;
  },
  async create({ teacherId, classId, subjectId }) {
    // Backend route: POST /teacher/:id/assign-subject with body { classId, subjectId }
    const endpoint = `/teacher/${teacherId}/assign-subject`;
    const payload = {
      classId: Number(classId),
      subjectId: Number(subjectId),
    };

    console.log(`📤 Posting to active backend endpoint ${endpoint}:`, payload);
    const res = await api.post(endpoint, payload);
    return res.data;
  },

  async remove(assignmentId) {
    // Backend route: DELETE /teacher/assignments/:assignmentId
    await api.delete(`/teacher/assignments/${assignmentId}`);
  },
};
