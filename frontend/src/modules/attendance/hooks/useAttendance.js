import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "../api/attendance.api";
import {
  transformBackendData,
  parseBackendDate,
} from "../utils/attendanceHelpers";

export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    todayPresent: 0,
    todayAbsent: 0,
    monthlyAverage: 0,
  });

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, attendanceRes] = await Promise.all([
        attendanceApi.getClasses(),
        attendanceApi.getAttendance({
          limit: 50,
          sort: "-date",
        }),
      ]);

      if (classesRes.success) {
        setClasses(classesRes.data);
      }

      if (attendanceRes.success) {
        const transformedData = transformBackendData(attendanceRes.data);
        setAttendance(transformedData);

        const today = new Date().toISOString().split("T")[0];
        const todayRecords = transformedData.filter(
          (record) => record.date === today,
        );
        const todayPresent = todayRecords.filter(
          (r) => r.status === "present" || r.status === "Present",
        ).length;
        const todayAbsent = todayRecords.filter(
          (r) => r.status === "absent" || r.status === "Absent",
        ).length;

        setStats({
          totalRecords: attendanceRes.total || transformedData.length,
          todayPresent,
          todayAbsent,
          monthlyAverage: 0,
        });
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudentsByClass = async (classId) => {
    try {
      setLoading(true);

      const response = await attendanceApi.getStudentsByClass(classId);

      if (response.success) {
        const formattedStudents = response.data.map((student, index) => {
          let studentName =
            student.studentName ||
            student.name ||
            student.fullName ||
            (student.firstName && student.lastName
              ? `${student.firstName} ${student.lastName}`
              : "") ||
            `Student ${student.studentId || student.id || index + 1}`;

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
            studentName: studentName.trim(),
            name: studentName.trim(),
            rollNumber:
              student.rollNumber || student.rollNo || `R${numericStudentId}`,
            classId: student.classId || classId || "unassigned",
            className: student.className || "Not Assigned",
            status: "active",
          };
        });

        setStudents(formattedStudents);
        return { success: true, data: formattedStudents };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceByDateClass = async (date, classId) => {
    try {
      setLoading(true);

      const response = await attendanceApi.getAttendanceByDateClass(
        date,
        classId,
      );

      if (response.success) {
        const transformedData = transformBackendData(response.data);
        return { success: true, data: transformedData };
      } else {
        return { success: true, data: [] };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (attendanceData) => {
    try {
      setLoading(true);

      const response = await attendanceApi.markAttendance(attendanceData);

      if (response.success) {
        await loadAttendanceByDateClass(
          attendanceData.date,
          attendanceData.classId,
        );

        const statsResult = await getAttendanceStats({
          classId: attendanceData.classId,
          startDate: attendanceData.date,
          endDate: attendanceData.date,
        });

        return {
          success: true,
          data: response.data,
          message: response.message || "Attendance marked successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to mark attendance",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceRecord = async (id, recordData) => {
    try {
      setLoading(true);
      const response = await attendanceApi.updateAttendance(id, recordData);

      if (response.success) {
        const updatedRecord = transformBackendData(response.data);
        setAttendance((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record)),
        );
        return {
          success: true,
          data: updatedRecord,
          message:
            response.message || "Attendance record updated successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update attendance record",
      };
    } finally {
      setLoading(false);
    }
  };

  const bulkUploadAttendance = async (fileData) => {
    try {
      setLoading(true);
      const response = await attendanceApi.bulkUploadAttendance(fileData);

      if (response.success) {
        await loadInitialData();
        return {
          success: true,
          data: response.data,
          message: response.message || "Bulk upload successful!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to upload attendance records",
      };
    } finally {
      setLoading(false);
    }
  };

  const uploadAttendanceFile = async (file) => {
    try {
      setLoading(true);
      const response = await attendanceApi.uploadAttendanceFile(file);

      if (response.success) {
        await loadInitialData();
        return {
          success: true,
          data: response.data,
          message: response.message || "File uploaded successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message || err.message || "Failed to upload file",
      };
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = async (params = {}) => {
    try {
      let attendanceData = [...attendance];

      if (params.startDate && params.endDate) {
        attendanceData = attendanceData.filter((record) => {
          const recordDate = new Date(record.date);
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }

      if (params.classId) {
        attendanceData = attendanceData.filter(
          (record) => record.classId == params.classId,
        );
      }

      const total = attendanceData.length;
      const present = attendanceData.filter(
        (a) => a.status === "PRESENT" || a.status === "present",
      ).length;
      const absent = attendanceData.filter(
        (a) => a.status === "ABSENT" || a.status === "absent",
      ).length;
      const late = attendanceData.filter(
        (a) => a.status === "LATE" || a.status === "late",
      ).length;

      const presentPercentage =
        total > 0 ? Math.round((present / total) * 100) : 0;
      const absentPercentage =
        total > 0 ? Math.round((absent / total) * 100) : 0;

      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const dayRecords = attendanceData.filter(
          (record) =>
            new Date(record.date).toISOString().split("T")[0] === dateStr,
        );

        const dayPresent = dayRecords.filter(
          (r) => r.status === "PRESENT" || r.status === "present",
        ).length;

        const dayPercentage =
          dayRecords.length > 0
            ? Math.round((dayPresent / dayRecords.length) * 100)
            : 0;

        dailyStats.push({
          date: dateStr,
          total: dayRecords.length,
          present: dayPresent,
          percentage: dayPercentage,
        });
      }

      const classWiseStats = [];
      const classesMap = {};

      attendanceData.forEach((record) => {
        const classId = record.classId || record.class?.id;
        if (!classesMap[classId]) {
          classesMap[classId] = {
            className: record.className || `Class ${classId}`,
            present: 0,
            absent: 0,
            total: 0,
          };
        }

        classesMap[classId].total++;
        if (record.status === "PRESENT" || record.status === "present") {
          classesMap[classId].present++;
        } else if (record.status === "ABSENT" || record.status === "absent") {
          classesMap[classId].absent++;
        }
      });

      Object.values(classesMap).forEach((cls) => {
        cls.percentage =
          cls.total > 0 ? Math.round((cls.present / cls.total) * 100) : 0;
        classWiseStats.push(cls);
      });

      const studentMap = {};
      attendanceData.forEach((record) => {
        const studentId = record.studentId;
        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            name: record.studentName,
            present: 0,
            total: 0,
          };
        }
        studentMap[studentId].total++;
        if (record.status === "PRESENT" || record.status === "present") {
          studentMap[studentId].present++;
        }
      });

      const topAttendees = Object.values(studentMap)
        .filter((s) => s.total >= 3)
        .map((s) => ({
          ...s,
          percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      const frequentAbsentees = Object.values(studentMap)
        .filter((s) => s.total >= 3)
        .map((s) => ({
          ...s,
          absent: s.total - s.present,
          percentage:
            s.total > 0
              ? Math.round(((s.total - s.present) / s.total) * 100)
              : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      const statsData = {
        summary: {
          total,
          present,
          absent,
          late,
          presentPercentage,
          absentPercentage,
        },
        dailyStats,
        classWiseStats,
        topAttendees,
        frequentAbsentees,
      };

      return {
        data: statsData,
        success: true,
        message: `Statistics calculated from ${attendanceData.length} records`,
      };
    } catch (err) {
      return {
        data: {
          summary: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            presentPercentage: 0,
            absentPercentage: 0,
          },
          dailyStats: [],
          classWiseStats: [],
          topAttendees: [],
          frequentAbsentees: [],
        },
        success: false,
        message: "Failed to calculate statistics",
      };
    }
  };

  const generateReport = async (params) => {
    try {
      setLoading(true);
      const response = await attendanceApi.getAttendanceReport(
        params.classId,
        params,
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || "Report generated successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to generate report",
      };
    } finally {
      setLoading(false);
    }
  };

  const getStudentAttendanceSummary = async (studentId, params = {}) => {
    try {
      const response = await attendanceApi.getAttendanceSummary(
        studentId,
        params,
      );

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getParentAttendance = async (parentUserId, params = {}) => {
    try {
      const response = await attendanceApi.getParentAttendance(
        parentUserId,
        params,
      );

      if (response.success) {
        const transformedData = transformBackendData(response.data);
        return { success: true, data: transformedData };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const sendAbsenteeNotifications = async (date, classId) => {
    try {
      const response = await attendanceApi.sendAbsenteeNotifications(
        date,
        classId,
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || "Notifications sent successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to send notifications",
      };
    }
  };

  const searchAttendance = async (params = {}) => {
    try {
      setLoading(true);
      const response = await attendanceApi.getAttendance(params);

      if (response.success) {
        const transformedData = transformBackendData(response.data);
        setAttendance(transformedData);
        return { success: true, data: transformedData };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = (format = "csv") => {
    if (attendance.length === 0) {
      return { success: false, error: "No data to export" };
    }

    if (format === "csv") {
      const headers = [
        "Student ID",
        "Student Name",
        "Date",
        "Status",
        "Remarks",
        "Class",
      ];

      const csvContent = [
        headers.join(","),
        ...attendance.map((record) =>
          [
            record.studentId,
            `"${record.studentName}"`,
            record.date,
            record.status,
            record.checkInTime || "",
            record.checkOutTime || "",
            `"${record.remarks || ""}"`,
            record.className || record.classId,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }

    return { success: true, message: `Attendance exported as ${format}` };
  };

  const deleteAttendanceRecord = async (id) => {
    try {
      setLoading(true);
      const response = await attendanceApi.deleteAttendance(id);

      if (response.success) {
        setAttendance((prev) => prev.filter((record) => record.id !== id));
        return {
          success: true,
          message:
            response.message || "Attendance record deleted successfully!",
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete attendance record",
      };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshData = async () => {
    await loadInitialData();
  };

  return {
    attendance,
    classes,
    students,
    loading,
    error,
    stats,

    loadInitialData,
    refreshData,
    loadStudentsByClass,
    loadAttendanceByDateClass,
    markAttendance,
    updateAttendanceRecord,
    bulkUploadAttendance,
    uploadAttendanceFile,
    getAttendanceStats,
    generateReport,
    getStudentAttendanceSummary,
    getParentAttendance,
    sendAbsenteeNotifications,
    searchAttendance,
    exportAttendance,
    deleteAttendanceRecord,
  };
};

export default useAttendance;
