import React, { useState, useEffect } from "react";
import {
  Save,
  Clock,
  Calendar,
  Users,
  Filter,
  Check,
  X,
  Lock,
} from "lucide-react";
import { ATTENDANCE_STATUS, STATUS_COLORS } from "../constants";
import { holidayService } from "../services/holidays";
import {
  transformBackendData,
  formatDateForDisplay,
} from "../utils/attendanceHelpers";
import "./AttendanceMarking.css";

const getPastDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split("T")[0];
};

const AttendanceMarking = ({
  classId,
  date,
  students,
  existingAttendance = [],
  onSave,
  onCancel,
}) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [bulkStatus, setBulkStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [holidayInfo, setHolidayInfo] = useState(null);

  const isAttendanceAlreadyMarked = React.useMemo(() => {
    if (!existingAttendance || !existingAttendance.length) return false;

    const matchingRecords = existingAttendance.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      const selectedDateFormatted = new Date(date).toISOString().split("T")[0];

      return recordDate === selectedDateFormatted && record.classId == classId;
    });

    return matchingRecords.length > 0;
  }, [existingAttendance, date, classId]);

  useEffect(() => {
    if (holidayInfo && !holidayInfo.isWorkingDay) return;

    const transformedAttendance = transformBackendData(existingAttendance);

    const initialAttendance = students.map((student) => {
      const existing = transformedAttendance.find(
        (a) => a.studentId === student.id || a.studentId === student.studentId,
      );

      let status = existing?.status || "";

      return {
        studentId: student.id || student.studentId,
        studentName: student.name || student.studentName,
        rollNumber: student.rollNumber || student.rollNo || "",
        status: status,
        remarks: existing?.remarks || "",
      };
    });

    setAttendanceList(initialAttendance);

    const initialRemarks = {};
    transformedAttendance.forEach((record) => {
      if (record.remarks) initialRemarks[record.studentId] = record.remarks;
    });
    setRemarks(initialRemarks);
  }, [students, existingAttendance, holidayInfo]);

  const handleStatusChange = (studentId, status) => {
    if (isAttendanceAlreadyMarked) return;

    if (holidayInfo && !holidayInfo.isWorkingDay) {
      return;
    }

    setAttendanceList((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status } : student,
      ),
    );
  };

  const handleRemarksChange = (studentId, value) => {
    if (isAttendanceAlreadyMarked) return;
    setRemarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const applyBulkStatus = () => {
    if (!bulkStatus) return;

    if (isAttendanceAlreadyMarked) return;

    if (holidayInfo && !holidayInfo.isWorkingDay) {
      return;
    }

    setAttendanceList((prev) =>
      prev.map((student) => ({
        ...student,
        status: bulkStatus,
      })),
    );
  };

  const handleSave = async () => {
    if (isAttendanceAlreadyMarked) {
      return;
    }

    const today = new Date();
    const selected = new Date(date);
    const diffTime = Math.abs(today - selected);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isWithinAllowedPeriod = diffDays <= 3;

    if (holidayInfo && !holidayInfo.isWorkingDay) {
      if (isWithinAllowedPeriod && diffDays > 0) {
        return;
      } else {
        return;
      }
    }

    if (diffDays > 3) {
      return;
    }

    if (!attendanceList.some((s) => s.status)) {
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const attendanceData = {
      date,
      classId,
      attendanceList: attendanceList.map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        status: student.status,
        remarks: remarks[student.studentId] || "",
      })),
      markedBy: currentUser.id || currentUser.name || "system",
    };

    setSaving(true);
    try {
      await onSave(attendanceData);
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const filteredAttendance = attendanceList.filter(
    (student) => filterStatus === "all" || student.status === filterStatus,
  );

  const statusCounts = attendanceList.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {});

  const isDisabled =
    (holidayInfo && !holidayInfo.isWorkingDay) || isAttendanceAlreadyMarked;

  return (
    <div className="attendance-attendancemarking-attendance-marking">
      <div className="attendance-attendancemarking-marking-header">
        <div className="attendance-attendancemarking-header-info">
          <h3>
            <Calendar size={20} />
            {isDisabled
              ? holidayInfo && !holidayInfo.isWorkingDay
                ? `Holiday - ${holidayInfo.name}`
                : "View Attendance (Already Marked)"
              : "Marking Attendance"}
          </h3>
          <div className="attendance-attendancemarking-header-details">
            <span className="attendance-attendancemarking-detail-item">
              <Users size={16} />
              Class: <strong>{classId}</strong>
            </span>
            <span className="attendance-attendancemarking-detail-item">
              <Calendar size={16} />
              Date: <strong>{formatDateForDisplay(date)}</strong>
            </span>
            <span className="attendance-attendancemarking-detail-item">
              <Users size={16} />
              Students: <strong>{students.length}</strong>
            </span>
            {holidayInfo && !holidayInfo.isWorkingDay && (
              <span className="attendance-attendancemarking-detail-item holiday-badge">
                {holidayInfo.name}
              </span>
            )}
            {isAttendanceAlreadyMarked && (
              <span className="attendance-attendancemarking-detail-item locked-badge">
                <Lock size={14} /> Attendance Locked
              </span>
            )}
          </div>
        </div>

        <div className="attendance-attendancemarking-header-actions">
          <button
            className="btn attendance-attendancemarking-btn-secondary"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>
          {!isAttendanceAlreadyMarked && (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || (holidayInfo && !holidayInfo.isWorkingDay)}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      <div className="attendance-attendancemarking-attendance-content">
        {holidayInfo && !holidayInfo.isWorkingDay && (
          <div className="attendance-attendancemarking-holiday-warning">
            <strong>Holiday Notice:</strong> {holidayInfo.name}
          </div>
        )}

        {isAttendanceAlreadyMarked && (
          <div className="already-marked-warning">
            <strong>Attendance Already Marked:</strong> To edit attendance, go
            to the Records section and select this date.
          </div>
        )}

        {!holidayInfo?.isWorkingDay ? null : (
          <>
            <div className="attendance-attendancemarking-quick-stats">
              {ATTENDANCE_STATUS.map((status) => (
                <div
                  key={status.value}
                  className="attendance-attendancemarking-stat-item"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[status.value.toLowerCase()]?.bg ||
                      "#f3f4f6",
                    color:
                      STATUS_COLORS[status.value.toLowerCase()]?.text ||
                      "#374151",
                    borderColor:
                      STATUS_COLORS[status.value.toLowerCase()]?.border ||
                      "#d1d5db",
                  }}
                >
                  <div className="stat-count">
                    {statusCounts[status.value] || 0}
                  </div>
                  <div className="stat-label">{status.label}</div>
                </div>
              ))}
            </div>

            {!isAttendanceAlreadyMarked && (
              <div className="attendance-attendancemarking-bulk-actions">
                <div className="attendance-attendancemarking-bulk-control">
                  <label>Apply to All:</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="bulk-select"
                  >
                    <option value="">Select Status</option>
                    {ATTENDANCE_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn attendance-attendancemarking-btn-secondary"
                    onClick={applyBulkStatus}
                    disabled={!bulkStatus}
                  >
                    <Check size={16} />
                    Apply
                  </button>
                </div>

                <div className="attendance-attendancemarking-filter-control">
                  <label>
                    <Filter size={16} />
                    Filter by Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Students</option>
                    {ATTENDANCE_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label} ({statusCounts[status.value] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        <div className="attendance-attendancemarking-attendance-table-container">
          <table className="attendance-attendancemarking-attendance-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((student) => (
                <tr key={student.studentId}>
                  <td className="roll-cell">{student.rollNumber}</td>
                  <td className="name-cell">
                    <strong>{student.studentName}</strong>
                    <div className="attendance-attendancemarking-student-id">
                      {student.studentId}
                    </div>
                  </td>
                  <td className="status-cell">
                    <div className="attendance-attendancemarking-status-buttons">
                      {ATTENDANCE_STATUS.map((status) => (
                        <button
                          key={status.value}
                          className={`attendance-attendancemarking-status-btn ${student.status === status.value ? "active" : ""} 
                            ${isAttendanceAlreadyMarked ? "disabled" : ""}`}
                          onClick={() =>
                            handleStatusChange(student.studentId, status.value)
                          }
                          disabled={
                            isAttendanceAlreadyMarked ||
                            (holidayInfo && !holidayInfo.isWorkingDay)
                          }
                        >
                          {isAttendanceAlreadyMarked && <Lock size={12} />}
                          {status.icon} {status.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="remarks-cell">
                    <input
                      type="text"
                      placeholder={
                        holidayInfo && !holidayInfo.isWorkingDay
                          ? holidayInfo.name
                          : isAttendanceAlreadyMarked
                            ? "Edit in Records"
                            : "Enter remarks..."
                      }
                      value={remarks[student.studentId] || ""}
                      onChange={(e) =>
                        handleRemarksChange(student.studentId, e.target.value)
                      }
                      className="attendance-attendancemarking-remarks-input"
                      disabled={
                        isAttendanceAlreadyMarked ||
                        (holidayInfo && !holidayInfo.isWorkingDay)
                      }
                      readOnly={isAttendanceAlreadyMarked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarking;
