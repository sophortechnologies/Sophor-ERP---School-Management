// src/modules/academic-sessions/components/AcademicSessionForm.jsx
import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { useAcademicSessions } from "../hooks/useAcademicSessions";

const AcademicSessionForm = ({ isOpen, onClose, initialData, onSuccess }) => {
  const { createSession, updateSession, loading } = useAcademicSessions();
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        startDate: initialData.startDate
          ? initialData.startDate.split("T")[0]
          : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        isActive: initialData.isActive || false,
      });
    } else {
      // Set default dates for new session (next academic year)
      const currentYear = new Date().getFullYear();
      setFormData({
        name: `${currentYear}-${currentYear + 1}`,
        startDate: `${currentYear}-09-01`,
        endDate: `${currentYear + 1}-08-31`,
        isActive: false,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Session name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "End date must be after start date";
      }
      if (start < new Date()) {
        newErrors.startDate = "Start date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    const response = initialData
      ? await updateSession(initialData.id, payload)
      : await createSession(payload);

    if (response.success) {
      alert(
        initialData
          ? "Session updated successfully"
          : "Session created successfully",
      );
      onSuccess?.();
      onClose();
    } else {
      alert(`Error: ${response.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Calendar size={20} />{" "}
            {initialData ? "Edit Academic Session" : "New Academic Session"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Session Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., 2024-2025"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? "error" : ""}
              />
              {errors.startDate && (
                <span className="error-text">{errors.startDate}</span>
              )}
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? "error" : ""}
              />
              {errors.endDate && (
                <span className="error-text">{errors.endDate}</span>
              )}
            </div>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Activate this session immediately
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicSessionForm;
