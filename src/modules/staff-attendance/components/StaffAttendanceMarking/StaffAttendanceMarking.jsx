// src/modules/staff-attendance/components/StaffAttendanceMarking/StaffAttendanceMarking.jsx
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
  Building,
  Watch,
  UserCheck,
  UserX,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { STAFF_ATTENDANCE_STATUS } from "../../constants";
import { formatDateForDisplay } from "../../utils";
import "./StaffAttendanceMarking.css";

const StaffAttendanceMarking = ({
  date,
  staffMembers,
  existingAttendance = [],
  onSave,
  onCancel,
  isAttendanceAlreadyMarked: propIsAttendanceAlreadyMarked = false,
}) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [bulkStatus, setBulkStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  // Check if date is weekend or holiday
  useEffect(() => {
    const today = new Date(date);
    const day = today.getDay();

    if (day === 0 || day === 6) {
      setIsHoliday(true);
      setHolidayName(day === 0 ? "Sunday" : "Saturday");
    } else {
      setIsHoliday(false);
      setHolidayName("");
    }
  }, [date]);

  // Initialize attendance list
  useEffect(() => {
    if (isHoliday) {
      const holidayAttendance = staffMembers.map((staff) => ({
        userId: staff.userId || staff.id,
        employeeName: staff.employeeName || staff.name,
        designation: staff.designation || "",
        status: "HOLIDAY",
        remarks: holidayName,
        alreadyMarked: true,
      }));
      setAttendanceList(holidayAttendance);
      return;
    }

    const initialAttendance = staffMembers.map((staff) => {
      const staffUserId = staff.userId || staff.id;
      const existing = existingAttendance.find(
        (a) => Number(a.userId) === Number(staffUserId),
      );

      return {
        userId: staffUserId,
        employeeName: staff.employeeName || staff.name,
        designation: staff.designation || "",
        status: existing?.status || "",
        remarks: existing?.remarks || "",
        alreadyMarked: !!existing,
        existingId: existing?.id || null,
      };
    });

    setAttendanceList(initialAttendance);

    // Initialize remarks
    const initialRemarks = {};
    existingAttendance.forEach((record) => {
      if (record.remarks) {
        initialRemarks[record.userId] = record.remarks;
      }
    });

    setRemarks(initialRemarks);
  }, [staffMembers, existingAttendance, isHoliday, holidayName]);

  // Check if ALL staff are already marked
  const allStaffMarked =
    attendanceList.length > 0 &&
    attendanceList.every((staff) => staff.alreadyMarked);
  const someStaffMarked = attendanceList.some((staff) => staff.alreadyMarked);

  const handleStatusChange = (userId, status) => {
    if (isHoliday) return;

    setAttendanceList((prev) =>
      prev.map((staff) => {
        if (staff.userId === userId) {
          return { ...staff, status, alreadyMarked: false };
        }
        return staff;
      }),
    );
  };

  const handleRemarksChange = (userId, value) => {
    if (isHoliday) return;
    setRemarks((prev) => ({ ...prev, [userId]: value }));
  };

  const applyBulkStatus = () => {
    if (!bulkStatus || isHoliday) return;

    setAttendanceList((prev) =>
      prev.map((staff) => {
        if (!staff.alreadyMarked) {
          return { ...staff, status: bulkStatus, alreadyMarked: false };
        }
        return staff;
      }),
    );
  };

  const handleSave = async () => {
    if (isHoliday) {
      alert(`Cannot mark attendance on ${holidayName}`);
      return;
    }

    const staffToProcess = attendanceList.filter(
      (s) => s.status && s.status.trim() !== "",
    );

    if (staffToProcess.length === 0) {
      alert("Please select attendance status for at least one staff member");
      return;
    }

    const attendanceDataList = staffToProcess
      .map((staff) => {
        const userId = Number(staff.userId);

        return {
          userId: userId,
          date: date,
          status: staff.status,
          remarks: remarks[staff.userId] || "",
          ...(staff.existingId && { id: staff.existingId }),
        };
      })
      .filter((data) => !isNaN(data.userId) && data.userId > 0);

    if (attendanceDataList.length === 0) {
      alert("No valid staff members to mark attendance for");
      return;
    }

    console.log("Saving attendance data:", attendanceDataList);

    setSaving(true);
    try {
      await onSave(attendanceDataList);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert(error.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredAttendance = attendanceList.filter(
    (staff) => filterStatus === "all" || staff.status === filterStatus,
  );

  const statusCounts = attendanceList.reduce((acc, staff) => {
    const status = staff.status || "UNMARKED";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const statusConfig = STAFF_ATTENDANCE_STATUS.find(
      (s) => s.value === status,
    );
    return statusConfig ? statusConfig.color : "#6b7280";
  };

  const markedCount = attendanceList.filter((s) => s.alreadyMarked).length;
  const unmarkedCount = attendanceList.length - markedCount;

  return (
    <div className="staff-attendance-staffattendancemarking-staffattendancemarking-staff-attendance-marking">
      <div className="staff-attendance-staffattendancemarking-staffattendancemarking-marking-header">
        <div className="staff-attendance-staffattendancemarking-staffattendancemarking-header-info">
          <button className="back-button" onClick={onCancel}>
            <ArrowLeft size={20} />
            Back
          </button>
          <h3>Staff Attendance - {formatDateForDisplay(date)}</h3>
          <div className="staff-attendance-staffattendancemarking-staffattendancemarking-header-details">
            <span className="staff-attendance-staffattendancemarking-staffattendancemarking-detail-item">
              <Calendar size={16} />
              Date: <strong>{formatDateForDisplay(date)}</strong>
            </span>
            <span className="staff-attendance-staffattendancemarking-staffattendancemarking-detail-item">
              <Users size={16} />
              Staff: <strong>{staffMembers.length}</strong>
            </span>
            {someStaffMarked && (
              <span className="staff-attendance-staffattendancemarking-staffattendancemarking-detail-item marked-info">
                <Check size={16} color="#10b981" />
                <span>{markedCount} already marked</span>
              </span>
            )}
            {allStaffMarked && !isHoliday && (
              <span className="staff-attendance-staffattendancemarking-staffattendancemarking-detail-item all-marked-warning">
                <AlertCircle size={16} color="#f59e0b" />
                <span>All staff already marked</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="staff-attendance-staffattendancemarking-staffattendancemarking-attendance-content">
        {isHoliday && (
          <div className="staff-attendance-staffattendancemarking-staffattendancemarking-holiday-warning">
            <strong>🎉 Holiday Notice:</strong> Today is {holidayName}. No
            attendance marking required.
          </div>
        )}

        {!isHoliday && (
          <>
            <div className="staff-attendance-staffattendancemarking-staffattendancemarking-quick-stats">
              <div
                className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-item"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-icon">
                  <UserCheck size={20} />
                </div>
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-count">{statusCounts["PRESENT"] || 0}</div>
                <div className="stat-label">Present</div>
              </div>

              <div
                className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-item"
                style={{ background: "#fee2e2", color: "#991b1b" }}
              >
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-icon">
                  <UserX size={20} />
                </div>
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-count">{statusCounts["ABSENT"] || 0}</div>
                <div className="stat-label">Absent</div>
              </div>

              <div
                className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-item"
                style={{ background: "#fef3c7", color: "#92400e" }}
              >
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-icon">
                  <Clock size={20} />
                </div>
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-count">{statusCounts["LATE"] || 0}</div>
                <div className="stat-label">Late</div>
              </div>

              <div
                className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-item"
                style={{ background: "#dbeafe", color: "#1e40af" }}
              >
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-icon">
                  <Watch size={20} />
                </div>
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-count">
                  {statusCounts["HALF_DAY"] || 0}
                </div>
                <div className="stat-label">Half Day</div>
              </div>

              <div
                className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-item"
                style={{ background: "#f3f4f6", color: "#4b5563" }}
              >
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-icon">
                  <Users size={20} />
                </div>
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-stat-count">{unmarkedCount}</div>
                <div className="stat-label">Unmarked</div>
              </div>
            </div>

            {!allStaffMarked && (
              <div className="staff-attendance-staffattendancemarking-staffattendancemarking-bulk-actions">
                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-bulk-control">
                  <label>Apply to All Unmarked:</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="staff-attendance-staffattendancemarking-staffattendancemarking-bulk-select"
                  >
                    <option value="">Select Status</option>
                    {STAFF_ATTENDANCE_STATUS.filter((s) =>
                      [
                        "PRESENT",
                        "ABSENT",
                        "LATE",
                        "HALF_DAY",
                        "LEAVE",
                      ].includes(s.value),
                    ).map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn staff-attendance-staffattendancemarking-staffattendancemarking-btn-secondary"
                    onClick={applyBulkStatus}
                    disabled={!bulkStatus}
                  >
                    <Check size={16} /> Apply
                  </button>
                </div>

                <div className="staff-attendance-staffattendancemarking-staffattendancemarking-filter-control">
                  <label>
                    <Filter size={16} /> Filter by Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="staff-attendance-staffattendancemarking-staffattendancemarking-filter-select"
                  >
                    <option value="all">All Staff</option>
                    <option value="marked">
                      Already Marked ({markedCount})
                    </option>
                    <option value="unmarked">Unmarked ({unmarkedCount})</option>
                    {STAFF_ATTENDANCE_STATUS.filter((s) =>
                      [
                        "PRESENT",
                        "ABSENT",
                        "LATE",
                        "HALF_DAY",
                        "LEAVE",
                      ].includes(s.value),
                    ).map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label} ({statusCounts[status.value] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {allStaffMarked && (
              <div className="all-marked-notice">
                <AlertCircle size={20} />
                <div>
                  <p>
                    <strong>
                      All staff attendance is already marked for this date.
                    </strong>
                  </p>
                  <p className="small-text">
                    You can still update their status by clicking on a different
                    status button.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="staff-attendance-staffattendancemarking-staffattendancemarking-attendance-table-container">
          <table className="staff-attendance-staffattendancemarking-staffattendancemarking-attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((staff) => {
                const statusColor = getStatusColor(staff.status);
                const isAlreadyMarked = staff.alreadyMarked;

                return (
                  <tr
                    key={staff.userId}
                    className={isAlreadyMarked ? "already-marked-row" : ""}
                  >
                    <td className="staff-attendance-staffattendancemarking-staffattendancemarking-employee-id-cell">
                      <strong>{staff.userId}</strong>
                      {isAlreadyMarked && (
                        <span
                          className="already-marked-badge"
                          title="Already Marked"
                        >
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="staff-attendance-staffattendancemarking-staffattendancemarking-name-cell">
                      <strong>{staff.employeeName}</strong>
                    </td>
                    <td className="designation-cell">{staff.designation}</td>
                    <td className="status-cell">
                      <div className="staff-attendance-staffattendancemarking-staffattendancemarking-status-buttons">
                        {STAFF_ATTENDANCE_STATUS.filter((s) =>
                          [
                            "PRESENT",
                            "ABSENT",
                            "LATE",
                            "HALF_DAY",
                            "LEAVE",
                          ].includes(s.value),
                        ).map((status) => (
                          <button
                            key={status.value}
                            className={`staff-attendance-staffattendancemarking-staffattendancemarking-status-btn ${staff.status === status.value ? "active" : ""} ${isAlreadyMarked ? "already-marked-btn" : ""}`}
                            onClick={() =>
                              handleStatusChange(staff.userId, status.value)
                            }
                            style={{
                              backgroundColor:
                                staff.status === status.value
                                  ? `${statusColor}20`
                                  : "transparent",
                              color:
                                staff.status === status.value
                                  ? statusColor
                                  : "#6b7280",
                              borderColor:
                                staff.status === status.value
                                  ? statusColor
                                  : "#e5e7eb",
                              opacity: isAlreadyMarked ? 0.8 : 1,
                              borderStyle: isAlreadyMarked ? "dashed" : "solid",
                            }}
                            title={
                              isAlreadyMarked
                                ? "Click to update existing attendance"
                                : ""
                            }
                          >
                            {status.icon} {status.label}
                            {isAlreadyMarked &&
                              staff.status === status.value && (
                                <span className="update-indicator">
                                  (Update)
                                </span>
                              )}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="remarks-cell">
                      <input
                        type="text"
                        placeholder={
                          isAlreadyMarked
                            ? "Enter new remarks..."
                            : "Enter remarks..."
                        }
                        value={remarks[staff.userId] || ""}
                        onChange={(e) =>
                          handleRemarksChange(staff.userId, e.target.value)
                        }
                        className={`staff-attendance-staffattendancemarking-staffattendancemarking-remarks-input ${isAlreadyMarked ? "already-marked-input" : ""}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isHoliday && (
          <div className="marking-footer">
            <button className="btn staff-attendance-staffattendancemarking-staffattendancemarking-btn-secondary" onClick={onCancel}>
              <X size={16} /> Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || allStaffMarked}
            >
              <Save size={16} />{" "}
              {saving
                ? "Saving..."
                : allStaffMarked
                  ? "All Already Marked"
                  : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAttendanceMarking;
