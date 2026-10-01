// src/pages/AdminDashboard/hooks/useDashboardData.js
import { useCallback, useState } from "react";
import { studentAPI } from "../../students/api/student.api";
import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalParents: 0,
    activeClasses: 0,
    revenue: 0,
    studentGrowth: 0,
    staffGrowth: 0,
    classesTrend: "0%",
    revenueGrowth: 0,
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      console.log("=== LOADING DASHBOARD DATA ===");

      // Fetch all data - FIXED: Get correct counts from paginated responses
      const [studentsData, teachersData, staffData, classesData] =
        await Promise.all([
          fetchStudentsData(),
          fetchTeachersCount(),
          fetchStaffCount(),
          fetchClassesCount(),
        ]);

      const totalStudents = studentsData.length;
      const totalTeachers = teachersData;
      const totalStaff = staffData;
      const activeClasses = classesData;

      console.log("Dashboard stats:", {
        students: totalStudents,
        teachers: totalTeachers,
        staff: totalStaff,
        classes: activeClasses,
      });

      // Update stats
      setStats({
        totalStudents,
        totalTeachers,
        totalStaff,
        totalParents: 0,
        activeClasses,
        revenue: totalStudents * 500,
        studentGrowth: totalStudents > 0 ? 12 : 0,
        staffGrowth: totalTeachers + totalStaff > 0 ? 8 : 0,
        classesTrend: activeClasses > 0 ? "Active" : "0%",
        revenueGrowth: totalStudents > 0 ? 15 : 0,
      });

      // Generate recent activities
      generateRecentActivities(studentsData);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch students data
  const fetchStudentsData = async () => {
    const seenIds = new Set();
    let allStudents = [];

    // Get API students
    try {
      const response = await studentAPI.getStudents();
      console.log("Student API Response:", response);

      // Extract students array from response
      let apiStudents = [];

      if (Array.isArray(response.data)) {
        apiStudents = response.data;
      } else if (Array.isArray(response.data?.students)) {
        apiStudents = response.data.students;
      } else if (Array.isArray(response.data?.data)) {
        apiStudents = response.data.data;
      } else if (Array.isArray(response)) {
        apiStudents = response;
      } else if (response.data && typeof response.data === "object") {
        apiStudents = [response.data];
      } else {
        apiStudents = [];
      }

      console.log("API students found:", apiStudents.length);

      // Process API students
      apiStudents.forEach((student) => {
        if (!student) return;
        const studentId = student?.studentId || student?.id;
        if (studentId && !seenIds.has(studentId)) {
          seenIds.add(studentId);
          allStudents.push(student);
        }
      });
    } catch (apiError) {
      console.error("API fetch failed:", apiError);
    }

    // Get localStorage students
    try {
      const localData = JSON.parse(
        localStorage.getItem("studentAdmissions") || "[]",
      );

      if (Array.isArray(localData)) {
        console.log("LocalStorage students found:", localData.length);
        localData.forEach((student) => {
          if (!student) return;
          const studentId =
            student?.studentId ||
            student?.id ||
            `local-${JSON.stringify(student)}`;
          if (!seenIds.has(studentId)) {
            seenIds.add(studentId);
            allStudents.push(student);
          }
        });
      }
    } catch (localError) {
      console.error("LocalStorage fetch failed:", localError);
    }

    console.log("Total combined students:", allStudents.length);
    return allStudents;
  };

  // NEW: Fetch teachers count - FIXED for paginated response
  const fetchTeachersCount = async () => {
    try {
      console.log("Fetching teachers count from:", API_ENDPOINTS.TEACHERS.BASE);

      // Fetch first page with small page size to get total count
      const response = await api.get(API_ENDPOINTS.TEACHERS.BASE, {
        params: { page: 1, page_size: 1 },
      });

      console.log("Teachers response:", response.data);

      const data = response.data;

      // Extract total count from paginated response
      // Your backend returns: { count: total, total_pages: X, current_page: X, data: [...] }
      if (typeof data?.count === "number") {
        console.log("Teachers count from 'count' field:", data.count);
        return data.count;
      }

      // Alternative: check for total in other formats
      if (typeof data?.total === "number") {
        console.log("Teachers count from 'total' field:", data.total);
        return data.total;
      }

      if (
        typeof data?.total_pages === "number" &&
        typeof data?.page_size === "number"
      ) {
        const estimatedTotal = data.total_pages * data.page_size;
        console.log(
          "Teachers count estimated from pagination:",
          estimatedTotal,
        );
        return estimatedTotal;
      }

      // If data is an array, return its length
      if (Array.isArray(data)) {
        console.log("Teachers count from array length:", data.length);
        return data.length;
      }

      if (data?.data && Array.isArray(data.data)) {
        console.log("Teachers count from data.data length:", data.data.length);
        return data.data.length;
      }

      console.warn("Could not extract teachers count, returning 0");
      return 0;
    } catch (error) {
      console.error("Error fetching teachers count:", error.message);
      return 0;
    }
  };

  // Fetch staff count
  const fetchStaffCount = async () => {
    try {
      console.log("Fetching staff count from:", API_ENDPOINTS.STAFF.BASE);

      const response = await api.get(API_ENDPOINTS.STAFF.BASE, {
        params: { page: 1, page_size: 1 },
      });

      console.log("Staff response:", response.data);

      const data = response.data;

      if (typeof data?.count === "number") return data.count;
      if (typeof data?.total === "number") return data.total;
      if (Array.isArray(data)) return data.length;
      if (data?.data && Array.isArray(data.data)) return data.data.length;

      return 0;
    } catch (error) {
      console.error("Error fetching staff count:", error.message);
      return 0;
    }
  };

  // Fetch classes count
  const fetchClassesCount = async () => {
    try {
      console.log("Fetching classes count from:", API_ENDPOINTS.CLASSES.BASE);

      const response = await api.get(API_ENDPOINTS.CLASSES.BASE, {
        params: { page: 1, page_size: 1 },
      });

      console.log("Classes response:", response.data);

      const data = response.data;

      if (typeof data?.count === "number") return data.count;
      if (typeof data?.total === "number") return data.total;
      if (Array.isArray(data)) return data.length;
      if (data?.data && Array.isArray(data.data)) return data.data.length;

      return 0;
    } catch (error) {
      console.error("Error fetching classes count:", error.message);
      return 0;
    }
  };

  // Generate recent activities (last 7 days)
  const generateRecentActivities = (studentsData) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Helper function to format time difference
    const getTimeAgo = (date) => {
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    };

    // Get recent student registrations (last 7 days)
    const recentStudentActivities = studentsData
      .map((student) => {
        const regDate = new Date(
          student.createdAt ||
            student.admissionDate ||
            student.academicInfo?.admissionDate ||
            Date.now(),
        );

        // Skip if older than 7 days
        if (regDate < sevenDaysAgo) return null;

        const timeAgo = getTimeAgo(regDate);
        if (!timeAgo) return null;

        let studentName = "New Student";
        if (student.firstName && student.lastName) {
          studentName = `${student.firstName} ${student.lastName}`;
        } else if (
          student.personalInfo?.firstName &&
          student.personalInfo?.lastName
        ) {
          studentName = `${student.personalInfo.firstName} ${student.personalInfo.lastName}`;
        } else if (student.name) {
          studentName = student.name;
        }

        return {
          id: student?.studentId || student?.id || Date.now(),
          type: "student",
          action: `Student registered: ${studentName}`,
          time: timeAgo,
          timestamp: regDate.getTime(),
        };
      })
      .filter((activity) => activity !== null)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5) // Limit to 5 most recent
      .map(({ timestamp, ...rest }) => rest);

    // If no recent activities, show a message
    if (recentStudentActivities.length === 0) {
      recentStudentActivities.push({
        id: "no-recent",
        type: "info",
        action: "No recent activities in the last 7 days",
        time: "Check registration logs",
      });
    }

    setActivities(recentStudentActivities);
  };

  return {
    stats,
    activities,
    loading,
    loadDashboardData,
  };
};
