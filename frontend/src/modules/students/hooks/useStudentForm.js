// In src/modules/students/hooks/useStudentForm.js
import { useState, useEffect } from "react";
import { studentAPI } from "../api/student.api";
import { ACADEMIC_SESSIONS } from "../constants";

export const useStudentForm = () => {
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only load academic sessions
      const sessionsResponse = await studentAPI.getAcademicSessions();
      if (Array.isArray(sessionsResponse.data) && sessionsResponse.data.length > 0) {
        setAcademicSessions(sessionsResponse.data);
      } else {
        setAcademicSessions(ACADEMIC_SESSIONS);
      }
    } catch (error) {
      console.error("Failed to load academic sessions:", error);
      setError(error?.message || "Failed to load academic sessions");
      // Fallback to default sessions
      setAcademicSessions(ACADEMIC_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  return { academicSessions, loading, error };
};
