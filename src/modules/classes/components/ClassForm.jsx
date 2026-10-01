// src/modules/classes/components/ClassForm.jsx
import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle } from "lucide-react";
import "./ClassForm.css";

const ClassForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  academicSessions = [],
}) => {
  const [name, setName] = useState("");
  const [academicSessionId, setAcademicSessionId] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAcademicSessionId(initialData.academicSessionId || "");
    } else {
      const active = academicSessions.find((s) => s.isActive);
      setName("");
      setAcademicSessionId(active?.id || academicSessions[0]?.id || "");
    }
    setFormError("");
  }, [initialData, isOpen, academicSessions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Class name is required (e.g. Grade 10 - A)");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const payload = {
        name: name.trim(),
        academicSessionId: academicSessionId
          ? parseInt(academicSessionId)
          : null,
      };

      const result = initialData
        ? await onSubmit(initialData.id, payload)
        : await onSubmit(payload);

      if (result.success) {
        onClose();
      } else {
        setFormError(result.error || "Failed to save class.");
      }
    } catch (err) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="class-modal-overlay" onClick={onClose}>
      <div className="class-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="class-modal-header">
          <h2>
            <BookOpen size={20} />
            {initialData ? "Edit Class" : "Create New Class"}
          </h2>
          <button
            type="button"
            className="class-modal-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div className="class-modal-error">
            <AlertCircle size={18} className="class-error-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="class-modal-body">
          <div className="class-form-group">
            <label>Class Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              placeholder="e.g. Grade 10 - Science or Grade 10 - A"
              required
              autoFocus
            />
          </div>

          <div className="class-form-group">
            <label>Academic Session</label>
            <select
              value={academicSessionId}
              onChange={(e) => setAcademicSessionId(e.target.value)}
            >
              <option value="">-- No Session --</option>
              {academicSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} {session.isActive ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="class-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : initialData
                  ? "Update Class"
                  : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
