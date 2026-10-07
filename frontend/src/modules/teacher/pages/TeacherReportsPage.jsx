import React, { useState, useEffect } from "react";
import {
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
// import "./TeacherReportsPage.css";

const TeacherReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState({
    attendance: null,
    grades: null,
    performance: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch attendance summary
      const attendanceRes = await api.get("/attendance/teacher/summary");
      // Fetch grade summary
      const gradesRes = await api.get("/grading/teacher/summary");

      setReports({
        attendance: attendanceRes.data,
        grades: gradesRes.data,
        performance: { averageScore: 78, topStudents: 5 },
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-reports-page">
      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate("/teacher/dashboard")}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>
          <FileText size={24} />
          Teacher Reports
        </h1>
        <p>View attendance, grade, and performance reports</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <Calendar size={24} />
            <h3>Attendance Report</h3>
          </div>
          <div className="report-content">
            <div className="stat">
              <span className="label">Average Attendance:</span>
              <span className="value">92%</span>
            </div>
            <div className="stat">
              <span className="label">Present Days:</span>
              <span className="value">156</span>
            </div>
            <div className="stat">
              <span className="label">Absent Days:</span>
              <span className="value">14</span>
            </div>
            <button className="btn btn-secondary">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <TrendingUp size={24} />
            <h3>Grade Report</h3>
          </div>
          <div className="report-content">
            <div className="stat">
              <span className="label">Class Average:</span>
              <span className="value">78.5%</span>
            </div>
            <div className="stat">
              <span className="label">Highest Score:</span>
              <span className="value">98%</span>
            </div>
            <div className="stat">
              <span className="label">Passing Rate:</span>
              <span className="value">94%</span>
            </div>
            <button className="btn btn-secondary">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <Users size={24} />
            <h3>Student Performance</h3>
          </div>
          <div className="report-content">
            <div className="stat">
              <span className="label">Top Performers:</span>
              <span className="value">5 Students</span>
            </div>
            <div className="stat">
              <span className="label">Needs Improvement:</span>
              <span className="value">3 Students</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "78%" }}></div>
            </div>
            <button className="btn btn-secondary">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReportsPage;
