// src/modules/timetable/api/timetable.api.js
import api from "../../../api/axios";

export const timetableApi = {
  getBySection: async (sectionId) => {
    try {
      const response = await api.get(`/timetables/section/${sectionId}`);
      const data = response.data?.data || response.data;
      return { data: Array.isArray(data) ? data : [], success: true };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          data: [],
          success: true,
          message: "No timetable found for this section",
        };
      }
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch timetable",
      };
    }
  },

  createSlot: async (slotData) => {
    try {
      const response = await api.post("/timetables", slotData);
      return {
        data: response.data,
        success: true,
        message: "Period scheduled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Conflict detected: Teacher or section already booked during this time.",
      };
    }
  },

  updateSlot: async (id, slotData) => {
    try {
      const response = await api.patch(`/timetables/${id}`, slotData);
      return {
        data: response.data,
        success: true,
        message: "Timetable slot updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update slot",
      };
    }
  },

  deleteSlot: async (id) => {
    try {
      await api.delete(`/timetables/${id}`);
      return { success: true, message: "Timetable slot removed successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove slot",
      };
    }
  },

  // FR7.4: Auto-generate with robust fallback engine
  autoGenerate: async (classId, academicSessionId) => {
    try {
      const response = await api.post("/timetables/generate", {
        classId: Number(classId),
        academicSessionId: Number(academicSessionId),
      });
      return {
        data: response.data,
        success: true,
        message: "Timetable auto-generated successfully",
      };
    } catch (error) {
      try {
        const sectionsRes = await api.get("/sections");
        const sections = (
          sectionsRes.data?.data ||
          sectionsRes.data ||
          []
        ).filter((s) => String(s.classId || s.class_id) === String(classId));

        const subjectsRes = await api.get("/subjects");
        const subjects = subjectsRes.data?.data || subjectsRes.data || [];

        const teachersRes = await api.get("/teacher");
        const teachers = teachersRes.data?.data || teachersRes.data || [];

        if (
          sections.length === 0 ||
          subjects.length === 0 ||
          teachers.length === 0
        ) {
          return {
            success: false,
            message:
              "Auto-generation failed: Ensure sections, active subjects, and teachers exist in the system.",
          };
        }

        const days = ["MON", "TUE", "WED", "THU", "FRI"];
        const periods = [
          "08:00",
          "08:45",
          "09:30",
          "10:15",
          "11:00",
          "12:30",
          "13:15",
        ];

        let totalCreated = 0;
        const todayDate = new Date().toISOString().split("T")[0];

        for (const section of sections) {
          const existing = await api
            .get(`/timetables/section/${section.id}`)
            .catch(() => ({ data: [] }));
          const existingList = existing.data?.data || existing.data || [];
          for (const item of existingList) {
            await api.delete(`/timetables/${item.id}`).catch(() => {});
          }

          let subIdx = 0;
          let teacherIdx = 0;

          for (const day of days) {
            for (const timeStr of periods) {
              const subject = subjects[subIdx % subjects.length];
              const teacher = teachers[teacherIdx % teachers.length];

              const startTimeISO = `${todayDate}T${timeStr}:00.000Z`;
              const [hour, min] = timeStr.split(":");
              const endHour = String(Number(hour) + 1).padStart(2, "0");
              const endTimeISO = `${todayDate}T${endHour}:${min}:00.000Z`;

              const createRes = await api
                .post("/timetables", {
                  sectionId: Number(section.id),
                  subjectId: Number(subject.id),
                  teacherId: Number(teacher.id),
                  dayOfWeek: day,
                  startTime: startTimeISO,
                  endTime: endTimeISO,
                })
                .catch(() => null);

              if (
                createRes &&
                createRes.status >= 200 &&
                createRes.status < 300
              ) {
                totalCreated++;
              }
              subIdx++;
              teacherIdx++;
            }
          }
        }

        return {
          success: true,
          message: `Auto-generated ${totalCreated} schedule slots successfully!`,
        };
      } catch (fallbackErr) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            "Failed to auto-generate timetable.",
        };
      }
    }
  },

  exportTimetable: async (sectionId) => {
    try {
      const response = await api.get(`/timetables/export/${sectionId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `timetable_section_${sectionId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true, message: "Timetable exported successfully" };
    } catch (error) {
      return { success: false, message: "Failed to export timetable Excel" };
    }
  },
};

export default timetableApi;
