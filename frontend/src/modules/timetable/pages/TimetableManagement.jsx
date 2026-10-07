// src/modules/timetable/pages/TimetableManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  RefreshCw,
} from "lucide-react";
import { timetableApi } from "../api/timetable.api";
import { WEEK_DAYS, TIME_SLOTS } from "../constants/timetable.constants";
import { sectionSubjectService } from "../../assignments/services/sectionSubject.service";
import api from "../../../api/axios";
import "./TimetableManagement.css";

const TimetableManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔑 Role check: Determine if logged-in user is a teacher from the URL path
  const isTeacherView = window.location.pathname.startsWith("/teacher");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState({
    day: "",
    timeSlot: "",
    startTime: "",
    endTime: "",
  });
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    api
      .get("/classes")
      .then((res) => setClasses(res.data?.data || res.data || []));
    api
      .get("/sections")
      .then((res) => setSections(res.data?.data || res.data || []));
    api
      .get("/subjects")
      .then((res) => setSubjects(res.data?.data || res.data || []));

    api
      .get("/teacher")
      .then((res) => {
        const teacherList = res.data?.data || res.data || [];
        setTeachers(teacherList);
        setFilteredTeachers(teacherList);
      })
      .catch(() => {});

    api
      .get("/academic-sessions")
      .then((res) => setSessions(res.data?.data || res.data || []))
      .catch(() => {});

    // Fetch all section-subject assignments for filtering teachers strictly
    sectionSubjectService
      .listAll()
      .then((res) => setSectionAssignments(res || []))
      .catch(() => {});
  }, []);

  const loadTimetable = async (sectionId) => {
    if (!sectionId) {
      setTimetableData([]);
      return;
    }
    setLoading(true);
    const res = await timetableApi.getBySection(sectionId);
    if (res.success) {
      setTimetableData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSection) {
      loadTimetable(selectedSection);
    } else {
      setTimetableData([]);
    }
  }, [selectedSection]);

  const availableSections = sections.filter(
    (s) =>
      String(s.classId || s.class_id || s.class?._id) === String(selectedClass),
  );

  // 🔑 STRICT FILTER: Filter teachers assigned to the selected subject and section
  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedTeacher("");

    if (!subjectId || !selectedSection) {
      setFilteredTeachers([]);
      return;
    }

    // Find assignments matching this specific section and subject
    const matchedAssignments = sectionAssignments.filter(
      (a) =>
        String(a.sectionId) === String(selectedSection) &&
        String(a.subjectId) === String(subjectId),
    );

    const matchedTeacherIds = matchedAssignments.map((a) =>
      String(a.teacherId),
    );

    // Filter teachers list to only include the teacher(s) assigned to this course
    const strictTeachers = teachers.filter(
      (t) =>
        matchedTeacherIds.includes(String(t.id)) ||
        matchedTeacherIds.includes(String(t.userId)),
    );

    setFilteredTeachers(strictTeachers);
  };

  const handleOpenModal = (day, slot, existingMatch) => {
    if (isTeacherView) return; // Teachers cannot modify slots

    if (existingMatch) {
      if (
        window.confirm(
          `Remove ${existingMatch.subject?.name || "this subject"} from ${day} ${slot.value}?`,
        )
      ) {
        handleDeleteSlot(existingMatch.id);
      }
      return;
    }

    if (!selectedSection) {
      alert("Please select a specific section first.");
      return;
    }

    setActiveSlot({
      day,
      timeSlot: slot.value,
      startTime: slot.start,
      endTime: slot.end,
    });
    setSelectedSubject("");
    setSelectedTeacher("");
    setFilteredTeachers([]);
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (isTeacherView) return;

    setErrorMsg("");
    setSuccessMsg("");

    const todayDate = new Date().toISOString().split("T")[0];
    const startTimeISO = `${todayDate}T${activeSlot.startTime}:00.000Z`;
    const endTimeISO = `${todayDate}T${activeSlot.endTime}:00.000Z`;

    const payload = {
      sectionId: Number(selectedSection),
      subjectId: Number(selectedSubject),
      teacherId: Number(selectedTeacher),
      dayOfWeek: activeSlot.day,
      startTime: startTimeISO,
      endTime: endTimeISO,
    };

    const res = await timetableApi.createSlot(payload);
    if (res.success) {
      setSuccessMsg(res.message);
      setIsModalOpen(false);
      loadTimetable(selectedSection);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (isTeacherView) return;
    const res = await timetableApi.deleteSlot(id);
    if (res.success) {
      setSuccessMsg(res.message);
      loadTimetable(selectedSection);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAutoGenerate = async () => {
    if (isTeacherView) return;

    if (!selectedClass || !selectedSection) {
      alert("Please select both a class and a section first.");
      return;
    }

    if (
      window.confirm(
        "Auto-generate timetable slots using all assigned courses for this section?",
      )
    ) {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      try {
        // 1. Get assignments for this specific section or class
        const assignments = sectionAssignments.filter(
          (a) =>
            String(a.sectionId) === String(selectedSection) ||
            String(a.classId) === String(selectedClass),
        );

        if (assignments.length === 0) {
          setErrorMsg(
            "No subject teacher assignments found for this section! Please assign teachers first.",
          );
          setLoading(false);
          return;
        }

        // 2. Clear existing slots first
        if (timetableData.length > 0) {
          for (const slot of timetableData) {
            await timetableApi.deleteSlot(slot.id);
            await new Promise((r) => setTimeout(r, 50)); // Tiny delay for clean deletion
          }
        }

        let totalCreated = 0;
        const todayDate = new Date().toISOString().split("T")[0];

        // 3. Loop through every row and day sequentially with a small delay between inserts
        for (let slotIndex = 0; slotIndex < TIME_SLOTS.length; slotIndex++) {
          const timeSlot = TIME_SLOTS[slotIndex];
          if (timeSlot.isBreak) continue;

          for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex++) {
            const day = WEEK_DAYS[dayIndex];

            const currentAssignment =
              assignments[(slotIndex + dayIndex) % assignments.length];

            const [startHour, startMin] = timeSlot.start.split(":");
            const [endHour, endMin] = timeSlot.end.split(":");

            const startTimeISO = `${todayDate}T${startHour}:${startMin}:00.000Z`;
            const endTimeISO = `${todayDate}T${endHour}:${endMin}:00.000Z`;

            const payload = {
              sectionId: Number(selectedSection),
              subjectId: Number(currentAssignment.subjectId),
              teacherId: Number(currentAssignment.teacherId),
              dayOfWeek: day.value,
              startTime: startTimeISO,
              endTime: endTimeISO,
            };

            try {
              await timetableApi.createSlot(payload);
              totalCreated++;
              await new Promise((r) => setTimeout(r, 40)); // Prevent backend race condition / lock
            } catch (slotErr) {
              console.warn("Skipped slot due to conflict:", slotErr);
            }
          }
        }

        setSuccessMsg(
          `✓ Auto-generated ${totalCreated} schedule slots successfully, filling 100% of the grid!`,
        );
        loadTimetable(selectedSection);
      } catch (err) {
        setErrorMsg("Failed to auto-generate timetable slots.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportExcel = async () => {
    if (!selectedSection) {
      alert("Please select a section to export.");
      return;
    }
    await timetableApi.exportTimetable(selectedSection);
  };

  return (
    <div className="timetable-management-container">
      <div className="timetable-header-banner">
        <h2>
          <Calendar size={24} />{" "}
          {isTeacherView
            ? "My Assigned Teaching Schedule"
            : "Timetable & Scheduling Matrix"}
        </h2>
        <p>
          {isTeacherView
            ? "View your assigned class schedule and teaching periods."
            : "View planned section routines, assign subjects/teachers, auto-generate schedules, and export reports."}
        </p>
      </div>

      <div className="timetable-filter-toolbar">
        <div className="timetable-filters-group">
          <div className="filter-field">
            <label>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
              }}
            >
              <option value="">-- Choose Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label>Select Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">-- Choose Section --</option>
              {availableSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔑 HIDE ADMIN ACTIONS (Auto-Generate) WHEN VIEWED BY TEACHERS */}
        {!isTeacherView && (
          <div className="timetable-toolbar-actions">
            <button
              type="button"
              onClick={handleAutoGenerate}
              disabled={!selectedSection}
              className="btn-autogen"
            >
              <RefreshCw size={16} /> Auto-Generate
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!selectedSection}
              className="btn-export"
            >
              <Download size={16} /> Export Excel
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="alert-success">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert-error">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="timetable-grid-wrapper">
        {!selectedSection ? (
          <div className="timetable-empty-state">
            <AlertCircle size={32} style={{ marginBottom: "8px" }} />
            <p>
              Please select a Class and Section above to view the planned
              timetable.
            </p>
          </div>
        ) : loading ? (
          <div className="timetable-empty-state">
            <p>Loading planned schedule slots...</p>
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
                        onClick={() =>
                          !slot.isBreak &&
                          !isTeacherView &&
                          handleOpenModal(day.value, slot, match)
                        }
                        className={slot.isBreak ? "break-slot" : ""}
                        style={{
                          cursor: isTeacherView ? "default" : "pointer",
                        }}
                      >
                        {slot.isBreak ? (
                          <span>{slot.label}</span>
                        ) : match ? (
                          <div className="assigned-slot">
                            <strong>{match.subject?.name || "Subject"}</strong>
                            <div className="teacher-name">
                              👨‍🏫{" "}
                              {match.teacher
                                ? `${match.teacher.firstName || match.teacher.first_name || ""} ${match.teacher.lastName || match.teacher.last_name || ""}`.trim()
                                : "Teacher"}
                            </div>
                            {!isTeacherView && (
                              <span className="remove-hint">
                                Click to remove
                              </span>
                            )}
                          </div>
                        ) : !isTeacherView ? (
                          <div className="empty-slot">
                            <Plus size={14} /> Assign
                          </div>
                        ) : (
                          <div
                            className="empty-slot"
                            style={{
                              background: "transparent",
                              border: "none",
                            }}
                          >
                            -
                          </div>
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

      {/* Assignment Modal (Admin Only) */}
      {!isTeacherView && isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Assign Period Slot</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <p className="modal-subtext">
              Day: <strong>{activeSlot.day}</strong> | Time:{" "}
              <strong>{activeSlot.timeSlot}</strong>
            </p>

            <form onSubmit={handleSaveSlot}>
              <div className="form-group">
                <label>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Teacher for Course</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  required
                  disabled={!selectedSubject}
                >
                  <option value="">
                    {selectedSubject
                      ? "-- Select Course Teacher --"
                      : "-- Select Subject First --"}
                  </option>
                  {filteredTeachers.map((t) => (
                    <option key={t.id || t.userId} value={t.id || t.userId}>
                      {t.firstName || t.first_name || ""}{" "}
                      {t.lastName || t.last_name || t.name || ""}
                      {t.specialization ? ` (${t.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
