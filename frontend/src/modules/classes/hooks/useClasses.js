// src/modules/classes/hooks/useClasses.js
import { useState, useEffect, useCallback } from "react";
import classesApi from "../api/classes.api";

export const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSections: 0,
    availableCapacity: 0,
  });

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, sectionsRes, sessionsRes] = await Promise.allSettled([
        classesApi.getClasses(),
        classesApi.getSections(),
        classesApi.getAcademicSessions(),
      ]);

      let loadedClasses = [];
      let loadedSections = [];

      // 1. Classes: Unpack { count, data: [...] } from backend ClassService.findAll
      if (classesRes.status === "fulfilled") {
        const rawClassData =
          classesRes.value?.data || classesRes.value?.data?.data || [];

        const classList = Array.isArray(rawClassData)
          ? rawClassData
          : Array.isArray(classesRes.value)
            ? classesRes.value
            : [];

        loadedClasses = classList.map((cls) => ({
          id: cls.id,
          name: cls.name,
          grade: cls.grade || "",
          academicSessionId:
            cls.academicSessionId || cls.academicSession?.id || null,
          academicSessionName: cls.academicSession?.name || "None",
          studentsCount: cls.students?.length || 0,
          createdAt: cls.createdAt,
        }));

        setClasses(loadedClasses);
      } else {
        setClasses([]);
      }

      // 2. Sections: Unpack { data: [...], meta: {...} } from backend SectionService.findAll
      if (sectionsRes.status === "fulfilled") {
        const rawSectionData =
          sectionsRes.value?.data || sectionsRes.value?.data?.data || [];

        const sectionList = Array.isArray(rawSectionData)
          ? rawSectionData
          : Array.isArray(sectionsRes.value)
            ? sectionsRes.value
            : [];

        loadedSections = sectionList.map((sec) => ({
          id: sec.id,
          name: sec.name,
          classId: sec.classId,
          className: sec.class?.name || `Class #${sec.classId}`,
          capacity: sec.capacity ?? null,
          studentsCount: sec._count?.students ?? sec.students?.length ?? 0,
          createdAt: sec.createdAt,
        }));

        setSections(loadedSections);
      } else {
        setSections([]);
      }

      // 3. Academic Sessions
      if (sessionsRes.status === "fulfilled") {
        const sessionList =
          sessionsRes.value?.data?.data ||
          sessionsRes.value?.data ||
          sessionsRes.value ||
          [];
        setAcademicSessions(Array.isArray(sessionList) ? sessionList : []);
      }

      // 4. Update stats based on real backend fields
      const totalCapacity = loadedSections.reduce(
        (acc, sec) => acc + (sec.capacity || 0),
        0,
      );

      setStats({
        totalClasses: loadedClasses.length,
        totalSections: loadedSections.length,
        availableCapacity: totalCapacity,
      });
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const refreshData = async () => {
    await loadAllData();
  };

  // ==================== CLASS CRUD ====================
  const createClass = async (classData) => {
    try {
      setLoading(true);
      const payload = {
        name: classData.name.trim(),
        ...(classData.grade && { grade: classData.grade.trim() }),
        ...(classData.academicSessionId && {
          academicSessionId: parseInt(classData.academicSessionId),
        }),
      };

      const result = await classesApi.createClass(payload);

      if (result.success) {
        await loadAllData();
        return { success: true, data: result.data };
      }
      return {
        success: false,
        error: result.error || "Failed to create class",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create class",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateClass = async (id, classData) => {
    try {
      setLoading(true);
      const payload = {
        name: classData.name.trim(),
        ...(classData.grade !== undefined && {
          grade: classData.grade ? classData.grade.trim() : null,
        }),
        ...(classData.academicSessionId !== undefined && {
          academicSessionId: classData.academicSessionId
            ? parseInt(classData.academicSessionId)
            : null,
        }),
      };

      const result = await classesApi.updateClass(id, payload);

      if (result.success) {
        await loadAllData();
        return { success: true, data: result.data };
      }
      return {
        success: false,
        error: result.error || "Failed to update class",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update class",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    try {
      setLoading(true);
      const result = await classesApi.deleteClass(id);

      if (result.success) {
        await loadAllData();
        return { success: true };
      }
      return {
        success: false,
        error:
          result.error ||
          "Cannot delete class with active students. Please transfer or remove students first.",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete class.",
      };
    } finally {
      setLoading(false);
    }
  };

  // ==================== SECTION CRUD ====================
  const createSection = async (sectionData) => {
    try {
      setLoading(true);
      const payload = {
        name: sectionData.name.trim(),
        classId: parseInt(sectionData.classId),
        ...(sectionData.capacity !== "" &&
          sectionData.capacity !== undefined && {
            capacity: parseInt(sectionData.capacity),
          }),
      };

      const result = await classesApi.createSection(payload);

      if (result.success) {
        await loadAllData();
        return { success: true, data: result.data };
      }
      return {
        success: false,
        error: result.error || "Failed to create section",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create section",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      setLoading(true);
      const payload = {
        name: sectionData.name.trim(),
        ...(sectionData.capacity !== "" &&
          sectionData.capacity !== undefined && {
            capacity: parseInt(sectionData.capacity),
          }),
      };

      const result = await classesApi.updateSection(id, payload);

      if (result.success) {
        await loadAllData();
        return { success: true, data: result.data };
      }
      return {
        success: false,
        error: result.error || "Failed to update section",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update section",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id) => {
    try {
      setLoading(true);
      const result = await classesApi.deleteSection(id);

      if (result.success) {
        await loadAllData();
        return { success: true };
      }
      return {
        success: false,
        error:
          result.error ||
          "Cannot delete section with active students. Move students first.",
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete section",
      };
    } finally {
      setLoading(false);
    }
  };

  const getClassById = (id) => {
    return classes.find((cls) => cls.id === parseInt(id));
  };

  const getSectionsByClass = (classId) => {
    return sections.filter((section) => section.classId === parseInt(classId));
  };

  return {
    classes,
    sections,
    academicSessions,
    loading,
    error,
    stats,
    loadAllData,
    refreshData,
    createClass,
    updateClass,
    deleteClass,
    createSection,
    updateSection,
    deleteSection,
    getClassById,
    getSectionsByClass,
  };
};

export default useClasses;
