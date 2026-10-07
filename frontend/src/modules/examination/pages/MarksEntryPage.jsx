import React, { useState, useEffect, useMemo, useCallback } from "react";
import examinationApi from "../api/examination.api";
import { processSubjectResults } from "../utils/resultProcessors";
import { exportMarksToCSV } from "../utils/exportUtils";
import { getStudentName, getExamStatus } from "../utils/examHelpers";
import api from "@/api/axios";
import "./MarksEntryPage.css";

export const MarksEntryPage = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [marksState, setMarksState] = useState({});
  const [remarksState, setRemarksState] = useState({});
  const [editableRows, setEditableRows] = useState({}); // { [studentId]: boolean }
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    Promise.allSettled([
      examinationApi.getExams(),
      api.get("/classes"),
      api.get("/subjects"),
      api.get("/students"),
    ]).then(([exRes, clsRes, subRes, stuRes]) => {
      if (exRes.status === "fulfilled")
        setExams(Array.isArray(exRes.value) ? exRes.value : []);
      if (clsRes.status === "fulfilled") {
        const d = clsRes.value.data?.data || clsRes.value.data || [];
        setClasses(Array.isArray(d) ? d : []);
      }
      if (subRes.status === "fulfilled") {
        const d = subRes.value.data?.data || subRes.value.data || [];
        setAllSubjects(Array.isArray(d) ? d : []);
      }
      if (stuRes.status === "fulfilled") {
        const d = stuRes.value.data?.data || stuRes.value.data || [];
        setStudents(Array.isArray(d) ? d : []);
      }
    });
  }, []);

  const evaluableExams = useMemo(() => {
    return exams.filter((ex) => {
      const status = getExamStatus(ex.startDate, ex.endDate);
      return status === "ONGOING" || status === "COMPLETED";
    });
  }, [exams]);

  const selectedExamObj = useMemo(() => {
    if (!selectedExamId) return null;
    return exams.find((e) => Number(e.id) === Number(selectedExamId));
  }, [exams, selectedExamId]);

  useEffect(() => {
    if (selectedExamObj?.classId) {
      setSelectedClassId(String(selectedExamObj.classId));
    }
  }, [selectedExamObj]);

  const availableSubjects = useMemo(() => {
    if (!selectedExamObj) return allSubjects;

    const examSubs = selectedExamObj.subjects || selectedExamObj.examSubjects;
    if (Array.isArray(examSubs) && examSubs.length > 0) {
      const allowedSubjectIds = new Set(
        examSubs.map((s) => Number(s.subjectId || s.subject?.id || s.id)),
      );
      return allSubjects.filter((s) => allowedSubjectIds.has(Number(s.id)));
    }

    return allSubjects;
  }, [selectedExamObj, allSubjects]);

  const maxScore = useMemo(() => {
    if (!selectedExamObj) return 100;
    const weight = Number(
      selectedExamObj.examType?.weightage ||
        selectedExamObj.weightage ||
        selectedExamObj.totalMarks,
    );
    return weight > 0 ? weight : 100;
  }, [selectedExamObj]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const targetCid = Number(selectedClassId);
    return students.filter((s) => {
      const cid = Number(
        s.classId || s.currentClassId || s.class?.id || s.enrollment?.classId,
      );
      return cid === targetCid;
    });
  }, [students, selectedClassId]);

  const loadExistingMarks = useCallback(async () => {
    if (!selectedExamId || !selectedSubjectId || classStudents.length === 0) {
      return;
    }

    setLoadingSheet(true);
    setFeedback({ type: "", text: "" });

    try {
      const records = await examinationApi.getMarks({
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        studentIds: classStudents.map((s) => s.id),
      });

      const mState = {};
      const rState = {};
      const editState = {};

      records.forEach((r) => {
        const sid = Number(r.studentId || r.student?.id);
        if (sid) {
          const rawScore =
            r.theoryMarks !== undefined && r.theoryMarks !== null
              ? r.theoryMarks
              : (r.totalMarks ?? r.marksObtained ?? r.marks ?? r.score);

          mState[sid] =
            rawScore !== undefined && rawScore !== null
              ? String(Number(rawScore))
              : "";
          rState[sid] = r.remarks || "";
          editState[sid] = false; // Existing saved marks default to LOCKED
        }
      });

      // Students who have NO mark yet remain editable by default
      classStudents.forEach((st) => {
        if (mState[st.id] === undefined || mState[st.id] === "") {
          editState[st.id] = true;
        }
      });

      setMarksState(mState);
      setRemarksState(rState);
      setEditableRows(editState);
    } catch {
      // Retain state
    } finally {
      setLoadingSheet(false);
    }
  }, [selectedExamId, selectedSubjectId, classStudents]);

  useEffect(() => {
    loadExistingMarks();
  }, [loadExistingMarks]);

  const currentSummary = useMemo(() => {
    const list = classStudents.map((s) => ({
      studentId: s.id,
      marksObtained:
        marksState[s.id] !== "" && marksState[s.id] !== undefined
          ? Number(marksState[s.id])
          : null,
    }));
    return processSubjectResults(list, maxScore);
  }, [classStudents, marksState, maxScore]);

  const handleScoreChange = (sid, val) => {
    const num = Number(val);
    if (val !== "" && (num < 0 || num > maxScore)) return;
    setMarksState((prev) => ({ ...prev, [sid]: val }));
  };

  const handleRemarkChange = (sid, val) => {
    setRemarksState((prev) => ({ ...prev, [sid]: val }));
  };

  const toggleRowEdit = (sid) => {
    setEditableRows((prev) => ({ ...prev, [sid]: !prev[sid] }));
  };

  const toggleAllEdit = () => {
    const anyLocked = classStudents.some((st) => !editableRows[st.id]);
    const newState = {};
    classStudents.forEach((st) => {
      newState[st.id] = anyLocked;
    });
    setEditableRows(newState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    const entries = classStudents
      .filter((s) => marksState[s.id] !== undefined && marksState[s.id] !== "")
      .map((s) => ({
        studentId: Number(s.id),
        val: Number(marksState[s.id]),
        remarks: remarksState[s.id] || "",
      }));

    if (entries.length === 0) {
      setFeedback({
        type: "error",
        text: "Please enter marks for at least one student.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await examinationApi.submitBatchMarks({
        examId: Number(selectedExamId),
        subjectId: Number(selectedSubjectId),
        marks: entries,
      });

      setFeedback({
        type: "success",
        text: "Marks successfully submitted and saved!",
      });

      // Lock rows back to read-only mode upon successful save
      const lockedState = {};
      classStudents.forEach((st) => {
        lockedState[st.id] = false;
      });
      setEditableRows(lockedState);
    } catch (err) {
      const msg = err.response?.data?.message;
      setFeedback({
        type: "error",
        text: Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to submit marks.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Roll #",
      "Student Name",
      `Score (/${maxScore})`,
      "Percentage",
      "Remarks",
    ];
    const rows = classStudents.map((st) => {
      const score = marksState[st.id] || "";
      const pct =
        score !== ""
          ? `${((Number(score) / maxScore) * 100).toFixed(1)}%`
          : "N/A";
      return [
        `#${st.rollNumber || st.id}`,
        getStudentName(st),
        score,
        pct,
        remarksState[st.id] || "",
      ];
    });

    const filename = `${selectedExamObj?.name || "Exam"}_Marksheet`;
    exportMarksToCSV(filename, headers, rows);
  };

  return (
    <div className="marks-entry-container">
      <div className="marks-entry-header">
        <h1>Examination Marks Entry</h1>
        <p>
          Record exam marks configured by evaluation weight. Only active or
          completed exams can be evaluated.
        </p>
      </div>

      <div className="marks-entry-content">
        {feedback.text && (
          <div
            className={
              feedback.type === "success"
                ? "marks-banner-success"
                : "marks-banner-error"
            }
          >
            {feedback.text}
          </div>
        )}

        <div className="marks-entry-card">
          <div className="marks-filter-row">
            <div className="marks-field">
              <label>Examination *</label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setSelectedSubjectId("");
                }}
              >
                <option value="">
                  -- Select Active Exam ({evaluableExams.length} Available) --
                </option>
                {evaluableExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.examType?.name || "Exam"} • Max:{" "}
                    {ex.examType?.weightage || ex.weightage || 100} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="marks-field">
              <label>Class / Grade *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `Class #${cls.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="marks-field">
              <label>Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">
                  -- Select Subject ({availableSubjects.length} Available) --
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || "SUB"})
                  </option>
                ))}
              </select>
            </div>

            <div className="marks-field">
              <label>Assessment Weight</label>
              <div
                style={{
                  padding: "9px 12px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Out of {maxScore} Points
              </div>
            </div>
          </div>
        </div>

        {selectedExamId && selectedSubjectId && classStudents.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Evaluated
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {currentSummary.evaluatedStudents} /{" "}
                {currentSummary.totalStudents}
              </div>
            </div>
            <div
              style={{
                background: "#ffffff",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Average Score
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#047857",
                }}
              >
                {currentSummary.averageScore} / {maxScore}
              </div>
            </div>
            <div
              style={{
                background: "#ffffff",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Highest Score
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0284c7",
                }}
              >
                {currentSummary.highestScore}
              </div>
            </div>
            <div
              style={{
                background: "#ffffff",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Pass Rate
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {currentSummary.passPercentage}%
              </div>
            </div>
          </div>
        )}

        <div className="marks-entry-card">
          <div className="marks-card-title-bar">
            <span>Score Sheet ({classStudents.length} Students)</span>
            <div style={{ display: "flex", gap: "10px" }}>
              {classStudents.length > 0 && selectedSubjectId && (
                <>
                  <button
                    type="button"
                    onClick={toggleAllEdit}
                    className="exam-btn-secondary"
                  >
                    {classStudents.some((st) => !editableRows[st.id])
                      ? "Edit All"
                      : "Lock All"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="exam-btn-secondary"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || loadingSheet}
                    className="marks-btn-submit"
                  >
                    {submitting ? "Saving..." : "Save Marks"}
                  </button>
                </>
              )}
            </div>
          </div>

          {!selectedExamId || !selectedClassId || !selectedSubjectId ? (
            <div className="marks-empty-state">
              Select an Examination, Class, and Subject above to populate the
              student score sheet.
            </div>
          ) : loadingSheet ? (
            <div className="marks-empty-state">
              Loading student evaluations...
            </div>
          ) : classStudents.length === 0 ? (
            <div className="marks-empty-state">
              No students found enrolled in the selected class.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <table className="marks-entry-table">
                <thead>
                  <tr>
                    <th>Roll #</th>
                    <th>Student Name</th>
                    <th>Marks Obtained (Max: {maxScore})</th>
                    <th>Weight Contribution</th>
                    <th>Remarks</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((st) => {
                    const currentScore = marksState[st.id] || "";
                    const percentage =
                      currentScore !== ""
                        ? ((Number(currentScore) / maxScore) * 100).toFixed(1)
                        : null;
                    const isEditing = Boolean(editableRows[st.id]);

                    return (
                      <tr
                        key={st.id}
                        className={isEditing ? "row-editing" : "row-locked"}
                      >
                        <td>
                          <strong>#{st.rollNumber || st.id}</strong>
                        </td>
                        <td>
                          <strong>{getStudentName(st)}</strong>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max={maxScore}
                              step="0.5"
                              placeholder={`0 - ${maxScore}`}
                              className="marks-input-cell active-input"
                              value={currentScore}
                              onChange={(e) =>
                                handleScoreChange(st.id, e.target.value)
                              }
                            />
                          ) : (
                            <span className="marks-readonly-score">
                              {currentScore !== "" ? currentScore : "—"}
                            </span>
                          )}
                        </td>
                        <td>
                          {percentage !== null ? (
                            <span
                              style={{ fontWeight: "600", color: "#047857" }}
                            >
                              {currentScore} / {maxScore} ({percentage}%)
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>
                              Not Entered
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              placeholder="Optional evaluation comment"
                              className="marks-input-cell"
                              style={{ maxWidth: "260px" }}
                              value={remarksState[st.id] || ""}
                              onChange={(e) =>
                                handleRemarkChange(st.id, e.target.value)
                              }
                            />
                          ) : (
                            <span className="marks-readonly-remark">
                              {remarksState[st.id] || (
                                <span style={{ color: "#94a3b8" }}>—</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => toggleRowEdit(st.id)}
                            className={
                              isEditing
                                ? "marks-row-action-btn btn-done"
                                : "marks-row-action-btn btn-edit"
                            }
                          >
                            {isEditing ? "Done" : "Edit"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="marks-footer-actions">
                <button
                  type="submit"
                  disabled={submitting}
                  className="marks-btn-submit"
                >
                  {submitting ? "Saving..." : "Save Marks"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarksEntryPage;
