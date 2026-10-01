// src/modules/examination/components/setup/ExamTypeModal.jsx
import React, { useState } from "react";
import { X, Layers, AlertCircle } from "lucide-react";
import { examinationApi } from "../../api/examination.api";
import "../../../classes/components/ClassForm.css"; // Reuse shared modal styling

const ExamTypeModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [weightage, setWeightage] = useState("100");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Exam type name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        weightage: parseFloat(weightage) || 0,
        description: description.trim() || undefined,
        isActive: true,
      };

      const res = await examinationApi.createExamType(payload);
      if (res) {
        if (onCreated) onCreated();
        onClose();
      } else {
        setFormError("Failed to create exam type.");
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create exam type.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="class-modal-overlay" onClick={onClose}>
      <div className="class-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="class-modal-header">
          <h2>
            <Layers size={20} />
            Create Exam Type
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
            <label>Exam Type Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midterm, Final, Quiz"
              required
              autoFocus
            />
          </div>

          <div className="class-form-group">
            <label>Weightage Percentage (%) *</label>
            <input
              type="number"
              value={weightage}
              onChange={(e) => setWeightage(e.target.value)}
              min="0"
              max="100"
              step="0.01"
              required
            />
          </div>

          <div className="class-form-group">
            <label>Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mid-semester evaluation"
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
              {loading ? "Creating..." : "Save Exam Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamTypeModal;
