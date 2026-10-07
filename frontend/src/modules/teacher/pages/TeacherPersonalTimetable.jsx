// src/modules/teacher/pages/TeacherPersonalTimetable.jsx
import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { timetableApi } from "../../timetable/api/timetable.api";
import {
  WEEK_DAYS,
  TIME_SLOTS,
} from "../../timetable/constants/timetable.constants";
import api from "../../../api/axios";
import "../../timetable/pages/TimetableManagement.css";

const TeacherPersonalTimetable = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadTeacherSchedule();
  }, []);

  const loadTeacherSchedule = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Get logged-in user profile to find their teacher/user ID
      const profileRes = await api.get("/auth/profile");
      const user = profileRes.data?.data || profileRes.data;
      const teacherId = user?.teacher?.id || user?.id || user?.userId;

      if (!teacherId) {
        setErrorMsg("Could not identify teacher profile.");
        setLoading(false);
        return;
      }

      // 2. Fetch timetable specifically for this teacher
      const res = await timetableApi.getByTeacher(teacherId);
      if (res.success) {
        setTimetableData(res.data || []);
      } else {
        setErrorMsg("Failed to load your personal schedule.");
      }
    } catch (err) {
      console.error("Error fetching teacher timetable:", err);
      setErrorMsg("Failed to load your personal schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timetable-management-container">
      <div className="timetable-header-banner">
        <h2>
          <Calendar size={24} /> My Personal Teaching Schedule
        </h2>
        <p>
          View your assigned teaching periods and weekly routine across all
          classes.
        </p>
      </div>

      {errorMsg && (
        <div className="alert-error" style={{ margin: "20px 0" }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="timetable-grid-wrapper" style={{ marginTop: "20px" }}>
        {loading ? (
          <div className="timetable-empty-state">
            <p>Loading your personal schedule...</p>
          </div>
        ) : timetableData.length === 0 ? (
          <div className="timetable-empty-state">
            <Calendar
              size={48}
              style={{ marginBottom: "8px", color: "#94a3b8" }}
            />
            <h3>No Teaching Slots Found</h3>
            <p>
              You currently have no assigned periods in the timetable matrix.
            </p>
          </div>
        ) : (
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="time-col">Time Slot</th>
                {WEEK_DAYS.map((day) => (
                  <th key={day.value}>{day.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, idx) => (
                <tr key={idx}>
                  <td className="time-slot-label">{slot.value}</td>
                  {WEEK_DAYS.map((day) => {
                    // Match slots belonging to this teacher for this day and time
                    const match = timetableData.find((t) => {
                      if (t.dayOfWeek !== day.value) return false;
                      const recordDate = new Date(t.startTime);
                      const recordHour = String(
                        recordDate.getUTCHours(),
                      ).padStart(2, "0");
                      const recordMin = String(
                        recordDate.getUTCMinutes(),
                      ).padStart(2, "0");
                      const recordTimeStr = `${recordHour}:${recordMin}`;
                      return slot.value.startsWith(recordTimeStr);
                    });

                    return (
                      <td
                        key={day.value}
                        className={slot.isBreak ? "break-slot" : ""}
                        style={{ cursor: "default" }}
                      >
                        {slot.isBreak ? (
                          <span>{slot.label}</span>
                        ) : match ? (
                          <div className="assigned-slot">
                            <strong>{match.subject?.name || "Subject"}</strong>
                            <div
                              className="teacher-name"
                              style={{ color: "#2563eb", fontWeight: "600" }}
                            >
                              🏫 Class: {match.section?.class?.name || "Class"}{" "}
                              - {match.section?.name || ""}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherPersonalTimetable;
