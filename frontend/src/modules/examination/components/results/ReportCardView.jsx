// src/modules/examination/components/results/ReportCardView.jsx
import React from "react";
import {
  X,
  Printer,
  Download,
  Share2,
  Mail,
  Building,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import "./ReportCardView.css";

const ReportCardView = ({ isOpen, onClose, reportData, onPrint, onExport }) => {
  if (!isOpen) return null;

  const calculateGPA = (grade) => {
    const gpaMap = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      D: 1.0,
      F: 0.0,
    };
    return gpaMap[grade] || 0;
  };

  const overallGPA = calculateGPA(reportData.grade);

  return (
    <div className="examination-results-reportcardview-modal-overlay examination-results-reportcardview-report-card-modal" onClick={onClose}>
      <div className="examination-results-reportcardview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="examination-results-reportcardview-modal-header">
          <h2>Report Card Preview</h2>
          <div className="header-actions">
            <button className="examination-results-reportcardview-btn-icon" onClick={onPrint} title="Print">
              <Printer size={16} />
            </button>
            <button className="examination-results-reportcardview-btn-icon" onClick={onExport} title="Export PDF">
              <Download size={16} />
            </button>
            <button className="examination-results-reportcardview-btn-icon" title="Share">
              <Share2 size={16} />
            </button>
            <button className="examination-results-reportcardview-btn-icon" title="Email">
              <Mail size={16} />
            </button>
            <button className="examination-results-reportcardview-close-button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="examination-results-reportcardview-report-card-content" id="report-card-print">
          <div className="examination-results-reportcardview-school-header">
            <div className="examination-results-reportcardview-school-logo">
              <Building size={48} />
            </div>
            <div className="examination-results-reportcardview-school-info">
              <h1>Sophor Technologies School</h1>
              <p className="examination-results-reportcardview-school-address">
                123 Education Street, City, State 12345
              </p>
              <p className="examination-results-reportcardview-school-contact">
                Phone: (123) 456-7890 | Email: info@sophorschool.edu
              </p>
            </div>
            <div className="examination-results-reportcardview-report-title">
              <h2>ACADEMIC REPORT CARD</h2>
              <p className="examination-results-reportcardview-academic-year">Academic Year 2024-2025</p>
            </div>
          </div>

          <div className="examination-results-reportcardview-student-info-section">
            <div className="examination-results-reportcardview-info-grid">
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Student Name:</span>
                <span className="examination-results-reportcardview-info-value">{reportData.name}</span>
              </div>
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Student ID:</span>
                <span className="examination-results-reportcardview-info-value">{reportData.studentId}</span>
              </div>
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Roll Number:</span>
                <span className="examination-results-reportcardview-info-value">{reportData.rollNumber}</span>
              </div>
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Class/Grade:</span>
                <span className="examination-results-reportcardview-info-value">Grade 10</span>
              </div>
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Exam:</span>
                <span className="examination-results-reportcardview-info-value">{reportData.exam}</span>
              </div>
              <div className="examination-results-reportcardview-info-item">
                <span className="examination-results-reportcardview-info-label">Date:</span>
                <span className="examination-results-reportcardview-info-value">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="examination-results-reportcardview-performance-summary">
            <h3>Performance Summary</h3>
            <div className="examination-results-reportcardview-summary-cards">
              <div className="examination-results-reportcardview-summary-card">
                <div className="examination-results-reportcardview-summary-icon">
                  <Award size={24} />
                </div>
                <div className="examination-results-reportcardview-summary-details">
                  <div className="examination-results-reportcardview-summary-label">Overall Grade</div>
                  <div className={`examination-results-reportcardview-summary-value grade-${reportData.grade}`}>
                    {reportData.grade}
                  </div>
                </div>
              </div>

              <div className="examination-results-reportcardview-summary-card">
                <div className="examination-results-reportcardview-summary-icon">
                  <Users size={24} />
                </div>
                <div className="examination-results-reportcardview-summary-details">
                  <div className="examination-results-reportcardview-summary-label">Class Rank</div>
                  <div className="examination-results-reportcardview-summary-value">#{reportData.rank}</div>
                </div>
              </div>

              <div className="examination-results-reportcardview-summary-card">
                <div className="examination-results-reportcardview-summary-icon">%</div>
                <div className="examination-results-reportcardview-summary-details">
                  <div className="examination-results-reportcardview-summary-label">Percentage</div>
                  <div className="examination-results-reportcardview-summary-value">{reportData.percentage}%</div>
                </div>
              </div>

              <div className="examination-results-reportcardview-summary-card">
                <div className="examination-results-reportcardview-summary-icon">GPA</div>
                <div className="examination-results-reportcardview-summary-details">
                  <div className="examination-results-reportcardview-summary-label">GPA</div>
                  <div className="examination-results-reportcardview-summary-value">{overallGPA.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="examination-results-reportcardview-subjects-section">
            <h3>Subject-wise Performance</h3>
            <table className="examination-results-reportcardview-subjects-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td className="examination-results-reportcardview-subject-name">{subject.name}</td>
                    <td className="examination-results-reportcardview-marks-obtained">{subject.marks}</td>
                    <td className="examination-results-reportcardview-total-marks">{subject.total}</td>
                    <td className="examination-results-reportcardview-percentage">
                      {((subject.marks / subject.total) * 100).toFixed(1)}%
                    </td>
                    <td>
                      <span className={`examination-results-reportcardview-subject-grade grade-${subject.grade}`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="remarks">Good</td>
                  </tr>
                ))}
                <tr className="examination-results-reportcardview-total-row">
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{reportData.obtainedMarks}</strong>
                  </td>
                  <td>
                    <strong>{reportData.totalMarks}</strong>
                  </td>
                  <td>
                    <strong>{reportData.percentage}%</strong>
                  </td>
                  <td>
                    <strong>{reportData.grade}</strong>
                  </td>
                  <td>
                    <strong>Overall: Good</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="examination-results-reportcardview-grading-scale">
            <h4>Grading Scale</h4>
            <div className="examination-results-reportcardview-scale-grid">
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">A+</span>
                <span className="examination-results-reportcardview-scale-range">97-100%</span>
                <span className="examination-results-reportcardview-scale-description">Outstanding</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">A</span>
                <span className="examination-results-reportcardview-scale-range">93-96%</span>
                <span className="examination-results-reportcardview-scale-description">Excellent</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">A-</span>
                <span className="examination-results-reportcardview-scale-range">90-92%</span>
                <span className="examination-results-reportcardview-scale-description">Very Good</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">B+</span>
                <span className="examination-results-reportcardview-scale-range">87-89%</span>
                <span className="examination-results-reportcardview-scale-description">Good Plus</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">B</span>
                <span className="examination-results-reportcardview-scale-range">83-86%</span>
                <span className="examination-results-reportcardview-scale-description">Good</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">B-</span>
                <span className="examination-results-reportcardview-scale-range">80-82%</span>
                <span className="examination-results-reportcardview-scale-description">Satisfactory Plus</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">C+</span>
                <span className="examination-results-reportcardview-scale-range">77-79%</span>
                <span className="examination-results-reportcardview-scale-description">Satisfactory</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">C</span>
                <span className="examination-results-reportcardview-scale-range">73-76%</span>
                <span className="examination-results-reportcardview-scale-description">Average</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">C-</span>
                <span className="examination-results-reportcardview-scale-range">70-72%</span>
                <span className="examination-results-reportcardview-scale-description">Below Average</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">D</span>
                <span className="examination-results-reportcardview-scale-range">60-69%</span>
                <span className="examination-results-reportcardview-scale-description">Poor</span>
              </div>
              <div className="examination-results-reportcardview-scale-item">
                <span className="examination-results-reportcardview-scale-grade">F</span>
                <span className="examination-results-reportcardview-scale-range">Below 60%</span>
                <span className="examination-results-reportcardview-scale-description">Fail</span>
              </div>
            </div>
          </div>

          <div className="examination-results-reportcardview-comments-section">
            <div className="teacher-comments">
              <h4>Teacher's Comments</h4>
              <p className="examination-results-reportcardview-comments-text">
                {reportData.name} has shown consistent improvement throughout
                the term. Strong performance in Mathematics and Science. Good
                participation in class activities. Keep up the good work!
              </p>
              <div className="examination-results-reportcardview-signature">
                <div className="examination-results-reportcardview-signature-line"></div>
                <p className="examination-results-reportcardview-signature-label">Class Teacher's Signature</p>
              </div>
            </div>

            <div className="examination-results-reportcardview-principal-approval">
              <h4>Principal's Approval</h4>
              <div className="examination-results-reportcardview-approval-stamp">APPROVED</div>
              <div className="examination-results-reportcardview-signature">
                <div className="examination-results-reportcardview-signature-line"></div>
                <p className="examination-results-reportcardview-signature-label">Principal's Signature</p>
              </div>
            </div>
          </div>

          <div className="examination-results-reportcardview-report-footer">
            <p className="examination-results-reportcardview-footer-note">
              This is an official document. Any alteration is strictly
              prohibited.
            </p>
            <p className="generated-date">
              Generated on: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="examination-results-reportcardview-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={onPrint}>
            <Printer size={16} />
            Print Report Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCardView;
