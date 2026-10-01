// modules/examination/pages/ReportCardPage.jsx
import React, { useState } from 'react';
import './ReportCardPage.css';

const ReportCardPage = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const students = [
    { id: '1', name: 'John Doe', class: '10A' },
    { id: '2', name: 'Jane Smith', class: '10A' },
    { id: '3', name: 'Bob Johnson', class: '9B' },
  ];

  const classes = ['10A', '10B', '9A', '9B', '8A', '8B'];
  const terms = ['Term 1 - 2024', 'Term 2 - 2024', 'Term 3 - 2024'];

  const handleGenerateReport = () => {
    alert('Generating report card... Feature will be implemented.');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="examination-reportcardpage-report-card-page">
      <div className="examination-reportcardpage-page-header">
        <h1>Report Cards</h1>
        <p>Generate and manage student report cards</p>
      </div>

      <div className="examination-reportcardpage-report-controls">
        <div className="examination-reportcardpage-control-group">
          <label htmlFor="student">Select Student</label>
          <select
            id="student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select Student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>

        <div className="examination-reportcardpage-control-group">
          <label htmlFor="class">Select Class</label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="examination-reportcardpage-control-group">
          <label htmlFor="term">Select Term</label>
          <select
            id="term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">-- Select Term --</option>
            {terms.map((term, index) => (
              <option key={index} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        <div className="examination-reportcardpage-control-buttons">
          <button 
            className="examination-reportcardpage-btn-generate"
            onClick={handleGenerateReport}
            disabled={!selectedStudent && !selectedClass}
          >
            Generate Report
          </button>
          <button 
            className="examination-reportcardpage-btn-print"
            onClick={handlePrintReport}
          >
            Print Report
          </button>
          <button className="examination-reportcardpage-btn-download">
            Download PDF
          </button>
        </div>
      </div>

      <div className="examination-reportcardpage-report-preview">
        <div className="examination-reportcardpage-preview-header">
          <h2>Report Card Preview</h2>
          <p>Generated report will appear here</p>
        </div>
        
        <div className="examination-reportcardpage-preview-placeholder">
          <div className="examination-reportcardpage-placeholder-content">
            <p>No report generated yet. Select a student or class and click "Generate Report".</p>
            <div className="examination-reportcardpage-placeholder-example">
              <h3>Example Report Card Format:</h3>
              <div className="examination-reportcardpage-example-card">
                <div className="examination-reportcardpage-example-header">
                  <h4>SCHOOL NAME</h4>
                  <p>Report Card - Term 1 2024</p>
                </div>
                <div className="examination-reportcardpage-example-student-info">
                  <p><strong>Student:</strong> John Doe</p>
                  <p><strong>Class:</strong> 10A</p>
                  <p><strong>Roll No:</strong> 101</p>
                </div>
                <table className="examination-reportcardpage-example-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mathematics</td>
                      <td>85/100</td>
                      <td>A</td>
                      <td>Excellent</td>
                    </tr>
                    <tr>
                      <td>English</td>
                      <td>78/100</td>
                      <td>B+</td>
                      <td>Good</td>
                    </tr>
                    <tr>
                      <td>Science</td>
                      <td>92/100</td>
                      <td>A+</td>
                      <td>Outstanding</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="examination-reportcardpage-recent-reports">
        <h3>Recently Generated Reports</h3>
        <div className="examination-reportcardpage-reports-list">
          <div className="examination-reportcardpage-report-item">
            <div className="examination-reportcardpage-report-info">
              <h4>John Doe - Term 1 2024</h4>
              <p>Class: 10A | Generated: Today, 10:30 AM</p>
            </div>
            <div className="examination-reportcardpage-report-actions">
              <button className="examination-reportcardpage-btn-view">View</button>
              <button className="examination-reportcardpage-btn-print">Print</button>
            </div>
          </div>
          <div className="examination-reportcardpage-report-item">
            <div className="examination-reportcardpage-report-info">
              <h4>Jane Smith - Term 1 2024</h4>
              <p>Class: 10A | Generated: Yesterday, 2:15 PM</p>
            </div>
            <div className="examination-reportcardpage-report-actions">
              <button className="examination-reportcardpage-btn-view">View</button>
              <button className="examination-reportcardpage-btn-print">Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardPage;