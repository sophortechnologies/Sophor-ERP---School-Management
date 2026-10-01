// src/modules/examination/pages/GradeConfigurationPage.jsx
import React, { useState, useEffect } from "react";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  CheckCircle,
  Hash,
  Percent,
} from "lucide-react";
import { examinationApi } from "../api/examination.api";
import "./GradeConfigurationPage.css";

const GradeConfigurationPage = () => {
  const [gradeScales, setGradeScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [formData, setFormData] = useState({
    grade: "",
    minPercent: "",
    maxPercent: "",
    gradePoint: "",
    description: "",
  });

  useEffect(() => {
    loadGradeScales();
  }, []);

  const loadGradeScales = async () => {
    try {
      setLoading(true);
      const response = await examinationApi.getGradeScales();
      const scales = response?.data || response || [];
      setGradeScales(scales);
    } catch (error) {
      console.error("Error loading grade scales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        grade: formData.grade,
        minPercent: parseFloat(formData.minPercent),
        maxPercent: parseFloat(formData.maxPercent),
        gradePoint: parseFloat(formData.gradePoint),
        description: formData.description,
      };

      if (editingScale) {
        await examinationApi.updateGradeScale(editingScale.id, payload);
      } else {
        await examinationApi.createGradeScale(payload);
      }
      await loadGradeScales();
      setShowForm(false);
      setEditingScale(null);
      setFormData({
        grade: "",
        minPercent: "",
        maxPercent: "",
        gradePoint: "",
        description: "",
      });
    } catch (error) {
      console.error("Error saving grade scale:", error);
      alert("Failed to save grade scale");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade scale?")) {
      try {
        await examinationApi.deleteGradeScale(id);
        await loadGradeScales();
      } catch (error) {
        console.error("Error deleting grade scale:", error);
        alert("Failed to delete grade scale");
      }
    }
  };

  const handleInitialize = async () => {
    if (
      window.confirm(
        "Initialize default grade scales? This will set up standard grading thresholds.",
      )
    ) {
      try {
        await examinationApi.initializeGradeScales();
        await loadGradeScales();
        alert("Grade scales initialized successfully!");
      } catch (error) {
        console.error("Error initializing grade scales:", error);
        alert("Failed to initialize grade scales");
      }
    }
  };

  const stats = {
    totalScales: gradeScales.length,
    highestPoints:
      gradeScales.length > 0
        ? Math.max(
            ...gradeScales.map((s) => Number(s.gradePoint || 0)),
          ).toFixed(1)
        : 0,
    passingThreshold:
      gradeScales.length > 0
        ? Math.min(
            ...gradeScales
              .filter((s) => s.grade !== "F")
              .map((s) => Number(s.minPercent || 0)),
          )
        : 0,
  };

  if (loading && gradeScales.length === 0) {
    return (
      <div className="marks-page-loading">
        <div className="marks-page-spinner"></div>
        <p>Loading grade configurations...</p>
      </div>
    );
  }

  return (
    <div className="marks-entry-container-page">
      {/* Header Banner */}
      <div className="marks-page-header-banner">
        <div className="marks-header-inner-content">
          <div>
            <h1>
              <Award size={24} />
              Grade Configuration
            </h1>
            <p>Define and manage grading scales for automatic calculation</p>
          </div>
          <div className="marks-header-actions-group">
            <button className="marks-btn-secondary" onClick={handleInitialize}>
              <RefreshCw size={18} />
              Initialize Default Scales
            </button>
            <button
              className="marks-btn-primary btn-primary"
              onClick={() => {
                setEditingScale(null);
                setFormData({
                  grade: "",
                  minPercent: "",
                  maxPercent: "",
                  gradePoint: "",
                  description: "",
                });
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Add Grade Scale
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="marks-stats-grid-cards">
        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#dbeafe" }}
          >
            <Award size={24} color="#3b82f6" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Total Grades</p>
            <p className="marks-stat-number-val">{stats.totalScales}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#dcfce7" }}
          >
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Max Grade Point</p>
            <p className="marks-stat-number-val">{stats.highestPoints}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#fef3c7" }}
          >
            <Percent size={24} color="#f59e0b" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Min Passing %</p>
            <p className="marks-stat-number-val">{stats.passingThreshold}%</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="marks-main-table-card">
        <div className="marks-card-header-area">
          <h2>
            <Award size={20} />
            Configured Grade Scales
            <span className="marks-badge-counter">
              {gradeScales.length} scales
            </span>
          </h2>
        </div>

        {gradeScales.length === 0 ? (
          <div className="marks-empty-state-box">
            <Award size={48} />
            <h3>No Grade Scales Configured</h3>
            <p>
              Click "Initialize Default Scales" or "Add Grade Scale" to get
              started.
            </p>
          </div>
        ) : (
          <div className="marks-table-scroll-wrapper">
            <table className="marks-data-table-grid">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Min %</th>
                  <th>Max %</th>
                  <th>Grade Point</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gradeScales.map((scale) => (
                  <tr key={scale.id}>
                    <td>
                      <span
                        className="marks-sub-badge"
                        style={{
                          backgroundColor: getGradeColor(scale.grade),
                          color: "#fff",
                        }}
                      >
                        {scale.grade}
                      </span>
                    </td>
                    <td>{scale.minPercent}%</td>
                    <td>{scale.maxPercent}%</td>
                    <td className="marks-mono-text">
                      <strong>{scale.gradePoint}</strong>
                    </td>
                    <td style={{ color: "#64748b" }}>
                      {scale.description || "—"}
                    </td>
                    <td>
                      <div className="marks-row-actions">
                        <button
                          className="marks-icon-action-btn"
                          onClick={() => {
                            setEditingScale(scale);
                            setFormData({
                              grade: scale.grade,
                              minPercent: scale.minPercent,
                              maxPercent: scale.maxPercent,
                              gradePoint: scale.gradePoint,
                              description: scale.description || "",
                            });
                            setShowForm(true);
                          }}
                          title="Edit Scale"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="marks-icon-action-btn"
                          style={{ color: "#ef4444", borderColor: "#fecaca" }}
                          onClick={() => handleDelete(scale.id)}
                          title="Delete Scale"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade Scale Modal Form */}
      {showForm && (
        <div className="marks-modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="marks-modal-box-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="marks-modal-head">
              <h3>{editingScale ? "Edit Grade Scale" : "Add Grade Scale"}</h3>
              <button
                className="marks-close-icon-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="marks-modal-form-body">
              <div className="marks-form-group">
                <label className="marks-lbl-title">Grade Label *</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  required
                  placeholder="e.g., A+, A, B+"
                  className="marks-dropdown-select"
                />
              </div>

              <div className="marks-filter-row-grid" style={{ gap: "1rem" }}>
                <div className="marks-form-control-group">
                  <label className="marks-lbl-title">
                    Min Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, minPercent: e.target.value })
                    }
                    required
                    className="marks-dropdown-select"
                  />
                </div>
                <div className="marks-form-control-group">
                  <label className="marks-lbl-title">
                    Max Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPercent: e.target.value })
                    }
                    required
                    className="marks-dropdown-select"
                  />
                </div>
              </div>

              <div className="marks-form-group" style={{ marginTop: "1rem" }}>
                <label className="marks-lbl-title">Grade Point *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gradePoint}
                  onChange={(e) =>
                    setFormData({ ...formData, gradePoint: e.target.value })
                  }
                  required
                  className="marks-dropdown-select"
                  placeholder="e.g., 4.0"
                />
              </div>

              <div className="marks-form-group" style={{ marginTop: "1rem" }}>
                <label className="marks-lbl-title">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., Outstanding, Excellent"
                  className="marks-dropdown-select"
                />
              </div>

              <div
                className="marks-modal-actions-footer"
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  className="marks-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="marks-btn-primary btn-primary">
                  {editingScale ? "Update Scale" : "Create Scale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getGradeColor = (grade) => {
  const colors = {
    "A+": "#10b981",
    A: "#10b981",
    "A-": "#10b981",
    "B+": "#3b82f6",
    B: "#3b82f6",
    "B-": "#3b82f6",
    "C+": "#f59e0b",
    C: "#f59e0b",
    "C-": "#f59e0b",
    D: "#ef4444",
    F: "#dc2626",
  };
  return colors[grade] || "#6b7280";
};

export default GradeConfigurationPage;
