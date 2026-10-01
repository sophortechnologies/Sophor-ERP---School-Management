// src/modules/classes/components/SectionForm.jsx
import React, { useState, useEffect } from "react";
import { X, Layers, AlertCircle } from "lucide-react";
import "./ClassForm.css"; // Reuses shared modal styling

const SectionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  classes = [],
}) => {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setClassId(initialData.classId || "");
      setCapacity(initialData.capacity ?? 30);
    } else {
      setName("");
      setClassId(classes[0]?.id || "");
      setCapacity(30);
    }
    setFormError("");
  }, [initialData, isOpen, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Section name is required (e.g., A, B, or Section 1)");
      return;
    }
    if (!initialData && !classId) {
      setFormError("Please select a parent class");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const payload = initialData
        ? {
            name: name.trim(),
            ...(capacity !== "" && { capacity: parseInt(capacity) }),
          }
        : {
            name: name.trim(),
            classId: parseInt(classId),
            ...(capacity !== "" && { capacity: parseInt(capacity) }),
          };

      const result = await onSubmit(payload);

      if (result.success) {
        onClose();
      } else {
        setFormError(result.error || "Failed to save section.");
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
            <Layers size={20} />
            {initialData ? "Edit Section" : "Create New Section"}
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
            <label>Section Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              placeholder="e.g. A, B, or Section 1"
              required
              autoFocus
            />
          </div>

          {!initialData && (
            <div className="class-form-group">
              <label>Parent Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="class-form-group">
            <label>Student Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              placeholder="e.g. 30"
            />
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
                  ? "Update Section"
                  : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionForm;
