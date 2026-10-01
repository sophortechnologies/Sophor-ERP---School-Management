// modules/teacher/hooks/useTeacher.js
import { useCallback, useEffect, useState } from 'react';
import { teacherApi } from '../api/teacher.api';

export const useTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [error, setError] = useState(null);
  const [errorSpecs, setErrorSpecs] = useState(null);

  // Load all teachers
  const loadTeachers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherApi.getAllTeachers(params);
      if (!response.success) {
        setError(response.message);
        setTeachers([]);
        setTotalTeachers(0);
      } else {
        setTeachers(response.data || []);
        setTotalTeachers(response.total || (response.data || []).length);
      }
      return response;
    } catch (err) {
      setError(err.message);
      setTeachers([]);
      setTotalTeachers(0);
      return { success: false, message: err.message, data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specializations from subjects
  const loadSpecializations = useCallback(async () => {
    setLoadingSpecs(true);
    setErrorSpecs(null);
    try {
      const response = await teacherApi.getSpecializationsFromSubjects();
      
      if (response.success && response.data && response.data.length > 0) {
        setSpecializations(response.data);
      } else {
        setErrorSpecs(response.message || "Failed to load specializations");
        // Fallback to defaults
        setSpecializations(["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology"]);
      }
    } catch (err) {
      console.error('Error loading specializations:', err);
      setErrorSpecs(err.message);
      // Use defaults on error
      setSpecializations(["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology"]);
    } finally {
      setLoadingSpecs(false);
    }
  }, []);

  // Create teacher
  const createTeacher = useCallback(async (teacherData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teacherApi.createTeacher(teacherData);
      
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        const newTeacher = response.data;
        setTeachers(prev => [...prev, newTeacher]);
        return { success: true, data: newTeacher };
      }
    } catch (err) {
      console.error('Error in createTeacher:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update teacher
  const updateTeacher = useCallback(async (teacherId, teacherData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teacherApi.updateTeacher(teacherId, teacherData);
      
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        const updatedTeacher = response.data;
        setTeachers(prev => prev.map(teacher => 
          teacher.id === teacherId ? updatedTeacher : teacher
        ));
        return { success: true, data: updatedTeacher };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete teacher
  const deleteTeacher = useCallback(async (teacherId) => {
    setLoading(true);
    try {
      const response = await teacherApi.deleteTeacher(teacherId);
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get teacher by id
  const getTeacherById = useCallback(async (teacherId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherApi.getTeacherById(teacherId);
      if (!response.success) {
        setError(response.message);
      }
      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message, data: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadTeachers();
    loadSpecializations();
  }, [loadTeachers, loadSpecializations]);

  return {
    teachers,
    totalTeachers,
    specializations,
    loading: loading || loadingSpecs,
    error: error || errorSpecs,
    loadTeachers,
    loadSpecializations,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById
  };
};