import React, { useState, useMemo } from "react";
import { gradingApi } from "../api/grading.api";
import { useGradingMetadata } from "../hooks/useGrading";
import { TERMS, calculateGrade } from "../constants/grading.constants";
import "./ReportCardsPage.css";

export const ReportCardsPage = () => {
  const { classes, students, sessions } = useGradingMetadata();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TERM_1");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeSessionName = useMemo(() => {
    const curr = sessions.find((s) => s.isCurrent || s.status === "ACTIVE");
    return curr?.name || "2026-2027";
  }, [sessions]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => {
      const cid = Number(
        s.classId || s.currentClassId || s.class?.id || s.enrollment?.classId,
      );
      return cid === Number(selectedClassId);
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
      const res = await gradingApi.getStudentReportCard({
        studentId: selectedStudentId,
        academicYear: activeSessionName,
        term: selectedTerm,
      });
      setReportData(res);
    } catch {
      setError("Could not retrieve report card data for this student.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedStudentObj = students.find(
    (s) => Number(s.id) === Number(selectedStudentId),
  );
  const selectedClassObj = classes.find(
    (c) => Number(c.id) === Number(selectedClassId),
  );

  // Compute GPA and statistics from report card lines
  const computedMetrics = useMemo(() => {
    if (!reportData?.subjects || reportData.subjects.length === 0) {
      return { totalScore: 0, average: 0, overallGpa: 0, passStatus: "—" };
    }

    let sum = 0;
    let gpaSum = 0;
    reportData.subjects.forEach((item) => {
      const sc = Number(item.score || 0);
      sum += sc;
      gpaSum += calculateGrade(sc).gpa;
    });

    const avg = sum / reportData.subjects.length;
    const gpa = gpaSum / reportData.subjects.length;

    return {
      totalScore: sum.toFixed(1),
      average: avg.toFixed(1),
      overallGpa: gpa.toFixed(2),
      passStatus: avg >= 50 ? "PROMOTED / PASS" : "FAILED",
    };
  }, [reportData]);

  return (
    <div className="report-card-page-container">
      <div className="report-hero-header no-print">
        <h1 className="report-hero-title">Terminal Report Cards</h1>
        <p className="report-hero-subtitle">
          Generate, verify, and print official student report sheets.
        </p>
      </div>

      <div className="report-body-content">
        {/* Filter Selection (Hidden on Print) */}
        <div className="report-card-box no-print">
          <form onSubmit={handleGenerate} className="report-filter-grid">
            <div className="report-form-group">
              <label className="report-form-label">Grade / Class *</label>
              <select
                className="report-form-select"
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

            <div className="report-form-group">
              <label className="report-form-label">Student *</label>
              <select
                className="report-form-select"
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

            <div className="report-form-group">
              <label className="report-form-label">Term *</label>
              <select
                className="report-form-select"
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

            <div
              className="report-form-group"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                type="submit"
                disabled={loading}
                className="report-btn-primary"
              >
                {loading ? "Generating..." : "Generate Card"}
              </button>
            </div>
          </form>

          {error && <div className="report-banner-error">{error}</div>}
        </div>

        {/* Official Printable Report Card Document */}
        {reportData && (
          <div className="printable-report-wrapper">
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
                onClick={handlePrint}
                className="report-btn-print"
              >
                🖨️ Print Report Card
              </button>
            </div>

            <div className="official-report-sheet">
              {/* Institution Header */}
              <div className="official-school-header">
                <h2>SOPHOR ENTERPRISE SCHOOL</h2>
                <p>Office of Academic Affairs • Student Performance Report</p>
                <div className="official-term-badge">
                  {TERMS.find((t) => t.value === selectedTerm)?.label} •
                  Academic Year {activeSessionName}
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="student-info-strip">
                <div>
                  <strong>Student Name: </strong>
                  {selectedStudentObj?.fullName ||
                    selectedStudentObj?.firstName ||
                    `ID #${selectedStudentId}`}
                </div>
                <div>
                  <strong>Roll Number: </strong>#
                  {selectedStudentObj?.rollNumber || selectedStudentId}
                </div>
                <div>
                  <strong>Class / Grade: </strong>
                  {selectedClassObj?.name || `Grade #${selectedClassId}`}
                </div>
                <div>
                  <strong>Issue Date: </strong>
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Marks Table */}
              <table className="official-marks-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Marks Obtained</th>
                    <th>Grade</th>
                    <th>GPA</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.subjects || []).map((sub, idx) => {
                    const gradeDetail = calculateGrade(sub.score);
                    return (
                      <tr key={idx}>
                        <td>
                          <strong>{sub.subjectName || sub.name}</strong>
                        </td>
                        <td>{sub.maxScore || 100}</td>
                        <td>
                          <strong>{sub.score}</strong>
                        </td>
                        <td>{gradeDetail.grade}</td>
                        <td>{gradeDetail.gpa.toFixed(1)}</td>
                        <td>{sub.remarks || gradeDetail.remark}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Cumulative Metrics Box */}
              <div className="official-summary-box">
                <div className="summary-item">
                  <span className="summary-label">Total Score</span>
                  <span className="summary-value">
                    {computedMetrics.totalScore}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Score</span>
                  <span className="summary-value">
                    {computedMetrics.average}%
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Cumulative GPA</span>
                  <span className="summary-value">
                    {computedMetrics.overallGpa} / 4.0
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Result Status</span>
                  <span
                    className={`summary-value ${
                      computedMetrics.passStatus.includes("FAIL")
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {computedMetrics.passStatus}
                  </span>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="official-signatures">
                <div className="signature-line">
                  <div className="line" />
                  <span>Class Teacher Signature</span>
                </div>
                <div className="signature-line">
                  <div className="line" />
                  <span>Principal / Headmaster Signature</span>
                </div>
                <div className="signature-line">
                  <div className="line" />
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

export default ReportCardsPage;
