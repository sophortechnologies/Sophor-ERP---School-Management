// src/modules/department/components/DepartmentForm.jsx
import React, { useState, useEffect } from "react";
import { X, Building2, Hash, FileText, User, AlertCircle } from "lucide-react";
import { teacherApi } from "../../teacher/api/teacher.api";
import "./DepartmentForm.css";

const DepartmentForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    headId: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const res = await teacherApi.getAllTeachers({ page_size: 100 });
        if (res.success && res.data) {
          setTeachers(res.data);
        }
      } catch (err) {
        console.warn("Could not load teachers for dropdown:", err);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        headId: initialData.headId || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        headId: "",
      });
    }
    setFormError("");
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const selectedHeadId = formData.headId ? parseInt(formData.headId) : null;
      const targetName = formData.name.trim();
      const targetCode = (
        formData.code || `DEPT-${Date.now().toString().slice(-4)}`
      )
        .trim()
        .toUpperCase();

      // 1. Validation: Prevent stealing another department's head
      if (selectedHeadId) {
        const conflictingDept = departments.find(
          (d) =>
            d.headId === selectedHeadId &&
            (!initialData || d.id !== initialData.id),
        );

        if (conflictingDept) {
          const teacherObj = teachers.find((t) => t.id === selectedHeadId);
          const teacherName = teacherObj
            ? `${teacherObj.firstName || teacherObj.first_name || ""} ${teacherObj.lastName || teacherObj.last_name || ""}`.trim()
            : `Teacher #${selectedHeadId}`;

          setFormError(
            `${teacherName} is already assigned as the Head of "${conflictingDept.name}". A teacher cannot head multiple departments.`,
          );
          setLoading(false);
          return;
        }
      }

      // 2. Validation: Prevent duplicate code
      const duplicateCode = departments.find(
        (d) =>
          d.code.toUpperCase() === targetCode &&
          (!initialData || d.id !== initialData.id),
      );
      if (duplicateCode) {
        setFormError(
          `Department code "${targetCode}" is already assigned to "${duplicateCode.name}".`,
        );
        setLoading(false);
        return;
      }

      // 3. Validation: Prevent duplicate name
      const duplicateName = departments.find(
        (d) =>
          d.name.toLowerCase() === targetName.toLowerCase() &&
          (!initialData || d.id !== initialData.id),
      );
      if (duplicateName) {
        setFormError(
          `A department with the name "${targetName}" already exists.`,
        );
        setLoading(false);
        return;
      }

      const departmentData = {
        name: targetName,
        code: targetCode,
        description: formData.description ? formData.description.trim() : null,
        headId: selectedHeadId,
      };

      const result = initialData
        ? await onSubmit(initialData.id, departmentData)
        : await onSubmit(departmentData);

      if (result.success) {
        onClose();
      } else {
        const rawErr = String(result.error || result.message || "");
        const lower = rawErr.toLowerCase();

        if (
          lower.includes("code") &&
          (lower.includes("exist") ||
            lower.includes("unique") ||
            lower.includes("conflict"))
        ) {
          setFormError(
            `Department code "${departmentData.code}" is already assigned to another department.`,
          );
        } else if (
          lower.includes("name") &&
          (lower.includes("exist") ||
            lower.includes("unique") ||
            lower.includes("conflict"))
        ) {
          setFormError(
            `Department name "${departmentData.name}" already exists.`,
          );
        } else if (
          lower.includes("head") ||
          lower.includes("unique constraint") ||
          lower.includes("headid")
        ) {
          setFormError(
            "The selected teacher is already assigned as head of another department.",
          );
        } else {
          setFormError(rawErr || "Failed to save department.");
        }
      }
    } catch (error) {
      setFormError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="department-departmentform-department-form-modal">
      <div
        className="department-departmentform-modal-overlay"
        onClick={onClose}
      ></div>
      <div className="department-departmentform-modal-content">
        <div className="department-departmentform-modal-header">
          <h2>
            <Building2 size={20} />
            {initialData ? "Edit Department" : "Add New Department"}
          </h2>
          <button
            className="department-departmentform-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div
            style={{
              margin: "0 24px 16px 24px",
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="department-departmentform-form-sections">
            <div className="department-departmentform-form-section">
              <h3>
                <Building2 size={18} />
                Department Information
              </h3>
              <div className="department-departmentform-form-grid">
                <div className="department-departmentform-form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Social Sciences"
                  />
                </div>

                <div className="department-departmentform-form-group">
                  <label>Department Code *</label>
                  <div className="department-departmentform-input-with-icon">
                    <Hash size={16} />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      placeholder="e.g., SOC-100"
                    />
                  </div>
                </div>

                <div className="department-departmentform-form-group">
                  <label>Head Teacher (Optional)</label>
                  <div className="department-departmentform-input-with-icon">
                    <User size={16} />
                    <select
                      name="headId"
                      value={formData.headId}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        background: "white",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">-- None (No Head Assigned) --</option>
                      {teachers.map((t) => {
                        const name =
                          `${t.firstName || t.first_name || ""} ${t.lastName || t.last_name || ""}`.trim() ||
                          t.name ||
                          `Teacher #${t.id}`;

                        // Check if teacher is already head of another department
                        const alreadyHeadOf = departments.find(
                          (d) =>
                            d.headId === t.id &&
                            (!initialData || d.id !== initialData.id),
                        );

                        return (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={Boolean(alreadyHeadOf)}
                          >
                            {name}{" "}
                            {alreadyHeadOf
                              ? `(Already Head of ${alreadyHeadOf.name})`
                              : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <small className="department-departmentform-help-text">
                    A teacher can only be assigned as the Head of one department
                    at a time.
                  </small>
                </div>

                <div className="department-departmentform-form-group full-width">
                  <label>Description (Optional)</label>
                  <div className="department-departmentform-input-with-icon">
                    <FileText size={16} />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter department scope and details..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="department-departmentform-form-actions">
            <button
              type="button"
              className="btn department-departmentform-btn-secondary"
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
                  ? "Update Department"
                  : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
