import React, { useState, useEffect, useMemo } from "react";
import { gradingApi } from "../api/grading.api";
import { useGradingMetadata } from "../hooks/useGrading";
import {
  ASSESSMENT_TYPES,
  TERMS,
  calculateGrade,
} from "../constants/grading.constants";
import "./MarkEntryPage.css";

export const MarkEntryPage = () => {
  const {
    classes,
    subjects,
    students,
    sessions,
    loading: metaLoading,
  } = useGradingMetadata();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TERM_1");
  const [selectedAssessment, setSelectedAssessment] = useState("FINAL_EXAM");
  const [maxScore, setMaxScore] = useState(100);

  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const activeSessionName = useMemo(() => {
    const curr = sessions.find((s) => s.isCurrent || s.status === "ACTIVE");
    return curr?.name || "2026-2027";
  }, [sessions]);

  // Students belonging to the chosen class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => {
      const cid = Number(
        s.classId || s.currentClassId || s.class?.id || s.enrollment?.classId,
      );
      return cid === Number(selectedClassId);
    });
  }, [students, selectedClassId]);

  // Load existing marks on criteria change
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) {
      setScores({});
      setRemarks({});
      return;
    }

    setLoadingSheet(true);
    setFeedback({ type: "", text: "" });

    gradingApi
      .getMarks({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        term: selectedTerm,
        assessmentType: selectedAssessment,
        academicYear: activeSessionName,
      })
      .then((existingMarks) => {
        const scoreMap = {};
        const remarkMap = {};

        existingMarks.forEach((m) => {
          const sid = m.studentId || m.student?.id;
          if (sid) {
            scoreMap[sid] = m.score !== undefined ? String(m.score) : "";
            remarkMap[sid] = m.remarks || "";
          }
        });

        setScores(scoreMap);
        setRemarks(remarkMap);
      })
      .finally(() => setLoadingSheet(false));
  }, [
    selectedClassId,
    selectedSubjectId,
    selectedTerm,
    selectedAssessment,
    activeSessionName,
  ]);

  const handleScoreChange = (studentId, val) => {
    const num = Number(val);
    if (val !== "" && (num < 0 || num > maxScore)) return;
    setScores((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleRemarkChange = (studentId, val) => {
    setRemarks((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });
    setSubmitting(true);

    try {
      const markEntries = classStudents
        .filter((s) => scores[s.id] !== undefined && scores[s.id] !== "")
        .map((s) => ({
          studentId: Number(s.id),
          classId: Number(selectedClassId),
          subjectId: Number(selectedSubjectId),
          term: selectedTerm,
          assessmentType: selectedAssessment,
          academicYear: activeSessionName,
          score: Number(scores[s.id]),
          maxScore: Number(maxScore),
          grade: calculateGrade((Number(scores[s.id]) / maxScore) * 100).grade,
          remarks: remarks[s.id] || "",
        }));

      await gradingApi.saveBatchMarks({
        classId: Number(selectedClassId),
        subjectId: Number(selectedSubjectId),
        term: selectedTerm,
        assessmentType: selectedAssessment,
        academicYear: activeSessionName,
        marks: markEntries,
      });

      setFeedback({
        type: "success",
        text: "Marks recorded and saved successfully.",
      });
    } catch (err) {
      const msg = err.response?.data?.message;
      setFeedback({
        type: "error",
        text: Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to save marks.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentFullName = (s) =>
    s.fullName ||
    (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : null) ||
    s.user?.fullName ||
    `Student #${s.id}`;

  return (
    <div className="grading-page-container">
      <div className="grading-hero-header">
        <h1 className="grading-hero-title">Academic Mark Entry</h1>
        <p className="grading-hero-subtitle">
          Record student assessments, auto-compute GPAs, and submit semester
          grades.
        </p>
      </div>

      <div className="grading-body-content">
        {feedback.text && (
          <div
            className={
              feedback.type === "success"
                ? "grading-banner-success"
                : "grading-banner-error"
            }
          >
            {feedback.text}
          </div>
        )}

        {/* Filter Controls Card */}
        <div className="grading-card">
          <div className="grading-filter-grid">
            <div className="grading-form-group">
              <label className="grading-form-label">Grade / Class *</label>
              <select
                className="grading-form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || `Class #${c.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grading-form-group">
              <label className="grading-form-label">Subject *</label>
              <select
                className="grading-form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || "SUB"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grading-form-group">
              <label className="grading-form-label">Term / Semester *</label>
              <select
                className="grading-form-select"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grading-form-group">
              <label className="grading-form-label">Assessment Type *</label>
              <select
                className="grading-form-select"
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
              >
                {ASSESSMENT_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grading-form-group">
              <label className="grading-form-label">Max Score</label>
              <input
                type="number"
                min="1"
                className="grading-form-input"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 100)}
              />
            </div>
          </div>
        </div>

        {/* Grade Sheet Matrix Card */}
        <div className="grading-card">
          <div className="grading-card-header">
            <span className="grading-card-title">
              Grade Sheet{" "}
              {!metaLoading &&
                selectedClassId &&
                `(${classStudents.length} Students)`}
            </span>
            {classStudents.length > 0 && selectedSubjectId && (
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={submitting || loadingSheet}
                className="grading-btn-primary"
              >
                {submitting ? "Saving Marks..." : "Save All Marks"}
              </button>
            )}
          </div>

          {!selectedClassId || !selectedSubjectId ? (
            <div className="grading-empty-state">
              Select a Grade/Class and Subject above to generate the score
              sheet.
            </div>
          ) : loadingSheet ? (
            <div className="grading-empty-state">Loading student scores...</div>
          ) : classStudents.length === 0 ? (
            <div className="grading-empty-state">
              No students found enrolled in this class.
            </div>
          ) : (
            <form onSubmit={handleSaveAll}>
              <table className="grading-table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Roll #</th>
                    <th>Student Name</th>
                    <th style={{ width: "160px" }}>Score (/{maxScore})</th>
                    <th style={{ width: "120px" }}>Percentage</th>
                    <th style={{ width: "90px" }}>Grade</th>
                    <th style={{ width: "240px" }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((st) => {
                    const currentScore = scores[st.id] || "";
                    const percentage =
                      currentScore !== ""
                        ? ((Number(currentScore) / maxScore) * 100).toFixed(1)
                        : null;
                    const gradeInfo =
                      percentage !== null ? calculateGrade(percentage) : null;

                    return (
                      <tr key={st.id}>
                        <td>
                          <strong>#{st.rollNumber || st.id}</strong>
                        </td>
                        <td>
                          <strong>{getStudentFullName(st)}</strong>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={maxScore}
                            step="0.5"
                            placeholder="Score"
                            className="grading-sheet-input"
                            value={currentScore}
                            onChange={(e) =>
                              handleScoreChange(st.id, e.target.value)
                            }
                          />
                        </td>
                        <td>{percentage !== null ? `${percentage}%` : "—"}</td>
                        <td>
                          {gradeInfo ? (
                            <span
                              className={`grading-pill pill-${gradeInfo.grade.replace("+", "plus")}`}
                            >
                              {gradeInfo.grade}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Optional comment"
                            className="grading-sheet-input"
                            value={remarks[st.id] || ""}
                            onChange={(e) =>
                              handleRemarkChange(st.id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="grading-sheet-footer">
                <button
                  type="submit"
                  disabled={submitting}
                  className="grading-btn-primary"
                  style={{ minWidth: "160px" }}
                >
                  {submitting ? "Saving Marks..." : "Save All Marks"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkEntryPage;
