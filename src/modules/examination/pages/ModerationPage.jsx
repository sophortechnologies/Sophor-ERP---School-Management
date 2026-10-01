// src/modules/examination/pages/ModerationPage.jsx
import React, { useState, useEffect } from "react";
import {
  Check,
  Filter,
  Download,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  X,
} from "lucide-react";
import { useExamination } from "../hooks/useExamination";
import { examinationApi } from "../api/examination.api";
import ModerationPanel from "../components/entry/ModerationPanel";
import "./ModerationPage.css";

const ModerationPage = () => {
  const { exams, classes, loading, error } = useExamination();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [marks, setMarks] = useState([]);
  const [fetchingMarks, setFetchingMarks] = useState(false);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (selectedExam) {
        setFetchingMarks(true);
        try {
          const exam = await examinationApi.getExamById(selectedExam);
          const results = exam?.examResults || exam?.data?.examResults || [];

          const formattedMarks = results.map((res) => ({
            id: res.id,
            studentId: res.student?.studentId || String(res.studentId),
            studentName: res.student
              ? `${res.student.firstName} ${res.student.lastName}`
              : `Student #${res.studentId}`,
            examId: selectedExam,
            examName: exam?.name || "Exam",
            subjectName: res.subject?.name || `Subject #${res.subjectId}`,
            marksObtained: parseFloat(res.totalMarks || res.marksObtained || 0),
            totalMarks: parseFloat(res.maxMarks || 100),
            grade: res.grade || "N/A",
            status: res.isVerified ? "approved" : "pending",
            enteredBy: res.enteredByUser
              ? `${res.enteredByUser.firstName} ${res.enteredByUser.lastName}`
              : "Teacher",
            enteredAt: res.createdAt || new Date().toISOString(),
          }));

          setMarks(formattedMarks);
        } catch (err) {
          console.error("Failed to fetch exam results for moderation:", err);
          setMarks([]);
        } finally {
          setFetchingMarks(false);
        }
      } else {
        setMarks([]);
      }
    };
    fetchExamResults();
  }, [selectedExam, selectedClass]);

  const handleApproveMarks = async (markIds) => {
    try {
      for (const id of markIds) {
        const mark = marks.find((m) => m.id === id);
        if (mark) {
          await examinationApi.verifyResults({
            examId: parseInt(selectedExam, 10),
            studentId: parseInt(mark.studentId, 10) || 1,
          });
        }
      }

      setMarks((prev) =>
        prev.map((mark) =>
          markIds.includes(mark.id)
            ? {
                ...mark,
                status: "approved",
                approvedAt: new Date().toISOString(),
              }
            : mark,
        ),
      );

      alert(`${markIds.length} mark(s) verified & approved successfully!`);
    } catch (error) {
      alert(
        `Failed to approve marks: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleRejectMarks = async (markIds) => {
    const reason = prompt("Please enter rejection/moderation remarks:");
    if (!reason) return;

    try {
      setMarks((prev) =>
        prev.map((mark) =>
          markIds.includes(mark.id)
            ? { ...mark, status: "rejected", rejectionReason: reason }
            : mark,
        ),
      );

      alert(`${markIds.length} mark(s) marked as rejected/needs review.`);
    } catch (error) {
      alert(`Failed to reject marks: ${error.message}`);
    }
  };

  const handleViewDetails = (mark) => {
    alert(`Mark Details:\n
Student: ${mark.studentName} (${mark.studentId})\n
Exam: ${mark.examName}\n
Subject: ${mark.subjectName}\n
Marks: ${mark.marksObtained}/${mark.totalMarks}\n
Grade: ${mark.grade}\n
Status: ${mark.status}\n
Entered By: ${mark.enteredBy}\n
Entered At: ${new Date(mark.enteredAt).toLocaleString()}\n
${mark.remarks ? `Remarks: ${mark.remarks}\n` : ""}
${mark.rejectionReason ? `Rejection Reason: ${mark.rejectionReason}\n` : ""}`);
  };

  const handleExportData = () => {
    if (marks.length === 0) return;

    const csvContent = [
      [
        "Student ID",
        "Student Name",
        "Exam",
        "Subject",
        "Marks",
        "Grade",
        "Status",
        "Entered By",
        "Entered At",
      ],
      ...marks.map((mark) => [
        mark.studentId,
        mark.studentName,
        mark.examName,
        mark.subjectName,
        `${mark.marksObtained}/${mark.totalMarks}`,
        mark.grade,
        mark.status,
        mark.enteredBy,
        new Date(mark.enteredAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moderation_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const stats = {
    total: marks.length,
    pending: marks.filter((m) => m.status === "pending").length,
    approved: marks.filter((m) => m.status === "approved").length,
    rejected: marks.filter((m) => m.status === "rejected").length,
  };

  if (loading && exams.length === 0) {
    return (
      <div className="marks-page-loading">
        <div className="marks-page-spinner"></div>
        <p>Loading moderation data...</p>
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
              <Check size={24} />
              Mark Moderation
            </h1>
            <p>Review, approve, or verify entered exam results</p>
          </div>
          <div className="marks-header-actions-group">
            <button
              className="marks-btn-primary btn-primary"
              onClick={handleExportData}
              disabled={marks.length === 0}
              title={
                marks.length === 0
                  ? "No data available to export"
                  : "Export moderation data"
              }
            >
              <Download size={18} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="marks-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="marks-stats-grid-cards">
        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#dbeafe" }}
          >
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Total Marks</p>
            <p className="marks-stat-number-val">{stats.total}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#fef3c7" }}
          >
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Pending</p>
            <p className="marks-stat-number-val">{stats.pending}</p>
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
            <p className="marks-stat-title-label">Approved</p>
            <p className="marks-stat-number-val">{stats.approved}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#fee2e2" }}
          >
            <X size={24} color="#ef4444" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Rejected</p>
            <p className="marks-stat-number-val">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Action Bar / Selections */}
      <div className="marks-filter-toolbar-card">
        <div className="marks-filter-row-grid">
          <div className="marks-form-control-group">
            <label className="marks-lbl-title">Select Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="marks-dropdown-select"
            >
              <option value="">Choose Exam</option>
              {Array.isArray(exams) &&
                exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="marks-form-control-group">
            <label className="marks-lbl-title">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="marks-dropdown-select"
            >
              <option value="">Choose Class</option>
              {Array.isArray(classes) &&
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedExam || !selectedClass ? (
        <div className="marks-main-table-card">
          <div className="marks-empty-state-box">
            <AlertCircle size={48} />
            <h3>Select Exam and Class</h3>
            <p>
              Please select an exam and class from the dropdown filters above to
              view marks for moderation.
            </p>
          </div>
        </div>
      ) : fetchingMarks ? (
        <div className="marks-page-loading">
          <div className="marks-page-spinner"></div>
          <p>Fetching examination results...</p>
        </div>
      ) : (
        <ModerationPanel
          marks={marks}
          onApprove={handleApproveMarks}
          onReject={handleRejectMarks}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export default ModerationPage;
