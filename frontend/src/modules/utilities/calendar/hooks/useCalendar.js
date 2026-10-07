import { useState, useEffect, useCallback } from "react";
import { calendarApi } from "../api/calendar.api";

export const useCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await calendarApi.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load calendar events",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (eventData) => {
    try {
      await calendarApi.createEvent(eventData);
      await fetchEvents();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to create event",
      };
    }
  };

  const removeEvent = async (id) => {
    try {
      await calendarApi.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to delete event",
      };
    }
  };

  return {
    events,
    loading,
    error,
    addEvent,
    removeEvent,
    refreshEvents: fetchEvents,
  };
};
