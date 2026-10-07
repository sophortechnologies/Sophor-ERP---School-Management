import React, { useState, useEffect, useMemo } from "react";
import examinationApi from "../api/examination.api";
import api from "@/api/axios";
import "./ReportCardPage.css";

export const ReportCardPage = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/classes"),
      api.get("/students"),
      examinationApi.getExams(),
    ]).then(([clsRes, stuRes, exRes]) => {
      if (clsRes.status === "fulfilled") {
        const d = clsRes.value.data?.data || clsRes.value.data || [];
        setClasses(Array.isArray(d) ? d : []);
      }
      if (stuRes.status === "fulfilled") {
        const d = stuRes.value.data?.data || stuRes.value.data || [];
        setStudents(Array.isArray(d) ? d : []);
      }
      if (exRes.status === "fulfilled") {
        setExams(Array.isArray(exRes.value) ? exRes.value : []);
      }
    });
  }, []);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    setError("");
    setLoading(true);
    setReportData(null);

    try {
      const res = await examinationApi.getStudentReportCard({
        studentId: selectedStudentId,
        examId: selectedExamId,
      });
      setReportData(res);
    } catch {
      setError("Failed to retrieve report card for the selected student.");
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentObj = students.find(
    (s) => Number(s.id) === Number(selectedStudentId),
  );
  const selectedClassObj = classes.find(
    (c) => Number(c.id) === Number(selectedClassId),
  );
  const selectedExamObj = exams.find(
    (e) => Number(e.id) === Number(selectedExamId),
  );

  const stats = useMemo(() => {
    const subjects = reportData?.subjects || reportData?.marks || [];
    if (subjects.length === 0) return { total: 0, average: 0, status: "—" };

    const total = subjects.reduce(
      (sum, s) => sum + Number(s.marksObtained || s.score || 0),
      0,
    );
    const avg = total / subjects.length;
    return {
      total: total.toFixed(1),
      average: avg.toFixed(1),
      status: avg >= 50 ? "PROMOTED" : "NEEDS IMPROVEMENT",
    };
  }, [reportData]);

  return (
    <div className="report-card-container">
      <div className="report-card-header no-print">
        <h1>Student Report Cards</h1>
        <p>
          Review comprehensive academic transcripts and print official report
          cards.
        </p>
      </div>

      <div className="report-card-content">
        <div className="report-filter-card no-print">
          <form onSubmit={handleGenerate} className="report-filter-grid">
            <div className="report-filter-field">
              <label>Class / Grade *</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedStudentId("");
                }}
              >
                <option value="">-- Select Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || `Class #${c.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-filter-field">
              <label>Student *</label>
              <select
                value={selectedStudentId}
                disabled={!selectedClassId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">
                  -- Select Student ({classStudents.length} available) --
                </option>
                {classStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName || st.firstName} (Roll #
                    {st.rollNumber || st.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="report-filter-field">
              <label>Exam (Optional)</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">-- All Active Evaluations --</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-filter-field">
              <button
                type="submit"
                disabled={loading}
                className="report-btn-generate"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </form>

          {error && <div className="report-error-banner">{error}</div>}
        </div>

        {/* Printable Official Sheet */}
        {reportData && (
          <div className="report-sheet-wrapper">
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => window.print()}
                className="report-btn-print"
              >
                Print Official Sheet
              </button>
            </div>

            <div className="report-document">
              <div className="report-doc-header">
                <h2>ACADEMIC PERFORMANCE REPORT</h2>
                <p>{selectedExamObj?.name || "Semester Assessment Report"}</p>
              </div>

              <div className="report-student-strip">
                <div>
                  <strong>Student:</strong>{" "}
                  {selectedStudentObj?.fullName ||
                    selectedStudentObj?.firstName ||
                    `ID #${selectedStudentId}`}
                </div>
                <div>
                  <strong>Roll #:</strong> #
                  {selectedStudentObj?.rollNumber || selectedStudentId}
                </div>
                <div>
                  <strong>Class:</strong>{" "}
                  {selectedClassObj?.name || `Class #${selectedClassId}`}
                </div>
                <div>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>

              <table className="report-doc-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Marks Obtained</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.subjects || reportData.marks || []).map(
                    (sub, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>
                            {sub.subjectName || sub.subject?.name || sub.name}
                          </strong>
                        </td>
                        <td>{sub.totalMarks || sub.maxScore || 100}</td>
                        <td>
                          <strong>{sub.marksObtained || sub.score}</strong>
                        </td>
                        <td>{sub.grade || "—"}</td>
                        <td>{sub.remarks || "Satisfactory"}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>

              <div className="report-doc-summary">
                <div>
                  <span>Total Marks:</span> <strong>{stats.total}</strong>
                </div>
                <div>
                  <span>Average:</span> <strong>{stats.average}%</strong>
                </div>
                <div>
                  <span>Overall Verdict:</span> <strong>{stats.status}</strong>
                </div>
              </div>

              <div className="report-doc-signatures">
                <div>
                  <div className="sig-line" />
                  <span>Class Teacher Signature</span>
                </div>
                <div>
                  <div className="sig-line" />
                  <span>Principal / Administrator</span>
                </div>
                <div>
                  <div className="sig-line" />
                  <span>Official School Seal</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCardPage;
