// src/modules/examination/components/GradeConfiguration/GradeConfiguration.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Edit,
  Check,
  X,
  Hash,
  Percent,
  Award,
} from "lucide-react";
import { DEFAULT_GRADE_SCALES } from "../../constants/gradeScales";
import "./GradeConfiguration.css";

const GradeConfiguration = ({ initialScale = null, onSave, onCancel }) => {
  const [scale, setScale] = useState(
    initialScale || DEFAULT_GRADE_SCALES.STANDARD_100,
  );
  const [editingIndex, setEditingIndex] = useState(null);
  const [newThreshold, setNewThreshold] = useState({
    min: "",
    max: "",
    grade: "",
    gpa: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialScale) {
      setScale(initialScale);
    }
  }, [initialScale]);

  const validateThreshold = (threshold) => {
    const newErrors = {};

    if (threshold.min === "" || threshold.min < 0 || threshold.min > 100) {
      newErrors.min = "Minimum must be between 0 and 100";
    }

    if (threshold.max === "" || threshold.max < 0 || threshold.max > 100) {
      newErrors.max = "Maximum must be between 0 and 100";
    }

    if (
      threshold.min !== "" &&
      threshold.max !== "" &&
      parseFloat(threshold.min) > parseFloat(threshold.max)
    ) {
      newErrors.range = "Minimum cannot be greater than maximum";
    }

    if (!threshold.grade.trim()) {
      newErrors.grade = "Grade is required";
    }

    if (threshold.gpa === "" || threshold.gpa < 0 || threshold.gpa > 4.0) {
      newErrors.gpa = "GPA must be between 0 and 4.0";
    }

    if (!threshold.description.trim()) {
      newErrors.description = "Description is required";
    }

    return newErrors;
  };

  const handleAddThreshold = () => {
    const errors = validateThreshold(newThreshold);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const updatedScale = {
      ...scale,
      thresholds: [
        ...scale.thresholds,
        {
          min: parseFloat(newThreshold.min),
          max: parseFloat(newThreshold.max),
          grade: newThreshold.grade.trim(),
          gpa: parseFloat(newThreshold.gpa),
          description: newThreshold.description.trim(),
        },
      ].sort((a, b) => b.min - a.min), // Sort descending
    };

    setScale(updatedScale);
    setNewThreshold({ min: "", max: "", grade: "", gpa: "", description: "" });
    setErrors({});
  };

  const handleUpdateThreshold = (index, updatedThreshold) => {
    const errors = validateThreshold(updatedThreshold);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const updatedScale = {
      ...scale,
      thresholds: scale.thresholds
        .map((threshold, i) =>
          i === index
            ? {
                min: parseFloat(updatedThreshold.min),
                max: parseFloat(updatedThreshold.max),
                grade: updatedThreshold.grade.trim(),
                gpa: parseFloat(updatedThreshold.gpa),
                description: updatedThreshold.description.trim(),
              }
            : threshold,
        )
        .sort((a, b) => b.min - a.min),
    };

    setScale(updatedScale);
    setEditingIndex(null);
    setErrors({});
  };

  const handleDeleteThreshold = (index) => {
    const updatedScale = {
      ...scale,
      thresholds: scale.thresholds.filter((_, i) => i !== index),
    };
    setScale(updatedScale);
  };

  const handleSave = () => {
    if (scale.thresholds.length === 0) {
      alert("Please add at least one grade threshold");
      return;
    }

    // Validate all thresholds
    for (const threshold of scale.thresholds) {
      const errors = validateThreshold(threshold);
      if (Object.keys(errors).length > 0) {
        alert("Please fix all errors before saving");
        return;
      }
    }

    onSave(scale);
  };

  return (
    <div className="examination-gradeconfiguration-gradeconfiguration-grade-configuration">
      <div className="examination-gradeconfiguration-gradeconfiguration-configuration-header">
        <h3>
          <Award size={20} />
          Grade Configuration
        </h3>
        <div className="examination-gradeconfiguration-gradeconfiguration-scale-info">
          <div className="examination-gradeconfiguration-gradeconfiguration-info-item">
            <span className="examination-gradeconfiguration-gradeconfiguration-label">System:</span>
            <span className="examination-gradeconfiguration-gradeconfiguration-value">
              {scale.system === "percentage"
                ? "Percentage-based"
                : "Letter-based"}
            </span>
          </div>
          <div className="examination-gradeconfiguration-gradeconfiguration-info-item">
            <span className="examination-gradeconfiguration-gradeconfiguration-label">Passing:</span>
            <span className="examination-gradeconfiguration-gradeconfiguration-value">
              {scale.passingPercentage || scale.passingGrade || "N/A"}
            </span>
          </div>
          <div className="examination-gradeconfiguration-gradeconfiguration-info-item">
            <span className="examination-gradeconfiguration-gradeconfiguration-label">Thresholds:</span>
            <span className="examination-gradeconfiguration-gradeconfiguration-value">{scale.thresholds.length}</span>
          </div>
        </div>
      </div>

      <div className="examination-gradeconfiguration-gradeconfiguration-scale-name-input">
        <label htmlFor="scaleName">Scale Name</label>
        <input
          type="text"
          id="scaleName"
          value={scale.name}
          onChange={(e) => setScale({ ...scale, name: e.target.value })}
          placeholder="Enter scale name"
        />
      </div>

      <div className="examination-gradeconfiguration-gradeconfiguration-thresholds-section">
        <h4>Grade Thresholds</h4>

        <div className="examination-gradeconfiguration-gradeconfiguration-add-threshold-form">
          <div className="examination-gradeconfiguration-gradeconfiguration-form-row">
            <div className="examination-gradeconfiguration-gradeconfiguration-form-group">
              <label htmlFor="minRange">
                <Percent size={14} />
                Min %
              </label>
              <input
                type="number"
                id="minRange"
                value={newThreshold.min}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, min: e.target.value })
                }
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
              />
              {errors.min && <span className="examination-gradeconfiguration-gradeconfiguration-error-text">{errors.min}</span>}
            </div>

            <div className="examination-gradeconfiguration-gradeconfiguration-form-group">
              <label htmlFor="maxRange">
                <Percent size={14} />
                Max %
              </label>
              <input
                type="number"
                id="maxRange"
                value={newThreshold.max}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, max: e.target.value })
                }
                min="0"
                max="100"
                step="0.1"
                placeholder="100"
              />
              {errors.max && <span className="examination-gradeconfiguration-gradeconfiguration-error-text">{errors.max}</span>}
            </div>

            <div className="examination-gradeconfiguration-gradeconfiguration-form-group">
              <label htmlFor="grade">Grade</label>
              <input
                type="text"
                id="grade"
                value={newThreshold.grade}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, grade: e.target.value })
                }
                placeholder="A, B+, etc"
                maxLength="3"
              />
              {errors.grade && (
                <span className="examination-gradeconfiguration-gradeconfiguration-error-text">{errors.grade}</span>
              )}
            </div>

            <div className="examination-gradeconfiguration-gradeconfiguration-form-group">
              <label htmlFor="gpa">
                <Hash size={14} />
                GPA
              </label>
              <input
                type="number"
                id="gpa"
                value={newThreshold.gpa}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, gpa: e.target.value })
                }
                min="0"
                max="4.0"
                step="0.1"
                placeholder="4.0"
              />
              {errors.gpa && <span className="examination-gradeconfiguration-gradeconfiguration-error-text">{errors.gpa}</span>}
            </div>
          </div>

          <div className="examination-gradeconfiguration-gradeconfiguration-form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              value={newThreshold.description}
              onChange={(e) =>
                setNewThreshold({
                  ...newThreshold,
                  description: e.target.value,
                })
              }
              placeholder="Outstanding, Excellent, etc"
            />
            {errors.description && (
              <span className="examination-gradeconfiguration-gradeconfiguration-error-text">{errors.description}</span>
            )}
          </div>

          {errors.range && <div className="examination-gradeconfiguration-gradeconfiguration-error-alert">{errors.range}</div>}

          <button className="btn btn-primary" onClick={handleAddThreshold}>
            <Plus size={16} />
            Add Threshold
          </button>
        </div>

        <div className="thresholds-list">
          {scale.thresholds.length === 0 ? (
            <div className="examination-gradeconfiguration-gradeconfiguration-empty-state">
              <p>
                No grade thresholds configured. Add your first threshold above.
              </p>
            </div>
          ) : (
            <table className="examination-gradeconfiguration-gradeconfiguration-thresholds-table">
              <thead>
                <tr>
                  <th>Min %</th>
                  <th>Max %</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scale.thresholds.map((threshold, index) => (
                  <tr key={index}>
                    {editingIndex === index ? (
                      <>
                        <td>
                          <input
                            type="number"
                            value={threshold.min}
                            onChange={(e) => {
                              const updated = {
                                ...threshold,
                                min: e.target.value,
                              };
                              handleUpdateThreshold(index, updated);
                            }}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={threshold.max}
                            onChange={(e) => {
                              const updated = {
                                ...threshold,
                                max: e.target.value,
                              };
                              handleUpdateThreshold(index, updated);
                            }}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={threshold.grade}
                            onChange={(e) => {
                              const updated = {
                                ...threshold,
                                grade: e.target.value,
                              };
                              handleUpdateThreshold(index, updated);
                            }}
                            maxLength="3"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={threshold.gpa}
                            onChange={(e) => {
                              const updated = {
                                ...threshold,
                                gpa: e.target.value,
                              };
                              handleUpdateThreshold(index, updated);
                            }}
                            min="0"
                            max="4.0"
                            step="0.1"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={threshold.description}
                            onChange={(e) => {
                              const updated = {
                                ...threshold,
                                description: e.target.value,
                              };
                              handleUpdateThreshold(index, updated);
                            }}
                          />
                        </td>
                        <td>
                          <button
                            className="examination-gradeconfiguration-gradeconfiguration-btn-icon"
                            onClick={() => setEditingIndex(null)}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{threshold.min}</td>
                        <td>{threshold.max}</td>
                        <td>
                          <span className="examination-gradeconfiguration-gradeconfiguration-grade-badge">{threshold.grade}</span>
                        </td>
                        <td>{threshold.gpa.toFixed(1)}</td>
                        <td>{threshold.description}</td>
                        <td>
                          <div className="examination-gradeconfiguration-gradeconfiguration-action-buttons">
                            <button
                              className="examination-gradeconfiguration-gradeconfiguration-btn-icon"
                              onClick={() => setEditingIndex(index)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="examination-gradeconfiguration-gradeconfiguration-btn-icon btn-danger"
                              onClick={() => handleDeleteThreshold(index)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="examination-gradeconfiguration-gradeconfiguration-configuration-actions">
        <button className="btn examination-gradeconfiguration-gradeconfiguration-btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default GradeConfiguration;
