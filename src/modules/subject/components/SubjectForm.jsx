// src/modules/subject/components/SubjectForm.jsx
import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle } from "lucide-react";
import "./SubjectForm.css";

const SubjectForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "CORE",
    description: "",
    departmentId: "",
    isActive: true,
  });

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        type: (initialData.type || "CORE").toUpperCase(),
        description: initialData.description || "",
        departmentId: initialData.departmentId || departments[0]?.id || "",
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "CORE",
        description: "",
        departmentId: departments[0]?.id || "",
        isActive: true,
      });
    }
    setFormError("");
  }, [initialData, isOpen, departments]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Subject name is required");
      return;
    }
    if (!formData.code.trim()) {
      setFormError("Subject code is required (e.g. MATH101)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type.toUpperCase(),
        description: formData.description.trim() || null,
        departmentId: formData.departmentId
          ? parseInt(formData.departmentId)
          : null,
        isActive: formData.isActive,
      };

      const result = initialData
        ? await onSubmit(initialData.id, payload)
        : await onSubmit(payload);

      if (result.success) {
        const metaKey = `subject_meta_${payload.code}`;
        const selectedDept = departments.find(
          (d) => String(d.id) === String(payload.departmentId),
        );
        localStorage.setItem(
          metaKey,
          JSON.stringify({
            ...payload,
            departmentName: selectedDept?.name || "",
          }),
        );

        onClose();
      } else {
        setFormError(result.error || "Failed to save subject.");
      }
    } catch (err) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="subject-modal-overlay" onClick={onClose}>
      <div className="subject-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="subject-modal-header">
          <h2>
            <BookOpen size={20} />
            {initialData ? "Edit Subject" : "Create New Subject"}
          </h2>
          <button
            type="button"
            className="subject-modal-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div className="subject-modal-error">
            <AlertCircle size={18} className="subject-error-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="subject-modal-body">
          <div className="subject-form-group">
            <label>Subject Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Advanced Mathematics"
              required
              autoFocus
            />
          </div>

          <div className="subject-form-row">
            <div className="subject-form-group">
              <label>Subject Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. MATH101"
                required
                className="subject-code-input"
              />
            </div>

            <div className="subject-form-group">
              <label>Subject Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="CORE">CORE</option>
                <option value="ELECTIVE">ELECTIVE</option>
                <option value="LAB">LAB</option>
              </select>
            </div>
          </div>

          <div className="subject-form-group">
            <label>Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
            >
              <option value="">-- No Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="subject-form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Course description (optional)"
            />
          </div>

          <div className="subject-checkbox-group">
            <input
              type="checkbox"
              id="subActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="subActive">Active Curriculum Subject</label>
          </div>

          <div className="subject-modal-actions">
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
                  ? "Update Subject"
                  : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;
