import React, { useState, useEffect } from "react";
import examinationApi from "../api/examination.api";
import { DEFAULT_GRADE_SCALES } from "../constants/gradeScales";
import "./GradeConfigurationPage.css";

export const GradeConfigurationPage = () => {
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "A",
    minPercentage: 80,
    maxPercentage: 89.99,
    gradePoint: 4.0,
    description: "Excellent",
  });

  const fetchScales = async () => {
    setLoading(true);
    try {
      const data = await examinationApi.getGradeScales();
      setScales(
        Array.isArray(data) && data.length > 0 ? data : DEFAULT_GRADE_SCALES,
      );
    } catch {
      setScales(DEFAULT_GRADE_SCALES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this grade boundary?"))
      return;
    try {
      await examinationApi.deleteGradeScale(id);
      setScales((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete grade scale.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const created = await examinationApi.createGradeScale(formData);
      if (created) {
        setScales((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
      fetchScales();
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to create grade scale.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grade-config-container">
      <div className="grade-config-header">
        <h1>Grading Scales & Boundaries</h1>
        <p>
          Configure percentage thresholds, GPA weights, and performance remarks.
        </p>
      </div>

      <div className="grade-config-content">
        <div className="grade-config-card">
          <div className="grade-config-title-row">
            <span>Configured Grade Boundaries ({scales.length})</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="grade-config-btn-primary"
            >
              + Add Grade Scale
            </button>
          </div>

          {loading ? (
            <div className="grade-config-empty">Loading grading rules...</div>
          ) : (
            <table className="grade-config-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Percentage Range</th>
                  <th>Grade Point (GPA)</th>
                  <th>Description / Remark</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scales.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td>
                      <span className="grade-badge">{s.name || s.grade}</span>
                    </td>
                    <td>
                      <strong>
                        {s.minPercentage ?? s.min}% — {s.maxPercentage ?? s.max}
                        %
                      </strong>
                    </td>
                    <td>{Number(s.gradePoint || s.gpa || 0).toFixed(1)}</td>
                    <td>{s.description || s.remark || "Standard"}</td>
                    <td className="text-right">
                      {s.id ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="grade-btn-delete"
                        >
                          Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Default System
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="grade-modal-overlay">
          <div className="grade-modal-card">
            <h3>Add Grade Boundary</h3>
            {formError && <div className="grade-modal-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grade-form-group">
                <label>Grade Label (e.g. A+, B, C) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="grade-form-group">
                  <label>Min Percentage *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.minPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grade-form-group">
                  <label>Max Percentage *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.maxPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxPercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grade-form-group">
                <label>Grade Point (GPA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={formData.gradePoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gradePoint: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grade-form-group">
                <label>Description (e.g. Excellent, Very Good)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grade-modal-actions">
                <button
                  type="button"
                  className="grade-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="grade-config-btn-primary"
                >
                  {submitting ? "Saving..." : "Save Scale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeConfigurationPage;
