// modules/subject/hooks/useSubject.js
import { useState, useEffect } from 'react';
import { subjectApi } from '../api/subject.api';

export const useSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectTypes] = useState(["CORE", "ELECTIVE", "LAB"]); // Hardcoded types
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all subjects
  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await subjectApi.getAllSubjects();
      if (!response.success) {
        setError(response.message);
        setSubjects([]);
      } else {
        setSubjects(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Create subject
  const createSubject = async (subjectData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await subjectApi.createSubject(subjectData);
      
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        const newSubject = response.data;
        setSubjects(prev => [...prev, newSubject]);
        return { success: true, data: newSubject };
      }
    } catch (err) {
      console.error('Error in createSubject:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update subject
  const updateSubject = async (subjectId, subjectData) => {
    setLoading(true);
    try {
      const response = await subjectApi.updateSubject(subjectId, subjectData);
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        const updatedSubject = response.data;
        setSubjects(prev => prev.map(subject => 
          subject.id === subjectId ? updatedSubject : subject
        ));
        return { success: true, data: updatedSubject };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete subject
  const deleteSubject = async (subjectId) => {
    setLoading(true);
    try {
      const response = await subjectApi.deleteSubject(subjectId);
      if (!response.success) {
        setError(response.message);
        return { success: false, error: response.message };
      } else {
        setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  return {
    subjects,
    subjectTypes, // Hardcoded types
    loading,
    error,
    loadSubjects,
    createSubject,
    updateSubject,
    deleteSubject
  };
};