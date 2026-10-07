import React, { useState } from "react";
import { useCalendar } from "../hooks/useCalendar";
import "./CalendarPage.css";

export const CalendarPage = () => {
  const { events, loading, error, addEvent, removeEvent, refreshEvents } =
    useCalendar();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    eventId: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    setSubmitting(true);
    const payload = {
      title,
      eventDate: new Date(eventDate).toISOString(),
      notifyAt: new Date(eventDate).toISOString(),
      description,
    };

    const result = await addEvent(payload);
    setSubmitting(false);

    if (result.success !== false) {
      setTitle("");
      setEventDate("");
      setDescription("");
      refreshEvents();
    } else {
      alert(result.error || "Failed to save event");
    }
  };

  const confirmDelete = (id) => {
    setModalConfig({ isOpen: true, eventId: id });
  };

  const executeDelete = async () => {
    if (!modalConfig.eventId) return;
    try {
      await removeEvent(modalConfig.eventId);
      refreshEvents();
    } catch (err) {
      alert("Failed to delete event.");
    }
    setModalConfig({ isOpen: false, eventId: null });
  };

  return (
    <div className="calendar-page-container">
      <div className="calendar-page-header">
        <h1 className="calendar-page-title">Academic Calendar</h1>
        <p className="calendar-page-subtitle">
          Manage school terms, exam dates, meetings, and academic schedules.
        </p>
      </div>

      <div className="calendar-page-content">
        {error && <div className="calendar-error-banner">{error}</div>}

        <div className="calendar-page-grid">
          <div className="calendar-card">
            <h2 className="calendar-card-title">Add Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="calendar-form-group">
                <label className="calendar-form-label">Event Title *</label>
                <input
                  className="calendar-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Exams"
                  required
                />
              </div>

              <div className="calendar-form-group">
                <label className="calendar-form-label">Event Date *</label>
                <input
                  type="date"
                  className="calendar-form-input"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="calendar-form-group">
                <label className="calendar-form-label">Description</label>
                <textarea
                  className="calendar-form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="calendar-submit-btn"
              >
                {submitting ? "Saving..." : "Save Event"}
              </button>
            </form>
          </div>

          <div className="calendar-card">
            <div className="calendar-card-title">
              <span>Scheduled Events</span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "normal",
                }}
              >
                {events.length} total
              </span>
            </div>

            {loading ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading events...
              </p>
            ) : events.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                No calendar events found.
              </p>
            ) : (
              <ul className="calendar-event-list">
                {events.map((evt, index) => {
                  const evtId = evt.id || evt._id || index;
                  return (
                    <li key={evtId} className="calendar-event-item">
                      <div className="calendar-event-info">
                        <div className="calendar-event-name">{evt.title}</div>
                        {evt.description && (
                          <div className="calendar-event-desc">
                            {evt.description}
                          </div>
                        )}
                        <span className="calendar-event-date">
                          Date: {evt.eventDate?.split("T")[0]}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => confirmDelete(evtId)}
                        className="calendar-delete-btn"
                        title="Delete Event"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal-card">
            <h3 className="calendar-modal-title">Delete Event</h3>
            <p className="calendar-modal-text">
              Are you sure you want to permanently delete this calendar event?
            </p>
            <div className="calendar-modal-actions">
              <button
                type="button"
                className="calendar-modal-cancel-btn"
                onClick={() => setModalConfig({ isOpen: false, eventId: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="calendar-modal-confirm-btn"
                onClick={executeDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
