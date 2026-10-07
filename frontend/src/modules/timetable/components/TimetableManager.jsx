// src/modules/timetable/components/TimetableManager.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Zap,
  X,
} from "lucide-react";
import { useTimetable } from "../hooks/useTimetable";
import TimetableForm from "./TimetableForm";
import { classesApi } from "../../classes/api/classes.api";
import { subjectApi } from "../../subject/api/subject.api";
import { teacherApi } from "../../teacher/api/teacher.api";
import { TIME_SLOTS, WEEK_DAYS } from "../constants/timetable.constants";
import "./TimetableManager.css";

const TimetableManager = () => {
  const { timetable, loading, loadBySection, deleteSlot, exportToExcel } =
    useTimetable();

  const [classes, setClasses] = useState([]);
  const [sectionsByClass, setSectionsByClass] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classesApi.getClasses();
        const classesData = response.data?.data || response.data || [];
        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  // Load sections for each class
  useEffect(() => {
    const fetchAllSections = async () => {
      const sectionsMap = {};
      for (const cls of classes) {
        try {
          const response = await classesApi.getSectionsByClass(cls.id);
          const sectionsData = response.data?.data || response.data || [];
          sectionsMap[cls.id] = sectionsData;
        } catch (error) {
          console.error(`Error fetching sections for class ${cls.id}:`, error);
          sectionsMap[cls.id] = [];
        }
      }
      setSectionsByClass(sectionsMap);
    };
    if (classes.length > 0) {
      fetchAllSections();
    }
  }, [classes]);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getAllSubjects();
        const subjectsData = response.success
          ? response.data
          : response.data?.data || [];
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherApi.getAllTeachers();

        let teachersData = [];
        if (response.success && Array.isArray(response.data)) {
          teachersData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          teachersData = response.data.data;
        }

        const formattedTeachers = teachersData.map((teacher) => {
          const userId = teacher.userId || teacher.id;
          return {
            id: userId,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
          };
        });

        setTeachers(formattedTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // Update available sections when class changes
  useEffect(() => {
    if (selectedClass && sectionsByClass[selectedClass]) {
      setAvailableSections(sectionsByClass[selectedClass]);
      setSelectedSection("");
    } else {
      setAvailableSections([]);
    }
  }, [selectedClass, sectionsByClass]);

  // Load timetable when section changes
  useEffect(() => {
    if (selectedSection) {
      loadBySection(selectedSection);
    }
  }, [selectedSection, loadBySection]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this timetable slot?")) {
      const res = await deleteSlot(id);
      if (res.success) {
        loadBySection(selectedSection);
        alert("Deleted successfully");
      } else alert(`Error: ${res.message}`);
    }
  };

  const handleExport = async () => {
    if (selectedSection) {
      await exportToExcel(selectedSection);
    }
  };

  const handleRefresh = () => {
    if (selectedSection) loadBySection(selectedSection);
  };

  const getClassName = (classId) => {
    const cls = classes.find((c) => c.id === parseInt(classId));
    return cls ? cls.name : "";
  };

  const getSectionName = (sectionId) => {
    const section = availableSections.find((s) => s.id === parseInt(sectionId));
    return section ? section.name : "";
  };

  // Helper function to normalize time string for comparison
  const normalizeTimeString = (timeStr) => {
    // Convert "8:00" to "08:00"
    if (timeStr && !timeStr.includes(":")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const hour = parts[0].padStart(2, "0");
      const minute = parts[1].padStart(2, "0");
      return `${hour}:${minute}`;
    }
    return timeStr;
  };

  // Create a lookup map for timetable slots using normalized time comparison
  const getSlotForDayAndTime = (dayValue, timeSlotValue) => {
    // Parse the time slot value (e.g., "08:00 - 08:45")
    const [startTimeStr, endTimeStr] = timeSlotValue.split(" - ");

    const normalizedStart = normalizeTimeString(startTimeStr);
    const normalizedEnd = normalizeTimeString(endTimeStr);

    // Find matching slot by comparing normalized times
    const slot = timetable.find((s) => {
      if (s.dayOfWeek !== dayValue) return false;

      // Get slot's start and end times
      const slotStart =
        s.formattedStartTime ||
        new Date(s.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      const slotEnd =
        s.formattedEndTime ||
        new Date(s.endTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

      const normalizedSlotStart = normalizeTimeString(slotStart);
      const normalizedSlotEnd = normalizeTimeString(slotEnd);

      return (
        normalizedSlotStart === normalizedStart &&
        normalizedSlotEnd === normalizedEnd
      );
    });

    return slot;
  };

  if (loading && !timetable.length) {
    return (
      <div className="timetable-timetablemanager-loading-container">
        <div className="timetable-timetablemanager-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="timetable-timetablemanager-timetable-manager">
      <div className="timetable-timetablemanager-timetable-header">
        <h1>
          <Calendar size={24} /> Timetable Management
        </h1>
        <div className="timetable-timetablemanager-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add Slot
          </button>
          <button
            className="btn timetable-timetablemanager-btn-secondary"
            onClick={handleExport}
            disabled={!selectedSection}
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button className="timetable-timetablemanager-btn-icon" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Class & Section Selection */}
      <div className="timetable-timetablemanager-selection-section">
        <div className="timetable-timetablemanager-selection-card">
          <h3>1. Select Class</h3>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Grade/Class --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="timetable-timetablemanager-selection-card">
          <h3>2. Select Section</h3>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">
              {!selectedClass ? "First select a class" : "-- Select Section --"}
            </option>
            {availableSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Display */}
      {selectedSection && (
        <div className="timetable-timetablemanager-timetable-info">
          <div className="timetable-timetablemanager-info-header">
            <h2>
              Timetable: {getClassName(selectedClass)} -{" "}
              {getSectionName(selectedSection)}
            </h2>
          </div>
          <div className="timetable-grid-wrapper">
            <div className="timetable-timetablemanager-timetable-grid">
              {/* Header Row - Days */}
              <div className="timetable-timetablemanager-grid-header">
                <div className="timetable-timetablemanager-time-col">Time / Day</div>
                {WEEK_DAYS.map((day) => (
                  <div key={day.value} className="timetable-timetablemanager-day-col">
                    {day.label}
                  </div>
                ))}
              </div>

              {/* Time Slot Rows - Use TIME_SLOTS from constants */}
              {TIME_SLOTS.map((timeSlot) => {
                // Check if this is a break slot
                const isBreak = timeSlot.isBreak;

                return (
                  <div key={timeSlot.value} className="timetable-timetablemanager-grid-row">
                    <div className="timetable-timetablemanager-time-col">
                      <span
                        className={`time-label ${isBreak ? "break-time" : ""}`}
                      >
                        {timeSlot.value}
                      </span>
                    </div>
                    {WEEK_DAYS.map((day) => {
                      const slot = getSlotForDayAndTime(
                        day.value,
                        timeSlot.value,
                      );

                      if (isBreak) {
                        return (
                          <div key={day.value} className="timetable-timetablemanager-day-col break-cell">
                            <div className="break-slot">Lunch Break</div>
                          </div>
                        );
                      }

                      if (slot) {
                        return (
                          <div key={day.value} className="timetable-timetablemanager-day-col">
                            <div className="timetable-timetablemanager-timetable-cell">
                              <div className="timetable-timetablemanager-subject">{slot.subjectName}</div>
                              <div className="timetable-timetablemanager-teacher">{slot.teacherName}</div>
                              <div className="timetable-timetablemanager-cell-actions">
                                <button
                                  className="timetable-timetablemanager-edit-btn"
                                  onClick={() => {
                                    setEditingSlot(slot);
                                    setShowForm(true);
                                  }}
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  className="timetable-timetablemanager-delete-btn"
                                  onClick={() => handleDelete(slot.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={day.value} className="timetable-timetablemanager-day-col">
                          <div className="timetable-timetablemanager-empty-cell">—</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedSection && timetable.length === 0 && !loading && (
        <div className="timetable-timetablemanager-empty-state">
          <Calendar size={48} />
          <h3>No Timetable Found</h3>
          <p>Click "Add Slot" to add timetable entries manually.</p>
          <small>(Auto-generation coming soon)</small>
        </div>
      )}

      {/* Slot Form Modal */}
      {showForm && (
        <TimetableForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingSlot(null);
            handleRefresh();
          }}
          initialData={editingSlot}
          classes={classes}
          sectionsByClass={sectionsByClass}
          subjects={subjects}
          teachers={teachers}
          onRefresh={handleRefresh}
          existingTimetable={timetable}
        />
      )}
    </div>
  );
};

export default TimetableManager;
