// src/modules/students/pages/StudentGradesPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Award, BookOpen, FileText, CheckCircle2 } from "lucide-react";
import api from "../../../api/axios";

const StudentGradesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [grades, setGrades] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [activeTab, setActiveTab] = useState("grades");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAcademicRecords = async () => {
      try {
        setLoading(true);

        // 1. Resolve student record ID
        let studentId = user?.student_id;
        if (!studentId) {
          const searchRes = await api.get("/students/search", {
            params: { q: user?.email || user?.username },
          });
          if (searchRes.data?.length > 0) {
            studentId = searchRes.data[0].id;
          }
        }

        if (studentId) {
          // 2. Fetch Grades from GET /grading/students/:studentId/grades
          try {
            const gradesRes = await api.get(
              `/grading/students/${studentId}/grades`,
            );
            const data = gradesRes.data?.data || gradesRes.data || [];
            setGrades(Array.isArray(data) ? data : []);
          } catch (e) {
            // Fallback to student dashboard results
            const dashRes = await api.get(`/students/${studentId}/dashboard`);
            setGrades(dashRes.data?.latestResults || []);
          }

          // 3. Fetch Transcript from GET /grading/students/:studentId/transcript
          try {
            const transRes = await api.get(
              `/grading/students/${studentId}/transcript`,
            );
            setTranscript(transRes.data?.data || transRes.data || null);
          } catch (e) {
            console.warn("No transcript published yet");
          }
        }
      } catch (err) {
        console.error("Failed to load grades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAcademicRecords();
  }, [user]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ color: "#172b4c", fontSize: "1.8rem", margin: "0 0 8px 0" }}
        >
          My Academic Grades & Transcript
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Review all published exam marks, term scores, and transcript
          evaluations.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("grades")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: activeTab === "grades" ? "#1b633b" : "#e2e8f0",
            color: activeTab === "grades" ? "white" : "#475569",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Exam Marks
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: activeTab === "transcript" ? "#1b633b" : "#e2e8f0",
            color: activeTab === "transcript" ? "white" : "#475569",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Official Transcript
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading records...
        </div>
      ) : activeTab === "grades" ? (
        grades.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "48px 24px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Award
              size={48}
              color="#cbd5e1"
              style={{ margin: "0 auto 12px auto" }}
            />
            <h3 style={{ color: "#172b4c", margin: "0 0 6px 0" }}>
              No Exam Grades Published
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Your teachers have not published marks for any examinations yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
              }}
            >
              <thead
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                <tr>
                  <th style={{ padding: "14px 18px" }}>Subject</th>
                  <th style={{ padding: "14px 18px" }}>Exam Name</th>
                  <th style={{ padding: "14px 18px" }}>Score / Percentage</th>
                  <th style={{ padding: "14px 18px" }}>Grade</th>
                  <th style={{ padding: "14px 18px" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontWeight: "600",
                        color: "#172b4c",
                      }}
                    >
                      {g.subjectName || g.subject?.name || "Subject"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>
                      {g.examName || g.exam?.name || "Term Exam"}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontWeight: "700",
                        color: "#1b633b",
                      }}
                    >
                      {g.percentage ?? g.totalMarks ?? 0}%
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          background: "#f0fdf4",
                          color: "#166534",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontWeight: "700",
                        }}
                      >
                        {g.grade || "A"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>
                      {g.remarks || "Good Performance"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Transcript Tab */
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #1b633b",
              paddingBottom: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "#172b4c" }}>
                Official Academic Transcript
              </h2>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Student ID: {transcript?.studentId || user?.username}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Status: <strong style={{ color: "#1b633b" }}>OFFICIAL</strong>
              </div>
            </div>
          </div>
          {transcript?.results && transcript.results.length > 0 ? (
            <div>
              {/* Detailed results list */}
              {transcript.results.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span>{item.subjectName}</span>
                  <strong style={{ color: "#1b633b" }}>
                    {item.grade} ({item.percentage}%)
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                color: "#94a3b8",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No consolidated transcript available yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentGradesPage;
