// src/modules/examination/hooks/useExamination.js
import { useState, useEffect, useCallback } from "react";
import { examinationApi } from "../api/examination.api";

export const useExamination = () => {
  const [exams, setExams] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // src/modules/examination/hooks/useExamination.js
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch exams and classes independently so one failure doesn't block the other
      const examsRes = await examinationApi.getExams().catch((err) => {
        console.error("Failed to fetch exams:", err);
        return [];
      });

      const classesRes = await examinationApi.getClasses().catch((err) => {
        console.warn(
          "Failed to fetch classes, falling back to empty list:",
          err,
        );
        return [];
      });

      const examTypesRes = await examinationApi.getExamTypes().catch((err) => {
        console.warn(
          "Failed to fetch exam types, falling back to empty list:",
          err,
        );
        return [];
      });

      // Extract arrays safely based on common response layouts
      const examsData = Array.isArray(examsRes)
        ? examsRes
        : examsRes?.data || examsRes?.exams || [];
      const classesData = Array.isArray(classesRes)
        ? classesRes
        : classesRes?.data || classesRes?.classes || [];
      const examTypesData = Array.isArray(examTypesRes)
        ? examTypesRes
        : examTypesRes?.data || examTypesRes?.examTypes || [];

      setExams(examsData);
      setClasses(classesData);
      setExamTypes(examTypesData);
    } catch (err) {
      console.error("❌ Error loading initial examination data:", err);
      setError(
        "Failed to load examinations. Please check your backend connection.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  const createExam = async (examData) => {
    try {
      console.log("🔧 [HOOK DEBUG] createExam hook called");
      setLoading(true);
      setError(null);

      const response = await examinationApi.createExam(examData);
      console.log("🔧 [HOOK DEBUG] API response received:", response);

      // If we reach here, the API call was successful (no error thrown)
      // Refresh data to show the new exam
      console.log("🔧 [HOOK DEBUG] Refreshing exam list...");
      await loadInitialData();
      console.log("🔧 [HOOK DEBUG] Data refreshed successfully");

      return {
        success: true,
        data: response,
        message: "Exam created successfully!",
      };
    } catch (err) {
      console.error("🔧 [HOOK DEBUG] createExam error:", err);

      let errorMessage = "Failed to create exam";

      if (err.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        status: err.response?.status,
      };
    } finally {
      setLoading(false);
    }
  };
  const updateExam = async (id, examData) => {
    try {
      setLoading(true);
      const response = await examinationApi.updateExam(id, examData);

      // Update local state
      setExams((prev) =>
        prev.map((exam) => (exam.id === id ? response.data : exam)),
      );

      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error updating exam:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const publishExam = async (id) => {
    try {
      setLoading(true);
      const response = await examinationApi.publishExam(id);

      // Update local state
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === id ? { ...exam, status: "published" } : exam,
        ),
      );

      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error publishing exam:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateGrades = async (gradesData) => {
    try {
      setLoading(true);
      const response = await examinationApi.bulkCreateGrades(gradesData);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error bulk creating grades:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getStudentGrades = async (studentId) => {
    try {
      setLoading(true);
      const response = await examinationApi.getStudentGrades(studentId);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error fetching student grades:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateResults = async (resultsData) => {
    try {
      setLoading(true);
      const response = await examinationApi.bulkCreateResults(resultsData);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error bulk creating results:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyResults = async (verificationData) => {
    try {
      setLoading(true);
      const response = await examinationApi.verifyResults(verificationData);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error verifying results:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getExamStatistics = async (examId) => {
    try {
      setLoading(true);
      const response = await examinationApi.getExamStatistics(examId);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error fetching exam statistics:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getClassPerformance = async (classId) => {
    try {
      setLoading(true);
      const response = await examinationApi.getClassPerformance(classId);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error fetching class performance:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (params = {}) => {
    try {
      setLoading(true);
      const response = await examinationApi.getAnalytics(params);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error fetching analytics:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getReportCard = async (params) => {
    try {
      setLoading(true);
      const response = await examinationApi.getReportCard(params);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error fetching report card:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const publishReportCard = async (publishData) => {
    try {
      setLoading(true);
      const response = await examinationApi.publishReportCard(publishData);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error publishing report card:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (exportData) => {
    try {
      setLoading(true);
      const response = await examinationApi.exportReport(exportData);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `exam_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (err) {
      console.error("❌ Error exporting report:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const generateReportCards = async (examId) => {
    try {
      setLoading(true);
      const response = await examinationApi.generateReportCards(examId);
      return { success: true, data: response };
    } catch (err) {
      console.error("❌ Error generating report cards:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    exams,
    gradeScales,
    classes,
    examTypes,
    loading,
    error,

    loadInitialData,
    createExam,
    updateExam,
    publishExam,
    bulkCreateGrades,
    getStudentGrades,
    bulkCreateResults,
    verifyResults,
    getExamStatistics,
    getClassPerformance,
    getAnalytics,
    getReportCard,
    publishReportCard,
    exportReport,
    generateReportCards,
  };
};
