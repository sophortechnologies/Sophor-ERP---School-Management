// src/modules/examination/components/entry/BulkUploadModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  Check,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import { examinationApi } from "../../api/examination.api";
import "./BulkUploadModal.css";

const BulkUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  examId,
  classId,
  subjects: parentSubjects = [],
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState(parentSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const headers = ["studentId", "marksObtained", "grade", "remarks"];

  // Fetch subjects for the selected exam when modal opens
  useEffect(() => {
    const fetchExamSubjects = async () => {
      if (parentSubjects && parentSubjects.length > 0) {
        setSubjects(parentSubjects);
        setSelectedSubjectId(parentSubjects[0].subjectId);
      } else if (examId) {
        try {
          const exam = await examinationApi.getExamById(examId);
          const examSubjects =
            exam?.examSubjects || exam?.data?.examSubjects || [];
          setSubjects(examSubjects);
          if (examSubjects.length > 0) {
            setSelectedSubjectId(examSubjects[0].subjectId);
          }
        } catch (err) {
          console.error("Failed to load exam subjects for bulk upload:", err);
          setSubjects([]);
        }
      }
    };
    if (isOpen) {
      fetchExamSubjects();
    }
  }, [isOpen, examId, parentSubjects]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row);

      if (rows.length < 2) {
        setErrors(["CSV file is empty or has only headers"]);
        setPreview([]);
        return;
      }

      const fileHeaders = rows[0].split(",").map((h) => h.trim().toLowerCase());

      const missingHeaders = headers.filter(
        (h) => !fileHeaders.includes(h.toLowerCase()),
      );

      if (missingHeaders.length > 0) {
        setErrors([`Missing headers: ${missingHeaders.join(", ")}`]);
        setPreview([]);
        return;
      }

      const data = rows.slice(1).map((row, index) => {
        const values = row.split(",").map((v) => v.trim());
        const record = {};

        fileHeaders.forEach((header, i) => {
          record[header] = values[i] || "";
        });

        const recordErrors = [];

        if (!record.studentid) recordErrors.push("Missing Student ID");
        if (!record.marksobtained) recordErrors.push("Missing Marks");

        const marks = parseFloat(record.marksobtained);
        if (isNaN(marks)) {
          recordErrors.push("Invalid marks format");
        }

        return {
          ...record,
          lineNumber: index + 2,
          errors: recordErrors,
        };
      });

      setPreview(data);
      setErrors([]);
      setStep(2);
    };

    reader.readAsText(csvFile);
  };

  const downloadTemplate = () => {
    const template =
      headers.join(",") +
      "\n" +
      "STU1001,85,A,Excellent performance\n" +
      "STU1002,72,B-,Good effort\n" +
      "STU1003,0,F,Absent";

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marks_upload_template.csv";
    a.click();
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    if (!selectedSubjectId) {
      alert("Please select a target subject for these marks");
      return;
    }

    const hasErrors = preview.some((record) => record.errors.length > 0);
    if (hasErrors) {
      alert("Please fix all errors before uploading");
      return;
    }

    setUploading(true);
    try {
      const records = preview.map((record) => {
        const rawId = String(record.studentid);
        const numericId = parseInt(rawId.replace(/[^0-9]/g, ""), 10) || 1;
        const currentSubject = subjects.find(
          (s) => String(s.subjectId) === String(selectedSubjectId),
        );

        return {
          studentId: numericId,
          subjectId: parseInt(selectedSubjectId, 10),
          marksObtained: parseFloat(record.marksobtained),
          maxMarks: currentSubject?.maxMarks
            ? parseFloat(currentSubject.maxMarks)
            : 100,
          grade: record.grade || "",
          remarks: record.remarks || "",
        };
      });

      const payload = {
        examId: parseInt(examId, 10),
        records,
      };

      await onUpload(payload);
      setStep(3);
    } catch (error) {
      alert(
        "Upload failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content examination-entry-bulkuploadmodal-bulk-upload-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <Upload size={20} />
            Bulk Upload Marks
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="examination-entry-bulkuploadmodal-upload-steps">
          <div
            className={`examination-entry-bulkuploadmodal-step ${step >= 1 ? "active" : ""}`}
          >
            <div className="examination-entry-bulkuploadmodal-step-number">
              1
            </div>
            <div className="examination-entry-bulkuploadmodal-step-label">
              Upload File
            </div>
          </div>
          <div
            className={`examination-entry-bulkuploadmodal-step ${step >= 2 ? "active" : ""}`}
          >
            <div className="examination-entry-bulkuploadmodal-step-number">
              2
            </div>
            <div className="examination-entry-bulkuploadmodal-step-label">
              Preview & Validate
            </div>
          </div>
          <div
            className={`examination-entry-bulkuploadmodal-step ${step >= 3 ? "active" : ""}`}
          >
            <div className="examination-entry-bulkuploadmodal-step-number">
              3
            </div>
            <div className="examination-entry-bulkuploadmodal-step-label">
              Upload Complete
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="examination-entry-bulkuploadmodal-upload-section">
            <div
              className="examination-entry-bulkuploadmodal-upload-info"
              style={{ marginBottom: "16px" }}
            >
              <div
                className="examination-entry-bulkuploadmodal-info-card"
                style={{ width: "100%" }}
              >
                <FileText size={24} />
                <h4>Select Target Subject</h4>
                <p style={{ marginBottom: "12px" }}>
                  Choose which subject these marks belong to:
                </p>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                  }}
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.subject?.name || `Subject #${sub.subjectId}`} (Max:{" "}
                      {sub.maxMarks})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="examination-entry-bulkuploadmodal-upload-area"
              onClick={() => document.getElementById("file-input").click()}
            >
              <Upload size={48} />
              <h3>Upload CSV File</h3>
              <p>Click to browse or drag and drop your file</p>
              <p className="examination-entry-bulkuploadmodal-upload-hint">
                Headers: studentId, marksObtained, grade, remarks
              </p>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {file && (
              <div
                className="examination-entry-bulkuploadmodal-file-info success"
                style={{ marginTop: "12px" }}
              >
                <Check size={16} />
                <span>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
            )}

            <div
              className="examination-entry-bulkuploadmodal-template-section"
              style={{ marginTop: "16px" }}
            >
              <button className="btn btn-secondary" onClick={downloadTemplate}>
                <Download size={16} />
                Download Template
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="examination-entry-bulkuploadmodal-preview-section">
            <div className="examination-entry-bulkuploadmodal-preview-header">
              <h3>Preview & Validate</h3>
              <div className="examination-entry-bulkuploadmodal-preview-stats">
                <span className="examination-entry-bulkuploadmodal-stat-success">
                  <Check size={14} />
                  Valid: {preview.filter((r) => r.errors.length === 0).length}
                </span>
                <span className="examination-entry-bulkuploadmodal-stat-error">
                  <AlertCircle size={14} />
                  Errors: {preview.filter((r) => r.errors.length > 0).length}
                </span>
              </div>
            </div>

            <div className="examination-entry-bulkuploadmodal-preview-table-container">
              <table className="examination-entry-bulkuploadmodal-preview-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Student ID</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((record) => (
                    <tr
                      key={record.lineNumber}
                      className={
                        record.errors.length > 0
                          ? "examination-entry-bulkuploadmodal-row-error"
                          : "examination-entry-bulkuploadmodal-row-valid"
                      }
                    >
                      <td className="examination-entry-bulkuploadmodal-line-number">
                        {record.lineNumber}
                      </td>
                      <td>{record.studentid}</td>
                      <td>{record.marksobtained}</td>
                      <td>{record.grade || "-"}</td>
                      <td>{record.remarks || "-"}</td>
                      <td className="examination-entry-bulkuploadmodal-validation-cell">
                        {record.errors.length > 0 ? (
                          <div className="examination-entry-bulkuploadmodal-validation-errors">
                            {record.errors.map((error, idx) => (
                              <div
                                key={idx}
                                className="examination-entry-bulkuploadmodal-error-item"
                              >
                                <AlertCircle size={12} />
                                {error}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="examination-entry-bulkuploadmodal-validation-success">
                            <Check size={12} />
                            Valid
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="examination-entry-bulkuploadmodal-preview-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading || preview.some((r) => r.errors.length > 0)}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${preview.length} Records`}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="examination-entry-bulkuploadmodal-result-section">
            <div className="examination-entry-bulkuploadmodal-result-icon success">
              <Check size={48} />
            </div>
            <h3>Upload Successful!</h3>
            <p className="examination-entry-bulkuploadmodal-result-message">
              {preview.length} marks records have been uploaded successfully.
            </p>
            <div className="examination-entry-bulkuploadmodal-result-actions">
              <button className="btn btn-secondary" onClick={resetForm}>
                Upload Another File
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
