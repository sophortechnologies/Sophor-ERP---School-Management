// src/modules/examination/components/entry/MarksEntryForm.jsx
import React, { useState, useEffect } from "react";
import { X, Hash, BookOpen, User, Info, Calculator } from "lucide-react";
import { DEFAULT_GRADE_FORM } from "../../constants";
import { calculateGradeFromPercentage } from "../../utils/gradeCalculators";
import "./MarksEntryForm.css";

const MarksEntryForm = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  exam,
  existingMarks = null,
}) => {
  const [formData, setFormData] = useState(DEFAULT_GRADE_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [calculatedGrade, setCalculatedGrade] = useState(null);

  useEffect(() => {
    if (existingMarks) {
      setFormData({
        studentId: student.studentId,
        examId: exam?.id || "",
        subjectId: exam?.subjectId || "",
        marksObtained: existingMarks.marksObtained || "",
        totalMarks: exam?.totalMarks || 100,
        grade: existingMarks.grade || "",
        remarks: existingMarks.remarks || "",
        enteredBy: "",
      });
    } else {
      setFormData({
        ...DEFAULT_GRADE_FORM,
        studentId: student.studentId,
        examId: exam?.id || "",
        subjectId: exam?.subjectId || "",
        totalMarks: exam?.totalMarks || 100,
      });
    }
    setErrors({});
    setCalculatedGrade(null);
  }, [existingMarks, student, exam, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.marksObtained && formData.marksObtained !== 0) {
      newErrors.marksObtained = "Marks are required";
    } else if (formData.marksObtained < 0) {
      newErrors.marksObtained = "Marks cannot be negative";
    } else if (formData.marksObtained > formData.totalMarks) {
      newErrors.marksObtained = `Marks cannot exceed ${formData.totalMarks}`;
    }

    if (!formData.grade) {
      newErrors.grade = "Grade is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (
      name === "marksObtained" &&
      newValue !== "" &&
      formData.totalMarks > 0
    ) {
      const percentage = (newValue / formData.totalMarks) * 100;
      const grade = calculateGradeFromPercentage(percentage);
      if (grade) {
        setCalculatedGrade(grade);
        setFormData((prev) => ({
          ...prev,
          grade: grade.grade,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      alert(error.message || "Failed to save marks");
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePercentage = () => {
    if (
      !formData.marksObtained ||
      !formData.totalMarks ||
      formData.totalMarks === 0
    )
      return 0;
    return ((formData.marksObtained / formData.totalMarks) * 100).toFixed(1);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existingMarks ? "Edit Marks" : "Enter Marks"}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="examination-entry-marksentryform-marks-entry-form">
          <div className="examination-entry-marksentryform-student-info-card">
            <div className="examination-entry-marksentryform-info-row">
              <div className="examination-entry-marksentryform-info-item">
                <label>
                  <User size={14} /> Student Name
                </label>
                <div className="examination-entry-marksentryform-info-value">{student.name}</div>
              </div>
              <div className="examination-entry-marksentryform-info-item">
                <label>Student ID</label>
                <div className="examination-entry-marksentryform-info-value">{student.studentId}</div>
              </div>
              <div className="examination-entry-marksentryform-info-item">
                <label>Roll Number</label>
                <div className="examination-entry-marksentryform-info-value">{student.rollNumber}</div>
              </div>
            </div>

            <div className="examination-entry-marksentryform-info-row">
              <div className="examination-entry-marksentryform-info-item">
                <label>
                  <BookOpen size={14} /> Exam
                </label>
                <div className="examination-entry-marksentryform-info-value">{exam?.name || "N/A"}</div>
              </div>
              <div className="examination-entry-marksentryform-info-item">
                <label>Total Marks</label>
                <div className="examination-entry-marksentryform-info-value">{formData.totalMarks}</div>
              </div>
              <div className="examination-entry-marksentryform-info-item">
                <label>Passing Marks</label>
                <div className="examination-entry-marksentryform-info-value">{exam?.passingMarks || 40}</div>
              </div>
            </div>
          </div>

          <div className="examination-entry-marksentryform-form-section">
            <h3>Marks Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="marksObtained">
                  <Hash size={16} />
                  Marks Obtained *
                </label>
                <input
                  type="number"
                  id="marksObtained"
                  name="marksObtained"
                  value={formData.marksObtained}
                  onChange={handleChange}
                  min="0"
                  max={formData.totalMarks}
                  step="0.01"
                  className={errors.marksObtained ? "error" : ""}
                  placeholder={`Enter marks out of ${formData.totalMarks}`}
                />
                {errors.marksObtained && (
                  <span className="error-text">{errors.marksObtained}</span>
                )}

                {formData.marksObtained && (
                  <div className="examination-entry-marksentryform-marks-info">
                    <div className="examination-entry-marksentryform-percentage-display">
                      <Calculator size={14} />
                      Percentage: {calculatePercentage()}%
                    </div>
                    {exam?.passingMarks && (
                      <div
                        className={`examination-entry-marksentryform-pass-status ${formData.marksObtained >= exam.passingMarks ? "pass" : "fail"}`}
                      >
                        {formData.marksObtained >= exam.passingMarks
                          ? "PASS"
                          : "FAIL"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade *</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={errors.grade ? "error" : ""}
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+ (Outstanding)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="A-">A- (Very Good)</option>
                  <option value="B+">B+ (Good Plus)</option>
                  <option value="B">B (Good)</option>
                  <option value="B-">B- (Satisfactory Plus)</option>
                  <option value="C+">C+ (Satisfactory)</option>
                  <option value="C">C (Average)</option>
                  <option value="C-">C- (Below Average)</option>
                  <option value="D">D (Poor)</option>
                  <option value="F">F (Fail)</option>
                </select>
                {errors.grade && (
                  <span className="error-text">{errors.grade}</span>
                )}

                {calculatedGrade && (
                  <div className="examination-entry-marksentryform-grade-suggestion">
                    Suggested:{" "}
                    <span className="examination-entry-marksentryform-suggested-grade">
                      {calculatedGrade.grade}
                    </span>
                    <span className="examination-entry-marksentryform-suggested-description">
                      ({calculatedGrade.description})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="remarks">
                <Info size={16} />
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Add any remarks or comments..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : existingMarks
                  ? "Update Marks"
                  : "Save Marks"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarksEntryForm;
