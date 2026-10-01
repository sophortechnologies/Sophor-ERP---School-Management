// src/modules/timetable/components/TimetableForm.jsx
import React, { useState, useEffect } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { useTimetable } from "../hooks/useTimetable";
import { TIME_SLOTS, WEEK_DAYS } from "../constants/timetable.constants";
import { sectionSubjectService } from "../../assignments/services/sectionSubject.service";

const TimetableForm = ({
  isOpen,
  onClose,
  initialData,
  classes,
  sectionsByClass,
  subjects,
  teachers,
  onRefresh,
  existingTimetable = [],
}) => {
  const { createSlot, updateSlot } = useTimetable();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [formData, setFormData] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "MON",
    timeSlot: "08:00 - 08:45",
  });

  // Get available time slots based on selected day and section
  const getAvailableTimeSlots = (day, sectionId) => {
    if (!sectionId || !existingTimetable.length)
      return TIME_SLOTS.filter((slot) => !slot.isBreak);

    const existingSlotsForDay = existingTimetable.filter(
      (slot) =>
        slot.dayOfWeek === day && slot.sectionId === parseInt(sectionId),
    );

    const occupiedSlots = existingSlotsForDay.map(
      (slot) => `${slot.formattedStartTime} - ${slot.formattedEndTime}`,
    );

    return TIME_SLOTS.filter(
      (slot) => !occupiedSlots.includes(slot.value) && !slot.isBreak,
    );
  };

  // Fetch teachers who are assigned to teach this subject in this section
  const fetchAssignedTeachers = async (sectionId, subjectId) => {
    if (!sectionId || !subjectId) {
      setAvailableTeachers([]);
      return;
    }

    setLoadingTeachers(true);
    try {
      const sectionSubjects =
        await sectionSubjectService.listBySectionId(sectionId);

      const subjectAssignments = sectionSubjects.filter(
        (assignment) => assignment.subjectId === parseInt(subjectId),
      );

      const assignedTeacherIds = subjectAssignments.map((a) => a.teacherId);

      const filteredTeachers = teachers.filter((teacher) =>
        assignedTeacherIds.includes(teacher.id),
      );

      setAvailableTeachers(filteredTeachers);

      if (
        formData.teacherId &&
        !filteredTeachers.some((t) => t.id === parseInt(formData.teacherId))
      ) {
        setFormData((prev) => ({ ...prev, teacherId: "" }));
      }
    } catch (error) {
      console.error("Error fetching assigned teachers:", error);
      setAvailableTeachers([]);
      setError("Failed to load assigned teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Update available sections when class changes
  useEffect(() => {
    if (formData.classId && sectionsByClass) {
      const sections = sectionsByClass[formData.classId] || [];
      setAvailableSections(sections);
      setFormData((prev) => ({
        ...prev,
        sectionId: "",
        subjectId: "",
        teacherId: "",
      }));
      setAvailableTeachers([]);
    } else {
      setAvailableSections([]);
    }
  }, [formData.classId, sectionsByClass]);

  // Update available teachers when section or subject changes
  useEffect(() => {
    if (formData.sectionId && formData.subjectId) {
      fetchAssignedTeachers(formData.sectionId, formData.subjectId);
    } else {
      setAvailableTeachers([]);
    }
  }, [formData.sectionId, formData.subjectId, teachers]);

  // Update available time slots when day or section changes
  useEffect(() => {
    if (formData.sectionId && formData.dayOfWeek) {
      const available = getAvailableTimeSlots(
        formData.dayOfWeek,
        formData.sectionId,
      );
      setAvailableTimeSlots(available);

      if (!available.some((slot) => slot.value === formData.timeSlot)) {
        setFormData((prev) => ({
          ...prev,
          timeSlot: available[0]?.value || "",
        }));
      }
    }
  }, [formData.dayOfWeek, formData.sectionId, existingTimetable]);

  // Initialize form with initialData for editing
  useEffect(() => {
    if (initialData) {
      let foundClassId = "";
      if (initialData.sectionId && sectionsByClass) {
        for (const [classId, sections] of Object.entries(sectionsByClass)) {
          if (sections.some((s) => s.id === initialData.sectionId)) {
            foundClassId = classId;
            break;
          }
        }
      }

      const timeSlotValue = `${initialData.formattedStartTime} - ${initialData.formattedEndTime}`;

      setFormData({
        classId: foundClassId,
        sectionId: initialData.sectionId || "",
        subjectId: initialData.subjectId || "",
        teacherId: initialData.teacherId || "",
        dayOfWeek: initialData.dayOfWeek || "MON",
        timeSlot:
          TIME_SLOTS.find((slot) => slot.value === timeSlotValue)?.value ||
          TIME_SLOTS[0].value,
      });
    }
  }, [initialData, sectionsByClass]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "subjectId") {
      setFormData((prev) => ({ ...prev, teacherId: "" }));
      setAvailableTeachers([]);
    }
  };

  const formatTimeForAPI = (timeSlotValue) => {
    const slot = TIME_SLOTS.find((s) => s.value === timeSlotValue);
    if (!slot) return null;

    // Parse hours and minutes
    const [startHour, startMinute] = slot.start.split(":").map(Number);
    const [endHour, endMinute] = slot.end.split(":").map(Number);

    // Create ISO strings WITHOUT timezone (using Z for UTC but we'll treat as local)
    // Use a fixed date (2000-01-01) and set the exact time
    const pad = (num) => String(num).padStart(2, "0");

    // Send as local time by using a non-UTC format
    // This sends "2000-01-01T10:15:00.000" (no Z) which the backend will treat as local
    const startTimeStr = `2000-01-01T${pad(startHour)}:${pad(startMinute)}:00.000`;
    const endTimeStr = `2000-01-01T${pad(endHour)}:${pad(endMinute)}:00.000`;

    console.log("Sending times as local:", startTimeStr, endTimeStr);

    return {
      startTime: startTimeStr,
      endTime: endTimeStr,
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.sectionId) {
      setError("Please select a section");
      return;
    }
    if (!formData.subjectId) {
      setError("Please select a subject");
      return;
    }
    if (!formData.teacherId) {
      setError("Please select a teacher");
      return;
    }
    if (!formData.timeSlot) {
      setError("Please select a time slot");
      return;
    }

    const selectedSlot = TIME_SLOTS.find((s) => s.value === formData.timeSlot);
    if (selectedSlot?.isBreak) {
      setError("Cannot schedule classes during break time");
      return;
    }

    const teacherIdNum = parseInt(formData.teacherId);
    const subjectIdNum = parseInt(formData.subjectId);
    const sectionIdNum = parseInt(formData.sectionId);

    if (isNaN(teacherIdNum) || teacherIdNum <= 0) {
      setError("Invalid teacher selection");
      return;
    }

    if (isNaN(subjectIdNum) || subjectIdNum <= 0) {
      setError("Invalid subject selection");
      return;
    }

    if (isNaN(sectionIdNum) || sectionIdNum <= 0) {
      setError("Invalid section selection");
      return;
    }

    const times = formatTimeForAPI(formData.timeSlot);
    if (!times) {
      setError("Invalid time slot");
      return;
    }

    setLoading(true);

    const payload = {
      sectionId: sectionIdNum,
      subjectId: subjectIdNum,
      teacherId: teacherIdNum,
      dayOfWeek: formData.dayOfWeek,
      startTime: times.startTime,
      endTime: times.endTime,
    };

    console.log("Submitting payload:", payload);
    console.log("Selected time slot:", formData.timeSlot);
    console.log("Start time:", times.startTime);
    console.log("End time:", times.endTime);

    try {
      const response = initialData
        ? await updateSlot(initialData.id, payload)
        : await createSlot(payload);

      if (response.success) {
        alert(
          initialData
            ? "Timetable updated successfully!"
            : "Timetable created successfully!",
        );
        onClose();
        if (onRefresh) onRefresh();
      } else {
        setError(response.message || "Failed to save timetable slot");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Edit Timetable Slot" : "Add Timetable Slot"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Class (Grade) *</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              required
              disabled={!!initialData}
            >
              <option value="">Select Class</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Section *</label>
            <select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              required
              disabled={!formData.classId || !!initialData}
            >
              <option value="">
                {!formData.classId ? "First select a class" : "Select Section"}
              </option>
              {availableSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Day of Week *</label>
            <select
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              required
            >
              {WEEK_DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Time Slot *</label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              required
              disabled={!formData.sectionId}
            >
              <option value="">
                {!formData.sectionId
                  ? "First select a section"
                  : "Select Time Slot"}
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.value}
                </option>
              ))}
            </select>
            {formData.sectionId && availableTimeSlots.length === 0 && (
              <small className="error-text">
                No available time slots for this day. All slots are occupied.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              required
              disabled={!formData.sectionId}
            >
              <option value="">
                {!formData.sectionId
                  ? "First select a section"
                  : "Select Subject"}
              </option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {subject.code && `(${subject.code})`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Teacher *</label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              required
              disabled={!formData.subjectId || availableTeachers.length === 0}
            >
              <option value="">
                {!formData.subjectId
                  ? "First select a subject"
                  : loadingTeachers
                    ? "Loading assigned teachers..."
                    : availableTeachers.length === 0
                      ? "No teachers assigned to this subject in this section"
                      : "Select Teacher"}
              </option>
              {availableTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            {formData.subjectId &&
              formData.sectionId &&
              availableTeachers.length === 0 &&
              !loadingTeachers && (
                <small className="error-text">
                  ⚠️ No teacher assigned to teach this subject in this section.
                </small>
              )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading ||
                availableTimeSlots.length === 0 ||
                availableTeachers.length === 0
              }
            >
              {loading ? "Saving..." : initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimetableForm;
