// src/modules/examination/pages/MarksEntryPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Save,
  Upload,
  Download,
  Users,
  BookOpen,
  Hash,
  Eye,
  Edit,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Award,
} from "lucide-react";
import { useExamination } from "../hooks/useExamination";
import { examinationApi } from "../api/examination.api";
import MarksEntryForm from "../components/entry/MarksEntryForm";
import BulkUploadModal from "../components/entry/BulkUploadModal";
import "./MarksEntryPage.css";

const MarksEntryPage = () => {
  const { exams, classes, loading, error, bulkCreateGrades, loadInitialData } =
    useExamination();

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]); // 👈 Added subjects state to prevent "subjects is not defined" error
  const [marksData, setMarksData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showMarksForm, setShowMarksForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Fetch exam subjects and class students when exam or class changes
  useEffect(() => {
    const fetchExamDetails = async () => {
      if (selectedExam) {
        try {
          const exam = await examinationApi.getExamById(selectedExam);
          setSubjects(exam?.examSubjects || exam?.data?.examSubjects || []);
        } catch (err) {
          console.error("Failed to load exam subjects:", err);
          setSubjects([]);
        }
      } else {
        setSubjects([]);
      }
    };
    fetchExamDetails();
  }, [selectedExam]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const response = await examinationApi.getClassStudents(selectedClass);
          setStudents(response?.data || response || []);
        } catch (err) {
          console.error("Failed to fetch students for class:", err);
          setStudents([]);
        }
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const loadMarksData = async () => {
    setMarksData([]);
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const name =
          student.name ||
          `${student.firstName || ""} ${student.lastName || ""}`;
        const matchesSearch =
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(student.studentId || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(student.rollNumber || "").includes(searchTerm);

        if (activeTab === "pending")
          return matchesSearch && !getStudentMarks(student.studentId);
        if (activeTab === "entered")
          return matchesSearch && !!getStudentMarks(student.studentId);
        if (activeTab === "verified") return matchesSearch && false;
        return matchesSearch;
      })
    : [];

  const getStudentMarks = (studentId) => {
    return marksData.find((mark) => mark.studentId === studentId);
  };

  const handleEnterMarks = (student) => {
    setEditingStudent(student);
    setShowMarksForm(true);
  };

  const handleSaveMarks = async (marksPayload) => {
    const result = await bulkCreateGrades([marksPayload]);
    if (result.success) {
      alert("Marks saved successfully!");
      setShowMarksForm(false);
      loadMarksData();
    } else {
      alert(result.error || "Failed to save marks");
    }
  };

  const handleBulkUpload = async (uploadData) => {
    const result = await bulkCreateGrades(uploadData);
    if (result.success) {
      alert("Marks uploaded successfully!");
      setShowBulkUpload(false);
      loadMarksData();
    } else {
      alert(result.error || "Failed to upload marks");
    }
  };

  const stats = {
    totalStudents: students.length,
    marksEntered: marksData.length,
    averageMarks:
      marksData.length > 0
        ? (
            marksData.reduce((sum, mark) => sum + mark.marksObtained, 0) /
            marksData.length
          ).toFixed(1)
        : 0,
    pendingCount: students.length - marksData.length,
  };

  const handleExportMarks = () => {
    const csvContent = [
      [
        "Roll No",
        "Student ID",
        "Student Name",
        "Marks Obtained",
        "Total Marks",
        "Grade",
        "Remarks",
      ],
      ...filteredStudents.map((student) => {
        const marks = getStudentMarks(student.studentId);
        const selectedExamObj = exams.find(
          (e) => e.id === parseInt(selectedExam),
        );

        return [
          student.rollNumber || "",
          student.studentId || "",
          student.name ||
            `${student.firstName || ""} ${student.lastName || ""}`,
          marks?.marksObtained || "",
          selectedExamObj?.totalMarks || 100,
          marks?.grade || "",
          marks?.remarks || "",
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="marks-page-loading">
        <div className="marks-page-spinner"></div>
        <p>Loading marks data...</p>
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
              <BookOpen size={24} />
              Marks Entry
            </h1>
            <p>Enter and manage student marks for exams</p>
          </div>
          <div className="marks-header-actions-group">
            <button
              className="marks-btn-secondary"
              onClick={() => setShowBulkUpload(true)}
              disabled={!selectedExam || !selectedClass}
            >
              <Upload size={18} />
              Bulk Upload
            </button>
            <button
              className="marks-btn-primary"
              onClick={handleExportMarks}
              disabled={!selectedExam || !selectedClass}
            >
              <Download size={18} />
              Export Marks
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
            <p className="marks-stat-title-label">Total Students</p>
            <p className="marks-stat-number-val">{stats.totalStudents}</p>
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
            <p className="marks-stat-title-label">Marks Entered</p>
            <p className="marks-stat-number-val">{stats.marksEntered}</p>
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
            <p className="marks-stat-number-val">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#e0e7ff" }}
          >
            <Award size={24} color="#6366f1" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Average Marks</p>
            <p className="marks-stat-number-val">{stats.averageMarks}</p>
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

      {/* Search and Tab Filter Bar */}
      <div className="marks-filter-toolbar-card">
        <div className="marks-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search students by name, ID, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!selectedClass}
          />
        </div>

        <div className="marks-tabs-button-group">
          <button
            className={`marks-tab-filter-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({students.length})
          </button>
          <button
            className={`marks-tab-filter-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({stats.pendingCount})
          </button>
          <button
            className={`marks-tab-filter-btn ${activeTab === "entered" ? "active" : ""}`}
            onClick={() => setActiveTab("entered")}
          >
            Entered ({stats.marksEntered})
          </button>
          <button
            className={`marks-tab-filter-btn ${activeTab === "verified" ? "active" : ""}`}
            onClick={() => setActiveTab("verified")}
          >
            Verified (0)
          </button>
        </div>
      </div>

      {/* Marks Table Card */}
      <div className="marks-main-table-card">
        <div className="marks-card-header-area">
          <h2>
            <BookOpen size={20} />
            Student Roster & Marks
            <span className="marks-badge-counter">
              {filteredStudents.length} students
            </span>
          </h2>
        </div>

        {!selectedExam || !selectedClass ? (
          <div className="marks-empty-state-box">
            <BookOpen size={48} />
            <h3>Select Exam and Class</h3>
            <p>
              Please select an exam and class from the dropdown filters above to
              view and enter student marks.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="marks-empty-state-box">
            <Users size={48} />
            <h3>No Students Found</h3>
            <p>No students match your criteria for the selected class.</p>
          </div>
        ) : (
          <div className="marks-table-scroll-wrapper">
            <table className="marks-data-table-grid">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Marks Obtained</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const marks = getStudentMarks(student.studentId);
                  const selectedExamObj = exams.find(
                    (e) => e.id === parseInt(selectedExam),
                  );
                  const totalMarks = selectedExamObj?.totalMarks || 100;
                  const hasMarks = !!marks;
                  const studentName =
                    student.name ||
                    `${student.firstName || ""} ${student.lastName || ""}`;

                  return (
                    <tr key={student.id}>
                      <td className="marks-mono-text">
                        {student.rollNumber || "—"}
                      </td>
                      <td className="marks-mono-text">
                        <strong>{student.studentId}</strong>
                      </td>
                      <td>
                        <strong>{studentName}</strong>
                      </td>
                      <td>
                        {hasMarks ? (
                          <div>
                            <strong style={{ color: "#10b981" }}>
                              {marks.marksObtained}
                            </strong>{" "}
                            / {totalMarks}
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginLeft: "6px",
                              }}
                            >
                              (
                              {(
                                (marks.marksObtained / totalMarks) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>Not entered</span>
                        )}
                      </td>
                      <td>
                        {hasMarks ? (
                          <span
                            className="marks-sub-badge"
                            style={{ background: "#dcfce7", color: "#166534" }}
                          >
                            {marks.grade}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td style={{ color: "#64748b" }}>
                        {hasMarks ? marks.remarks : "—"}
                      </td>
                      <td>
                        {hasMarks ? (
                          <span
                            className="marks-status-pill-badge"
                            style={{ backgroundColor: "#10b981" }}
                          >
                            Entered
                          </span>
                        ) : (
                          <span
                            className="marks-status-pill-badge"
                            style={{ backgroundColor: "#f59e0b" }}
                          >
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="marks-row-actions">
                          <button
                            className="marks-icon-action-btn"
                            onClick={() => handleEnterMarks(student)}
                            title="Enter or Edit Marks"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMarksForm && editingStudent && (
        <MarksEntryForm
          isOpen={showMarksForm}
          onClose={() => setShowMarksForm(false)}
          onSubmit={handleSaveMarks}
          student={editingStudent}
          exam={exams.find((e) => e.id === parseInt(selectedExam))}
          existingMarks={getStudentMarks(editingStudent.studentId)}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
          examId={selectedExam}
          classId={selectedClass}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default MarksEntryPage;
