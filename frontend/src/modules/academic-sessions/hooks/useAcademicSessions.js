// src/modules/academic-sessions/hooks/useAcademicSessions.js
import { useState, useCallback } from "react";
import { academicSessionsApi } from "../api/academic-sessions.api";

export const useAcademicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAllSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await academicSessionsApi.getAll();
      if (response.success) {
        setSessions(response.data);
        return response.data;
      } else {
        setError(response.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await academicSessionsApi.getActive();
      if (response.success) {
        setActiveSession(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSessionById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await academicSessionsApi.getById(id);
      if (response.success) {
        setSelectedSession(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await academicSessionsApi.getStats(id);
      if (response.success) {
        setStats(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await academicSessionsApi.create(data);
        if (response.success) {
          await loadAllSessions();
          return response;
        } else {
          setError(response.message);
          return response;
        }
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAllSessions],
  );

  const updateSession = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await academicSessionsApi.update(id, data);
        if (response.success) {
          await loadAllSessions();
          if (activeSession?.id === id) {
            await loadActiveSession();
          }
          return response;
        } else {
          setError(response.message);
          return response;
        }
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAllSessions, loadActiveSession, activeSession],
  );

  const activateSession = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await academicSessionsApi.setActive(id);
        if (response.success) {
          await loadAllSessions();
          await loadActiveSession();
          return response;
        }
        return response;
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAllSessions, loadActiveSession],
  );

  const deleteSession = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await academicSessionsApi.delete(id);
        if (response.success) {
          await loadAllSessions();
          if (activeSession?.id === id) {
            await loadActiveSession();
          }
          return response;
        }
        return response;
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadAllSessions, loadActiveSession, activeSession],
  );

  return {
    sessions,
    activeSession,
    selectedSession,
    stats,
    loading,
    error,
    loadAllSessions,
    loadActiveSession,
    loadSessionById,
    loadStats,
    createSession,
    updateSession,
    activateSession,
    deleteSession,
  };
};
