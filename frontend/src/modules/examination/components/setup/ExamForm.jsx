// src/modules/examination/components/setup/ExamForm.jsx
import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle } from "lucide-react";
import { TERM_OPTIONS } from "../../constants/examination.constants.js";
import "../../../classes/components/ClassForm.css";

const ExamForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  classes = [],
  academicSessions = [],
  examTypes = [],
}) => {
  // Safely unpack props in case they are wrapped in response objects
  const safeClasses = Array.isArray(classes) ? classes : classes?.data || [];
  const safeSessions = Array.isArray(academicSessions)
    ? academicSessions
    : academicSessions?.data || [];
  const safeExamTypes = Array.isArray(examTypes)
    ? examTypes
    : examTypes?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    examTypeId: "",
    classId: "",
    academicSessionId: "",
    academicYear: new Date().getFullYear().toString(),
    term: "1",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPublished =
    initialData?.status === "published" || initialData?.isPublished;

  useEffect(() => {
    if (initialData) {
      if (isPublished) {
        setFormError(
          "This exam has already been published and cannot be edited.",
        );
      } else {
        setFormError("");
      }

      setFormData({
        name: initialData.name || "",
        examTypeId: initialData.examTypeId || safeExamTypes[0]?.id || "",
        classId: initialData.classId || "",
        academicSessionId: initialData.academicSessionId || "",
        academicYear:
          initialData.academicYear || new Date().getFullYear().toString(),
        term: initialData.term || "1",
        startDate: initialData.startDate
          ? initialData.startDate.split("T")[0]
          : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        description: initialData.description || "",
      });
    } else {
      const currentYear = new Date().getFullYear();
      const defaultSession = safeSessions[0];
      setFormData({
        name: "",
        academicSessionId: defaultSession?.id || "",
        academicYear:
          defaultSession?.name || `${currentYear}-${currentYear + 1}`,
        examTypeId: safeExamTypes[0]?.id || "",
        term: "1",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        description: "",
      });
      setFormError("");
    }
  }, [initialData, isOpen, safeSessions, safeExamTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "academicSessionId") {
        const selectedSession = safeSessions.find(
          (s) => String(s.id) === String(value),
        );
        if (selectedSession) {
          updated.academicYear = selectedSession.name;
        }
      }
      return updated;
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPublished) {
      setFormError("Cannot save changes: this exam is already published.");
      return;
    }

    if (!formData.name.trim()) {
      setFormError("Exam name is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const finalData = {
        name: formData.name.trim(),
        examTypeId: parseInt(formData.examTypeId, 10),
        classId: parseInt(formData.classId, 10),
        academicSessionId: parseInt(formData.academicSessionId, 10),
        academicYear: String(formData.academicYear),
        term: String(formData.term),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description?.trim() || "",
      };

      const result = await onSubmit(finalData);
      if (result && result.success) {
        onClose();
      } else {
        setFormError(
          result?.error ||
            "Failed to save exam. It may be locked or published.",
        );
      }
    } catch (error) {
      const msg =
        error.response?.status === 403
          ? "Access denied: Published exams cannot be edited."
          : error.response?.data?.message ||
            error.message ||
            "Failed to save exam.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="class-modal-overlay" onClick={onClose}>
      <div className="class-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="class-modal-header">
          <h2>
            <BookOpen size={20} />
            {initialData ? "Edit Exam" : "Create New Exam"}
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
            <label>Exam Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Final Term Exam"
              required
              disabled={isPublished}
              autoFocus
            />
          </div>

          <div className="class-form-row">
            <div className="class-form-group">
              <label>Exam Type *</label>
              <select
                name="examTypeId"
                value={formData.examTypeId}
                onChange={handleChange}
                required
                disabled={isPublished}
              >
                <option value="">-- Select Exam Type --</option>
                {safeExamTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.weightage ? `(${type.weightage}%)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="class-form-group">
              <label>Class *</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                disabled={isPublished}
              >
                <option value="">-- Select Class / Grade --</option>
                {safeClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}{" "}
                    {cls.gradeLevel ? `(Grade ${cls.gradeLevel})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="class-form-row">
            <div className="class-form-group">
              <label>Academic Session *</label>
              <select
                name="academicSessionId"
                value={formData.academicSessionId}
                onChange={handleChange}
                required
                disabled={isPublished}
              >
                <option value="">-- Select Session --</option>
                {safeSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name ||
                      `${session.startYear} - ${session.endYear}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="class-form-group">
              <label>Term *</label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                disabled={isPublished}
              >
                {TERM_OPTIONS.map((term) => (
                  <option key={term.value} value={term.value}>
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="class-form-row">
            <div className="class-form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isPublished}
              />
            </div>

            <div className="class-form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isPublished}
              />
            </div>
          </div>

          <div className="class-form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional notes..."
              disabled={isPublished}
            />
          </div>

          <div className="class-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            {!isPublished && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : initialData
                    ? "Update Exam"
                    : "Create Exam"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
