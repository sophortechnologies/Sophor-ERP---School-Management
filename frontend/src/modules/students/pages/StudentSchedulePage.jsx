// src/modules/students/pages/StudentSchedulePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, Clock, BookOpen, MapPin } from "lucide-react";
import api from "../../../api/axios";

const StudentSchedulePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySchedule = async () => {
      try {
        setLoading(true);
        // Call backend /timetables/my
        const res = await api.get("/timetables/my");
        const data = res.data || [];
        setSchedule(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn(
          "Timetable error or no section assigned yet:",
          err.message,
        );
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMySchedule();
  }, [user]);

  const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  // Group by day of the week
  const grouped = daysOrder.reduce((acc, day) => {
    acc[day] = schedule.filter(
      (s) => (s.dayOfWeek || "").toUpperCase() === day,
    );
    return acc;
  }, {});

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
          Weekly Class Timetable
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          View all daily class periods, timings, and assigned subjects.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading timetable...
        </div>
      ) : schedule.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "48px 24px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <Calendar
            size={48}
            color="#cbd5e1"
            style={{ margin: "0 auto 12px auto" }}
          />
          <h3 style={{ color: "#172b4c", margin: "0 0 6px 0" }}>
            No Timetable Scheduled
          </h3>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            The school administration has not assigned periods to your section
            yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {daysOrder.map((day) => {
            const periods = grouped[day];
            if (!periods || periods.length === 0) return null;
            return (
              <div
                key={day}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    color: "#1b633b",
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    textTransform: "uppercase",
                  }}
                >
                  {day}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {periods.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        borderLeft: "3px solid #1b633b",
                      }}
                    >
                      <div style={{ fontWeight: "700", color: "#172b4c" }}>
                        {p.subject?.name || p.subjectName || "Subject"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "4px",
                        }}
                      >
                        <Clock size={12} />
                        <span>
                          {p.startTime} - {p.endTime}
                        </span>
                      </div>
                      {p.room && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          Room: {p.room}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSchedulePage;
