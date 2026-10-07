// src/modules/timetable/components/TimetableView.jsx
import React, { useMemo } from "react";
import { Clock, User, BookOpen } from "lucide-react";
import {
  TIME_SLOTS,
  WEEK_DAYS,
  PERIOD_TYPES,
} from "../constants/timetable.constants";
import "./TimetableView.css";

const TimetableView = ({ timetable = [], title, viewType = "section" }) => {
  // Create a lookup map for quick access: day_timeSlot -> slot data
  const timetableMap = useMemo(() => {
    const map = new Map();

    timetable.forEach((slot) => {
      // Format the time slot to match TIME_SLOTS value format
      const timeSlotValue = `${slot.formattedStartTime} - ${slot.formattedEndTime}`;
      const key = `${slot.dayOfWeek}_${timeSlotValue}`;
      map.set(key, slot);
    });

    return map;
  }, [timetable]);

  const getSlotForDayAndTime = (dayValue, timeSlotValue) => {
    const key = `${dayValue}_${timeSlotValue}`;
    return timetableMap.get(key);
  };

  const getTeacherName = (slot) => {
    if (slot?.teacherName) return slot.teacherName;
    if (slot?.teacher) {
      return `${slot.teacher.firstName || ""} ${slot.teacher.lastName || ""}`.trim();
    }
    return "Not Assigned";
  };

  return (
    <div className="timetable-timetableview-timetable-view">
      {title && <h2 className="timetable-timetableview-timetable-title">{title}</h2>}

      <div className="timetable-timetableview-timetable-grid-container">
        <table className="timetable-timetableview-timetable-table">
          <thead>
            <tr>
              <th className="timetable-timetableview-day-col-header">Time / Day</th>
              {WEEK_DAYS.map((day) => (
                <th key={day.value} className="timetable-timetableview-day-col-header">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Always iterate over ALL TIME_SLOTS from constants */}
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot.value}>
                <td className="time-col">
                  <span className="time-label">{timeSlot.value}</span>
                </td>
                {WEEK_DAYS.map((day) => {
                  const slot = getSlotForDayAndTime(day.value, timeSlot.value);

                  // Check if this is a break period
                  if (timeSlot.isBreak) {
                    return (
                      <td
                        key={`${day.value}-${timeSlot.value}`}
                        className="timetable-timetableview-slot-cell timetable-timetableview-break-cell"
                      >
                        <div className="timetable-timetableview-break-slot">
                          <span className="timetable-timetableview-break-label">
                            {timeSlot.label || "🍽️ Lunch Break"}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  // Check if there's a scheduled class
                  if (slot) {
                    return (
                      <td
                        key={`${day.value}-${timeSlot.value}`}
                        className="timetable-timetableview-slot-cell"
                      >
                        <div
                          className={`timetable-timetableview-filled-slot ${slot.type === PERIOD_TYPES.LAB ? "lab" : ""} ${slot.type === PERIOD_TYPES.PRACTICAL ? "practical" : ""}`}
                        >
                          <div className="timetable-timetableview-slot-subject">
                            <BookOpen size={12} />
                            <strong>{slot.subjectName}</strong>
                          </div>
                          <div className="timetable-timetableview-slot-teacher">
                            <User size={12} />
                            <span>{getTeacherName(slot)}</span>
                          </div>
                          {slot.subjectCode && (
                            <div className="timetable-timetableview-slot-code">
                              <span className="timetable-timetableview-code-badge">
                                {slot.subjectCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  }

                  // Empty slot - no class scheduled (show dash)
                  return (
                    <td
                      key={`${day.value}-${timeSlot.value}`}
                      className="timetable-timetableview-slot-cell empty-cell"
                    >
                      <div className="timetable-timetableview-empty-slot">
                        <span className="timetable-timetableview-empty-label">—</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {timetable.length === 0 && (
        <div className="timetable-empty-state">
          <Clock size={48} />
          <h3>No Timetable Data</h3>
          <p>Click "Add Slot" to start creating your timetable.</p>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
