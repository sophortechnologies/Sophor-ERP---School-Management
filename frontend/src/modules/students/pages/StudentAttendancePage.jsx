// src/modules/students/pages/StudentAttendancePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import api from "../../../api/axios";

const StudentAttendancePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        let sId = user?.student_id;
        if (!sId) {
          const searchRes = await api.get("/students/search", {
            params: { q: user?.email || user?.username },
          });
          if (searchRes.data?.length > 0) {
            sId = searchRes.data[0].id;
          }
        }

        if (sId) {
          const res = await api.get(`/students/${sId}/dashboard`);
          setAttendanceData(res.data?.data?.attendance || res.data?.attendance);
        }
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const last30 = attendanceData?.last30 || {};
  const overall = attendanceData?.overall || {};

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{ color: "#172b4c", fontSize: "1.8rem", margin: "0 0 8px 0" }}
        >
          My Attendance Records
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Review your 30-day attendance metrics and cumulative present/absent
          history.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #1b633b",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            30-Day Attendance
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#1b633b",
              marginTop: "4px",
            }}
          >
            {last30.percentage != null ? `${last30.percentage}%` : "100%"}
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Days Present
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#172b4c",
              marginTop: "4px",
            }}
          >
            {last30.present ?? overall.presentDays ?? 0}
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Days Absent
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#ef4444",
              marginTop: "4px",
            }}
          >
            {last30.absent ?? overall.absentDays ?? 0}
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Days Late
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#f59e0b",
              marginTop: "4px",
            }}
          >
            {last30.late ?? overall.lateDays ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
