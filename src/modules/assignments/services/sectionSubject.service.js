// src/modules/assignments/services/sectionSubject.service.js
import api from "../../../api/axios";

export const sectionSubjectService = {
  async listAll() {
    try {
      const [teachersRes, sectionsRes] = await Promise.all([
        api.get("/teacher"),
        api.get("/sections").catch(() => ({ data: [] })),
      ]);

      const teachers = teachersRes.data?.data || teachersRes.data || [];
      const sections = sectionsRes.data?.data || sectionsRes.data || [];
      const sectionMap = new Map(sections.map((s) => [String(s.id), s]));

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
            // Retrieve stored section metadata from localStorage or map if available
            const metaKey = `assignment_section_${a.id}`;
            const cachedSectionId = localStorage.getItem(metaKey);
            const sectionObj = cachedSectionId
              ? sectionMap.get(String(cachedSectionId))
              : null;

            allAssignments.push({
              id: a.id,
              teacherId: t.id,
              teacherName: teacherName,
              classId: a.classId,
              className: a.className || `Class ${a.classId}`,
              sectionId: sectionObj?.id || a.sectionId || cachedSectionId || "",
              sectionName:
                sectionObj?.name ||
                a.sectionName ||
                (cachedSectionId ? "A" : ""),
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
    const res = await api.post(endpoint, payload);
    return res.data;
  },

  async create({ teacherId, classId, subjectId, sectionId }) {
    const endpoint = `/teacher/${teacherId}/assign-subject`;
    const payload = {
      classId: Number(classId),
      subjectId: Number(subjectId),
    };

    const res = await api.post(endpoint, payload);
    const newAssignment = res.data?.data || res.data;

    // Cache section association locally so the table displays the exact section chosen
    if (newAssignment?.id && sectionId) {
      localStorage.setItem(`assignment_section_${newAssignment.id}`, sectionId);
    }

    return res.data;
  },

  async remove(assignmentId) {
    localStorage.removeItem(`assignment_section_${assignmentId}`);
    await api.delete(`/teacher/assignments/${assignmentId}`);
  },
};
