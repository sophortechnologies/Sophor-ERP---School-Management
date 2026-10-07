import React, { useState } from "react";
import { useHoliday } from "../hooks/useHoliday";
import "./HolidayPage.css";

export const HolidayPage = () => {
  const {
    holidays,
    loading,
    error,
    addHoliday,
    removeHoliday,
    refreshHolidays,
  } = useHoliday();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    holidayId: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date) return;

    setSubmitting(true);
    const payload = {
      name,
      date: new Date(date).toISOString(),
    };

    const result = await addHoliday(payload);
    setSubmitting(false);

    if (result.success !== false) {
      setName("");
      setDate("");
      refreshHolidays();
    } else {
      alert(result.error || "Failed to save holiday");
    }
  };

  const confirmDelete = (id) => {
    setModalConfig({ isOpen: true, holidayId: id });
  };

  const executeDelete = async () => {
    if (!modalConfig.holidayId) return;
    try {
      await removeHoliday(modalConfig.holidayId);
      refreshHolidays();
    } catch (err) {
      alert("Failed to delete holiday.");
    }
    setModalConfig({ isOpen: false, holidayId: null });
  };

  return (
    <div className="holiday-page-container">
      <div className="holiday-page-header">
        <h1 className="holiday-page-title">School Holidays Management</h1>
        <p className="holiday-page-subtitle">
          Configure official school breaks, festive closures, and holidays.
        </p>
      </div>

      <div className="holiday-page-content">
        {error && <div className="holiday-error-banner">{error}</div>}

        <div className="holiday-page-grid">
          <div className="holiday-card">
            <h2 className="holiday-card-title">Add Holiday</h2>
            <form onSubmit={handleSubmit}>
              <div className="holiday-form-group">
                <label className="holiday-form-label">Holiday Name *</label>
                <input
                  className="holiday-form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Easter Break"
                  required
                />
              </div>

              <div className="holiday-form-group">
                <label className="holiday-form-label">Holiday Date *</label>
                <input
                  type="date"
                  className="holiday-form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="holiday-submit-btn"
              >
                {submitting ? "Saving..." : "Save Holiday"}
              </button>
            </form>
          </div>

          <div className="holiday-card">
            <div className="holiday-card-title">
              <span>Registered Holidays</span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "normal",
                }}
              >
                {holidays.length} recorded
              </span>
            </div>

            {loading ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading holidays...
              </p>
            ) : holidays.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                No holidays recorded.
              </p>
            ) : (
              <ul className="holiday-list">
                {holidays.map((h, index) => {
                  const hId = h.id || h._id || index;
                  return (
                    <li key={hId} className="holiday-item">
                      <div className="holiday-info">
                        <div className="holiday-name">{h.name}</div>
                        <span className="holiday-date">
                          Date: {h.date?.split("T")[0]}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => confirmDelete(hId)}
                        className="holiday-delete-btn"
                        title="Delete Holiday"
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
        <div className="holiday-modal-overlay">
          <div className="holiday-modal-card">
            <h3 className="holiday-modal-title">Delete Holiday</h3>
            <p className="holiday-modal-text">
              Are you sure you want to permanently delete this holiday entry?
            </p>
            <div className="holiday-modal-actions">
              <button
                type="button"
                className="holiday-modal-cancel-btn"
                onClick={() =>
                  setModalConfig({ isOpen: false, holidayId: null })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="holiday-modal-confirm-btn"
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

export default HolidayPage;
