// src/modules/teacher/pages/TeacherMyStudentsPage.jsx
import React, { useState, useEffect } from "react";
import { Users, Search, BookOpen, AlertCircle } from "lucide-react";
import api from "../../../api/axios";

const TeacherMyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Query teacher dashboard or students list
        const res = await api.get("/students", {
          params: { page: 1, pageSize: 50 },
        });
        const data =
          res.data?.data ||
          res.data?.students ||
          (Array.isArray(res.data) ? res.data : []);
        setStudents(data);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const admNo = (s.admissionNumber || s.admission_number || "").toLowerCase();
    return name.includes(term) || admNo.includes(term);
  });

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{ color: "#172b4c", fontSize: "1.8rem", margin: "0 0 8px 0" }}
        >
          My Students
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          View and manage students in your assigned classes and sections.
        </p>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <Users
            size={36}
            color="#cbd5e1"
            style={{ margin: "0 auto 12px auto" }}
          />
          <h3 style={{ color: "#172b4c", margin: "0 0 6px 0" }}>
            No Students Found
          </h3>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            No students are enrolled in your assigned sections yet.
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
                <th style={{ padding: "12px 16px" }}>Admission No</th>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Class / Section</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.id || idx}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "600",
                      color: "#1b633b",
                    }}
                  >
                    {s.admissionNumber ||
                      s.admission_number ||
                      `STD${String(s.id).padStart(4, "0")}`}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#1e293b",
                      fontWeight: "500",
                    }}
                  >
                    {s.firstName} {s.lastName}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {s.class?.name || s.className || "Class A"} -{" "}
                    {s.section?.name || s.sectionName || "Sec 1"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: "#f0fdf4",
                        color: "#166534",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {s.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherMyStudentsPage;
