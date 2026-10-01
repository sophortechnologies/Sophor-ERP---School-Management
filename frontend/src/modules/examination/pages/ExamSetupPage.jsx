// src/modules/examination/pages/ExamSetupPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useExamination } from "../hooks/useExamination";
import { examinationApi } from "../api/examination.api";
import ExamForm from "../components/setup/ExamForm";
import ExamTypeModal from "../components/setup/ExamTypeModal";
import "../../classes/pages/ClassesManagement.css";

const ExamSetupPage = () => {
  const {
    exams: examsData,
    classes: classesData,
    examTypes: examTypesData,
    loading,
    error,
    createExam,
    updateExam,
    publishExam,
    loadInitialData,
  } = useExamination();

  const rawExams = examsData?.data || examsData;
  const exams = Array.isArray(rawExams) ? rawExams : [];

  const rawClasses = classesData?.data || classesData;
  const classes = Array.isArray(rawClasses) ? rawClasses : [];

  const rawExamTypes = examTypesData?.data || examTypesData;
  const examTypes = Array.isArray(rawExamTypes) ? rawExamTypes : [];

  const [academicSessions, setAcademicSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showExamForm, setShowExamForm] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  const fetchAcademicSessions = async () => {
    try {
      const response = await examinationApi.getAcademicSessions();
      let sessionsData = [];
      if (Array.isArray(response)) sessionsData = response;
      else if (response?.data && Array.isArray(response.data))
        sessionsData = response.data;
      else if (Array.isArray(response?.data)) sessionsData = response.data;

      if (sessionsData.length === 0) {
        const currentYear = new Date().getFullYear();
        sessionsData = [
          { id: 1, name: `${currentYear}-${currentYear + 1}`, isActive: true },
        ];
      }
      setAcademicSessions(sessionsData);
    } catch (err) {
      setAcademicSessions([{ id: 1, name: "2025-2026", isActive: true }]);
    }
  };

  const stats = {
    totalExams: exams.length,
    publishedExams: exams.filter(
      (e) => e && (e.status === "published" || e.isPublished),
    ).length,
    ongoingExams: exams.filter((e) => e && e.status === "ongoing").length,
    upcomingExams: exams.filter(
      (e) =>
        e && (e.status === "scheduled" || e.status === "DRAFT" || !e.status),
    ).length,
  };

  const filteredExams = exams.filter((exam) => {
    if (!exam) return false;
    const term = searchTerm.toLowerCase();
    const nameMatch =
      exam.name?.toLowerCase().includes(term) ||
      exam.description?.toLowerCase().includes(term);
    const classMatch =
      selectedClass === "all" || String(exam.classId) === String(selectedClass);
    const typeMatch =
      selectedType === "all" ||
      String(exam.examTypeId) === String(selectedType);

    // Precise status evaluation
    const isPub = exam.status === "published" || exam.isPublished;
    const currentStatus = isPub
      ? "published"
      : exam.status
        ? exam.status.toLowerCase()
        : "scheduled";

    const statusMatch =
      selectedStatus === "all" ||
      currentStatus === selectedStatus.toLowerCase() ||
      (selectedStatus.toLowerCase() === "scheduled" &&
        currentStatus === "draft");

    return nameMatch && classMatch && typeMatch && statusMatch;
  });

  const handleFormSubmit = async (data) => {
    const result = editingExam
      ? await updateExam(editingExam.id, data)
      : await createExam(data);

    if (result?.success) {
      const action = editingExam ? "updated" : "created";
      setSuccessMessage(`Exam "${data.name}" ${action} successfully!`);
      setShowExamForm(false);
      setEditingExam(null);
      loadInitialData();
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } else {
      return { success: false, error: result?.error || "Failed to save exam" };
    }
  };

  const handlePublishExam = async (exam) => {
    if (
      !confirm(
        `Publish "${exam.name}"? This will make results visible and lock editing.`,
      )
    )
      return;
    const result = await publishExam(exam.id);
    if (result && result.success) {
      setSuccessMessage(`Exam "${exam.name}" published successfully!`);
      loadInitialData();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result?.error || "Failed to publish exam");
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-exams-area");
    if (!printArea) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Examination Roster</title>
          <style>
            body { font-family: sans-serif; margin: 24px; color: #1e293b; }
            .print-title { font-size: 22px; font-weight: 800; color: #172b4c; margin-bottom: 4px; }
            .print-meta { font-size: 13px; color: #64748b; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1b633b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="print-title">SophorERP — Examination Roster</div>
          <div class="print-meta">Generated on ${new Date().toLocaleDateString()} | Total Exams: ${filteredExams.length}</div>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExport = () => {
    const csvContent = [
      ["Exam ID", "Exam Name", "Class ID", "Start Date", "End Date", "Status"],
      ...filteredExams.map((e) => [
        `EXM${String(e.id).padStart(4, "0")}`,
        e.name,
        e.classId,
        e.startDate ? new Date(e.startDate).toLocaleDateString() : "",
        e.endDate ? new Date(e.endDate).toLocaleDateString() : "",
        e.status || "SCHEDULED",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exams_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="classes-management-page">
      <div className="classes-header-banner no-print">
        <div className="classes-header-content">
          <div>
            <h1>Examination Setup</h1>
            <p>Create and manage exams, schedules, and configurations</p>
          </div>
          <div className="classes-header-actions">
            <button
              className="btn btn-secondary"
              onClick={async () => {
                setSuccessMessage("Refreshing...");
                await loadInitialData();
                await fetchAcademicSessions();
                setSuccessMessage("Refreshed successfully!");
                setTimeout(() => setSuccessMessage(""), 2000);
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowTypeModal(true)}
            >
              <Plus size={16} /> Manage Exam Types
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingExam(null);
                setShowExamForm(true);
              }}
            >
              <Plus size={16} /> Create Exam
            </button>
          </div>
        </div>
      </div>

      <div className="classes-page-body">
        {successMessage && (
          <div className="classes-success-banner">{successMessage}</div>
        )}

        <div className="classes-stats-grid no-print">
          <div className="classes-stat-card">
            <div className="classes-stat-icon blue">
              <BookOpen size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Total Exams</p>
              <p className="classes-stat-value">{stats.totalExams}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Published</p>
              <p className="classes-stat-value">{stats.publishedExams}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon amber">
              <Clock size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Ongoing</p>
              <p className="classes-stat-value">{stats.ongoingExams}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon purple">
              <Calendar size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Upcoming</p>
              <p className="classes-stat-value">{stats.upcomingExams}</p>
            </div>
          </div>
        </div>

        <div className="classes-action-bar no-print">
          <div className="classes-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search exams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="classes-filter-group">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Exam Types</option>
              {examTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="published">Published</option>
            </select>

            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div className="classes-print-header">
          <h2>SophorERP — Examination Roster</h2>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="classes-content-card" id="printable-exams-area">
          <div className="classes-table-responsive">
            <table className="classes-table">
              <thead>
                <tr>
                  <th>Exam ID</th>
                  <th>Exam Name</th>
                  <th>Class</th>
                  <th>Date Range</th>
                  <th>Term / Year</th>
                  <th>Status</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="classes-empty-row">
                      No examinations found in the database.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => {
                    const examType = examTypes.find(
                      (t) => t.id === exam.examTypeId,
                    );
                    const classInfo = classes.find(
                      (c) => c.id === exam.classId,
                    );
                    const isPub =
                      exam.status === "published" || exam.isPublished;

                    return (
                      <tr key={exam.id}>
                        <td className="classes-id-cell">
                          EXM{String(exam.id).padStart(4, "0")}
                        </td>
                        <td>
                          <strong className="classes-name-cell">
                            {exam.name}
                          </strong>
                          {examType && (
                            <div className="classes-exam-type-sub">
                              Type: {examType.name}
                            </div>
                          )}
                        </td>
                        <td className="classes-session-cell">
                          {classInfo
                            ? classInfo.name
                            : `Class #${exam.classId}`}
                        </td>
                        <td className="classes-session-cell">
                          {exam.startDate
                            ? new Date(exam.startDate).toLocaleDateString()
                            : "—"}{" "}
                          to{" "}
                          {exam.endDate
                            ? new Date(exam.endDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="classes-session-cell">
                          Term {exam.term} ({exam.academicYear})
                        </td>
                        <td>
                          <span
                            className={`classes-pill-badge ${isPub ? "published" : "draft"}`}
                          >
                            {isPub ? "PUBLISHED" : exam.status || "SCHEDULED"}
                          </span>
                        </td>
                        <td className="no-print">
                          <div className="classes-action-buttons">
                            {isPub ? (
                              <button
                                type="button"
                                className="classes-action-btn"
                                onClick={() => setViewingExam(exam)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="classes-action-btn"
                                  onClick={() => {
                                    setEditingExam(exam);
                                    setShowExamForm(true);
                                  }}
                                  title="Edit Exam"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="classes-action-btn"
                                  onClick={() => handlePublishExam(exam)}
                                  title="Publish Exam"
                                >
                                  <FileText size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showExamForm && (
        <ExamForm
          isOpen={showExamForm}
          onClose={() => {
            setShowExamForm(false);
            setEditingExam(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingExam}
          classes={classes}
          academicSessions={academicSessions}
          examTypes={
            examTypes.length > 0
              ? examTypes
              : [{ id: 1, name: "General Exam", weightage: 100 }]
          }
        />
      )}

      {showTypeModal && (
        <ExamTypeModal
          isOpen={showTypeModal}
          onClose={() => setShowTypeModal(false)}
          onCreated={loadInitialData}
        />
      )}

      {/* View Details Modal for Published Exams */}
      {viewingExam && (
        <div className="class-modal-overlay">
          <div className="class-modal-card" style={{ maxWidth: "460px" }}>
            <div className="class-modal-header">
              <h2>
                <BookOpen size={20} />
                Exam Details: {viewingExam.name}
              </h2>
              <button
                type="button"
                className="class-modal-close-btn"
                onClick={() => setViewingExam(null)}
              >
                ✕
              </button>
            </div>
            <div
              className="class-modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#64748b" }}>Status:</span>
                <strong style={{ color: "#166534" }}>PUBLISHED</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#64748b" }}>Start Date:</span>
                <strong>
                  {viewingExam.startDate
                    ? new Date(viewingExam.startDate).toLocaleDateString()
                    : "—"}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#64748b" }}>End Date:</span>
                <strong>
                  {viewingExam.endDate
                    ? new Date(viewingExam.endDate).toLocaleDateString()
                    : "—"}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#64748b" }}>Term & Year:</span>
                <strong>
                  Term {viewingExam.term} ({viewingExam.academicYear})
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  paddingBottom: "4px",
                }}
              >
                <span style={{ color: "#64748b" }}>Description:</span>
                <span>{viewingExam.description || "No notes"}</span>
              </div>
              <div
                className="class-modal-actions"
                style={{ marginTop: "12px" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingExam(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSetupPage;
