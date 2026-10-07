import React, { useState, useEffect, useCallback } from "react";
import examinationApi from "../api/examination.api";
import { getExamStatus } from "../utils/examHelpers";
import { exportMarksToCSV } from "../utils/exportUtils";
import api from "@/api/axios";
import "./ExamSetupPage.css";

export const ExamSetupPage = () => {
  const [exams, setExams] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    examTypeId: "",
    classId: "",
    academicSessionId: "",
    term: "TERM_1",
    startDate: "",
    endDate: "",
    description: "",
    selectedSubjects: [],
  });

  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeWeightage, setNewTypeWeightage] = useState("");
  const [typeFormError, setTypeFormError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [examsRes, typesRes, classesRes, subjectsRes, sessionsRes] =
        await Promise.allSettled([
          examinationApi.getExams(),
          examinationApi.getExamTypes(),
          api.get("/classes"),
          api.get("/subjects"),
          api.get("/academic-sessions"),
        ]);

      if (examsRes.status === "fulfilled")
        setExams(Array.isArray(examsRes.value) ? examsRes.value : []);
      if (typesRes.status === "fulfilled")
        setExamTypes(Array.isArray(typesRes.value) ? typesRes.value : []);
      if (classesRes.status === "fulfilled") {
        const cls = classesRes.value.data?.data || classesRes.value.data || [];
        setClassList(Array.isArray(cls) ? cls : []);
      }
      if (subjectsRes.status === "fulfilled") {
        const subs =
          subjectsRes.value.data?.data || subjectsRes.value.data || [];
        setSubjectList(Array.isArray(subs) ? subs : []);
      }
      if (sessionsRes.status === "fulfilled") {
        const sessions =
          sessionsRes.value.data?.data || sessionsRes.value.data || [];
        setAcademicSessions(Array.isArray(sessions) ? sessions : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    const activeSession =
      academicSessions.find((s) => s.isCurrent || s.status === "ACTIVE") ||
      academicSessions[0];
    // Default select all existing subjects so none are omitted
    const allSubIds = subjectList.map((s) => s.id);

    setFormData({
      name: "",
      examTypeId: examTypes[0]?.id ? String(examTypes[0].id) : "",
      classId: classList[0]?.id ? String(classList[0].id) : "",
      academicSessionId: activeSession?.id ? String(activeSession.id) : "",
      term: "TERM_1",
      startDate: "",
      endDate: "",
      description: "",
      selectedSubjects: allSubIds,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCreateExamType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    if (newTypeWeightage === "" || isNaN(Number(newTypeWeightage))) {
      setTypeFormError("Weightage must be a number (e.g. 20 for 20%)");
      return;
    }
    setTypeFormError("");

    try {
      const created = await examinationApi.createExamType({
        name: newTypeName.trim(),
        weightage: Number(newTypeWeightage),
      });

      const newTypeObj = created?.data || created;
      if (newTypeObj?.id) {
        setExamTypes((prev) => [...prev, newTypeObj]);
      } else {
        await fetchData();
      }
      setNewTypeName("");
      setNewTypeWeightage("");
    } catch (err) {
      const msg = err.response?.data?.message;
      setTypeFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to create exam type.",
      );
    }
  };

  const handleDeleteExamType = async (id) => {
    try {
      await examinationApi.deleteExamType(id);
      setExamTypes((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert(
        "Cannot delete exam type: it is already linked to scheduled examinations.",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Exam name is required.");
      return;
    }
    if (!formData.examTypeId) {
      setFormError("Please select an Examination Type.");
      return;
    }
    if (!formData.classId) {
      setFormError("Please select a target Class / Grade.");
      return;
    }
    if (!formData.academicSessionId) {
      setFormError("Please select an Academic Session.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    const chosenSession = academicSessions.find(
      (s) => Number(s.id) === Number(formData.academicSessionId),
    );
    const resolvedSessionName =
      chosenSession?.name || chosenSession?.year || "2026-2027";

    setSubmitting(true);
    try {
      const created = await examinationApi.createExam({
        name: formData.name,
        examTypeId: Number(formData.examTypeId),
        classId: Number(formData.classId),
        academicSessionId: Number(formData.academicSessionId),
        academicYear: resolvedSessionName,
        term: formData.term || "TERM_1",
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        isPublished: true,
        subjectIds:
          formData.selectedSubjects.length > 0
            ? formData.selectedSubjects
            : subjectList.map((s) => s.id),
      });

      const newExamObj = created?.data || created;
      if (newExamObj?.id) {
        setExams((prev) => [newExamObj, ...prev]);
      }

      setIsModalOpen(false);
      setPageMessage({
        type: "success",
        text: "Examination scheduled successfully.",
      });
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to create examination.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getClassName = (cid) => {
    const found = classList.find((c) => Number(c.id) === Number(cid));
    return found?.name || `Class #${cid}`;
  };

  const handleExportSchedule = () => {
    const headers = [
      "Exam Name",
      "Target Class",
      "Exam Type",
      "Start Date",
      "End Date",
      "Status",
    ];
    const rows = exams.map((ex) => [
      ex.name,
      getClassName(ex.classId || ex.class?.id),
      ex.examType?.name || ex.type || "Standard",
      ex.startDate ? new Date(ex.startDate).toLocaleDateString() : "",
      ex.endDate ? new Date(ex.endDate).toLocaleDateString() : "",
      getExamStatus(ex.startDate, ex.endDate),
    ]);
    exportMarksToCSV("Examination_Schedules", headers, rows);
  };

  return (
    <div className="exam-setup-container">
      <div className="exam-setup-header">
        <h1>Examination Setup & Scheduling</h1>
        <p>Define examination cycles, target classes, and testing calendars.</p>
      </div>

      <div className="exam-setup-content">
        {pageMessage.text && (
          <div
            className={
              pageMessage.type === "success"
                ? "exam-banner-success"
                : "exam-banner-error"
            }
          >
            {pageMessage.text}
          </div>
        )}

        <div className="exam-setup-card">
          <div className="exam-card-title-row">
            <span>Scheduled Examinations ({exams.length})</span>
            <div style={{ display: "flex", gap: "10px" }}>
              {exams.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportSchedule}
                  className="exam-btn-secondary"
                >
                  📥 Export Roster
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTypesModalOpen(true)}
                className="exam-btn-secondary"
              >
                ⚙️ Manage Exam Types ({examTypes.length})
              </button>
              <button
                type="button"
                onClick={handleOpenModal}
                className="exam-btn-primary"
              >
                + Create Examination
              </button>
            </div>
          </div>

          {loading ? (
            <div className="exam-empty-state">Loading examinations...</div>
          ) : exams.length === 0 ? (
            <div className="exam-empty-state">
              No examinations configured yet. Click "+ Create Examination" to
              define a test cycle.
            </div>
          ) : (
            <table className="exam-setup-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Target Class</th>
                  <th>Type</th>
                  <th>Timeline</th>
                  <th>Calendar Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => {
                  const timelineStatus = getExamStatus(
                    ex.startDate,
                    ex.endDate,
                  );

                  return (
                    <tr key={ex.id}>
                      <td>
                        <strong>{ex.name}</strong>
                        {ex.description && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {ex.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="exam-term-badge">
                          {getClassName(ex.classId || ex.class?.id)}
                        </span>
                      </td>
                      <td>
                        <strong>
                          {ex.examType?.name || ex.type || "Standard"}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>
                          {ex.startDate
                            ? new Date(ex.startDate).toLocaleDateString()
                            : "—"}{" "}
                          →{" "}
                          {ex.endDate
                            ? new Date(ex.endDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`exam-timeline-pill pill-${timelineStatus.toLowerCase()}`}
                        >
                          {timelineStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Exam Modal */}
      {isModalOpen && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <h3>Schedule Examination</h3>
            {formError && <div className="exam-banner-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="exam-form-group">
                <label>Examination Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026/2027"
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
                <div className="exam-form-group">
                  <label>Exam Type *</label>
                  <select
                    required
                    value={formData.examTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, examTypeId: e.target.value })
                    }
                  >
                    <option value="">-- Select Exam Type --</option>
                    {examTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.weightage ?? 0}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="exam-form-group">
                  <label>Target Class / Grade *</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                  >
                    <option value="">-- Select Class --</option>
                    {classList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `Class #${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="exam-form-group">
                  <label>Term / Semester *</label>
                  <select
                    required
                    value={formData.term}
                    onChange={(e) =>
                      setFormData({ ...formData, term: e.target.value })
                    }
                  >
                    <option value="TERM_1">Term 1 (Semester 1)</option>
                    <option value="TERM_2">Term 2 (Semester 2)</option>
                    <option value="TERM_3">Term 3</option>
                  </select>
                </div>

                <div className="exam-form-group">
                  <label>Academic Session *</label>
                  <select
                    required
                    value={formData.academicSessionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicSessionId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Session --</option>
                    {academicSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.year || `Session #${s.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="exam-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="exam-form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="exam-form-group">
                <label>Description / Notes</label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="exam-modal-actions">
                <button
                  type="button"
                  className="exam-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="exam-btn-primary"
                >
                  {submitting ? "Saving..." : "Save Examination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Types Management Modal - Strictly shows Exam Types only */}
      {isTypesModalOpen && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card" style={{ maxWidth: "540px" }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Manage Examination Types
            </h3>

            {typeFormError && (
              <div
                className="exam-banner-error"
                style={{ marginBottom: "16px" }}
              >
                {typeFormError}
              </div>
            )}

            <form
              onSubmit={handleCreateExamType}
              style={{ marginBottom: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr auto",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    Type Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid Exam, Quiz"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    Weightage (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g. 20"
                    value={newTypeWeightage}
                    onChange={(e) => setNewTypeWeightage(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="exam-btn-primary"
                  style={{
                    padding: "9px 16px",
                    fontSize: "13.5px",
                    height: "38px",
                  }}
                >
                  + Add Type
                </button>
              </div>
            </form>

            <div
              style={{
                maxHeight: "240px",
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
            >
              <table className="exam-setup-table">
                <thead>
                  <tr>
                    <th>Type Name</th>
                    <th>Weightage</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {examTypes.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          padding: "16px",
                        }}
                      >
                        No examination types added yet.
                      </td>
                    </tr>
                  ) : (
                    examTypes.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.name}</strong>
                        </td>
                        <td>
                          <span className="exam-term-badge">
                            {t.weightage ?? 0}%
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteExamType(t.id)}
                            className="exam-btn-delete"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="exam-modal-actions" style={{ marginTop: "18px" }}>
              <button
                type="button"
                className="exam-btn-cancel"
                onClick={() => {
                  setTypeFormError("");
                  setIsTypesModalOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSetupPage;
