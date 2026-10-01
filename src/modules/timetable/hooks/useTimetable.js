import { useState, useCallback } from "react";
import { timetableApi } from "../api/timetable.api";

export const useTimetable = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassTimetable = useCallback(async (classId, sectionId) => {
    setLoading(true);
    setError(null);
    const result = await timetableApi.getTimetableByClass(classId, sectionId);
    if (result.success) {
      setTimetableData(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, []);

  const saveEntry = async (payload) => {
    setLoading(true);
    const result = await timetableApi.createOrUpdateTimetable(payload);
    setLoading(false);
    return result;
  };

  const removeEntry = async (id) => {
    setLoading(true);
    const result = await timetableApi.deleteTimetableEntry(id);
    setLoading(false);
    return result;
  };

  return {
    timetableData,
    loading,
    error,
    fetchClassTimetable,
    saveEntry,
    removeEntry,
  };
};
