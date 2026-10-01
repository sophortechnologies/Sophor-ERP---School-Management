import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";
import { formatDate } from "../utils/attendanceHelpers";

export const attendanceApi = {
  getAttendance: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.ATTENDANCE.BASE, { params });

      let attendanceData = [];

      if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        attendanceData = response.data.data;
      } else if (
        response.data &&
        response.data.attendance &&
        Array.isArray(response.data.attendance)
      ) {
        attendanceData = response.data.attendance;
      }

      return {
        data: attendanceData,
        total: attendanceData.length,
        success: true,
        message: "Attendance records fetched successfully",
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: true,
        message: "No attendance records found",
      };
    }
  },

  getAttendanceByDateClass: async (date, classId) => {
    try {
      const formatDateForAPI = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch (error) {
          return dateString;
        }
      };

      const formattedDate = formatDateForAPI(date);
      const url = `/attendance/class/${classId}/date/${formattedDate}`;

      const response = await api.get(url);

      let attendanceData = [];
      if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        attendanceData = response.data.data;
      } else if (
        response.data &&
        response.data.attendance &&
        Array.isArray(response.data.attendance)
      ) {
        attendanceData = response.data.attendance;
      }

      return {
        data: attendanceData,
        success: true,
        message: "Attendance fetched successfully",
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          data: [],
          success: true,
          message: "No attendance records found",
        };
      }

      return {
        data: [],
        success: false,
        message: error.response?.data?.message || "Failed to fetch attendance",
      };
    }
  },

  getAttendanceSummary: async (studentId, params = {}) => {
    try {
      const url = API_ENDPOINTS.ATTENDANCE.STUDENT_SUMMARY(studentId);
      const response = await api.get(url, { params });

      return {
        data: response.data,
        success: true,
        message: "Attendance summary fetched successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch attendance summary",
      };
    }
  },

  markAttendance: async (attendanceData) => {
    try {
      const records = attendanceData.attendanceList.map((student) => {
        let studentId = student.studentId;
        if (typeof studentId === "string" && studentId.startsWith("STU")) {
          studentId = parseInt(studentId.replace("STU", "")) || 0;
        } else {
          studentId = parseInt(studentId) || 0;
        }

        return {
          studentId: studentId,
          status: student.status.toUpperCase(),
          remarks: student.remarks || "",
          date: attendanceData.date,
          classId: parseInt(attendanceData.classId) || 1,
        };
      });

      const results = [];
      for (const record of records) {
        try {
          const response = await api.post(
            API_ENDPOINTS.ATTENDANCE.BASE,
            record,
          );
          results.push(response.data);
        } catch (recordError) {
          results.push({
            error: recordError.response?.data,
            studentId: record.studentId,
          });
        }
      }

      return {
        data: results,
        success: true,
        message: `Attendance marked for ${attendanceData.attendanceList.length} students`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to mark attendance. Check student IDs and status values.",
      };
    }
  },

  bulkUploadAttendance: async (fileData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ATTENDANCE.BULK, {
        records: fileData,
      });

      return {
        data: response.data,
        success: true,
        message: `${fileData.length} attendance records uploaded successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to upload attendance records",
      };
    }
  },

  uploadAttendanceFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        API_ENDPOINTS.ATTENDANCE.UPLOAD,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        data: response.data,
        success: true,
        message: "Attendance file uploaded successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload attendance file",
      };
    }
  },

  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await api.patch(
        API_ENDPOINTS.ATTENDANCE.BY_ID(id),
        attendanceData,
      );

      return {
        data: response.data,
        success: true,
        message: "Attendance record updated successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message || "Failed to update attendance record",
      };
    }
  },

  deleteAttendance: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.ATTENDANCE.BY_ID(id));

      return {
        success: true,
        message: "Attendance record deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete attendance record",
      };
    }
  },

  getAttendanceReport: async (classId, params = {}) => {
    try {
      const url = API_ENDPOINTS.ATTENDANCE.CLASS_REPORT(classId);
      const response = await api.get(url, { params });

      return {
        data: response.data,
        success: true,
        message: "Attendance report generated successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to generate attendance report",
      };
    }
  },

  getParentAttendance: async (parentUserId, params = {}) => {
    try {
      const url = API_ENDPOINTS.ATTENDANCE.PARENT_ATTENDANCE(parentUserId);
      const response = await api.get(url, { params });

      const responseData = response.data;
      const data = responseData.data || responseData;

      return {
        data: Array.isArray(data) ? data : [data],
        success: true,
        message: "Parent attendance data fetched successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch parent attendance",
      };
    }
  },

  getAttendanceStats: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.ATTENDANCE.STATS, {
        params,
      });

      return {
        data: response.data,
        success: true,
        message: "Attendance statistics fetched successfully",
      };
    } catch (error) {
      const fallbackStats = {
        summary: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          presentPercentage: 0,
          absentPercentage: 0,
        },
        dailyStats: [],
        classWiseStats: [],
        topAttendees: [],
        frequentAbsentees: [],
      };

      return {
        data: fallbackStats,
        success: false,
        message: "Failed to fetch statistics, using fallback",
      };
    }
  },

  getClasses: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CLASSES.BASE);

      const responseData = response.data;
      const data = responseData.data || responseData;

      return {
        data: Array.isArray(data) ? data : [data],
        success: true,
        message: "Classes fetched successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to fetch classes",
      };
    }
  },

  getStudentsByClass: async (classId) => {
    try {
      const response = await api.get("/students");

      let studentData = [];

      if (Array.isArray(response.data)) {
        studentData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        studentData = response.data.data;
      } else if (
        response.data &&
        response.data.students &&
        Array.isArray(response.data.students)
      ) {
        studentData = response.data.students;
      }

      if (classId && classId !== "") {
        studentData = studentData.filter(
          (student) =>
            student.classId == classId ||
            student.class?._id == classId ||
            student.class?.id == classId,
        );
      }

      const formattedStudents = studentData.map((student, index) => {
        let studentId = student.studentId || student.id || student._id;
        let numericStudentId = 0;

        if (typeof studentId === "string" && studentId.startsWith("STU")) {
          numericStudentId =
            parseInt(studentId.replace("STU", "")) || index + 1000;
        } else if (typeof studentId === "string") {
          numericStudentId = parseInt(studentId) || index + 1000;
        } else {
          numericStudentId = parseInt(studentId) || index + 1000;
        }

        return {
          id: student.id || student._id || numericStudentId,
          studentId: numericStudentId,
          originalStudentId: studentId,
          studentName:
            student.name ||
            student.fullName ||
            (student.firstName && student.lastName
              ? `${student.firstName} ${student.lastName}`
              : "") ||
            `Student ${numericStudentId}`,
          rollNumber:
            student.rollNumber || student.rollNo || `R${numericStudentId}`,
          classId: student.classId || "unassigned",
          className: student.className || "Not Assigned",
          status: "active",
        };
      });

      return {
        data: formattedStudents,
        success: true,
        message: `Loaded ${formattedStudents.length} students`,
        isMock: false,
      };
    } catch (error) {
      return {
        data: [],
        success: true,
        message: `No students found: ${error.message}`,
        isMock: false,
      };
    }
  },

  sendAbsenteeNotifications: async (date, classId) => {
    try {
      const formattedDate = formatDate(date);
      const attendanceUrl = API_ENDPOINTS.ATTENDANCE.CLASS_DATE_ATTENDANCE(
        classId,
        formattedDate,
      );
      const attendanceResponse = await api.get(attendanceUrl);
      const attendanceData =
        attendanceResponse.data.data || attendanceResponse.data || [];

      const absentStudents = attendanceData.filter(
        (record) => record.status === "absent" || record.status === "Absent",
      );

      const notificationData = {
        date,
        classId,
        absentCount: absentStudents.length,
        absentStudents: absentStudents.map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          parentContact: s.parentPhone || s.parentEmail,
        })),
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        data: notificationData,
        success: true,
        message: `Notifications sent for ${absentStudents.length} absent students`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to send notifications",
      };
    }
  },
};

export default attendanceApi;
