import { useState, useCallback, useEffect } from "react";
import api from "@/api/axios";

export const useGradingMetadata = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetadata = useCallback(async () => {
    setLoading(true);
    try {
      const [clsRes, subRes, stuRes, sesRes] = await Promise.allSettled([
        api.get("/classes"),
        api.get("/subjects"),
        api.get("/students"),
        api.get("/academic-sessions"),
      ]);

      if (clsRes.status === "fulfilled") {
        setClasses(clsRes.value.data?.data || clsRes.value.data || []);
      }
      if (subRes.status === "fulfilled") {
        setSubjects(subRes.value.data?.data || subRes.value.data || []);
      }
      if (stuRes.status === "fulfilled") {
        setStudents(stuRes.value.data?.data || stuRes.value.data || []);
      }
      if (sesRes.status === "fulfilled") {
        setSessions(sesRes.value.data?.data || sesRes.value.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    classes,
    subjects,
    students,
    sessions,
    loading,
    refreshMetadata: fetchMetadata,
  };
};
