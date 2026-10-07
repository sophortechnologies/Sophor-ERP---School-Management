// src/modules/timetable/utils/conflictDetector.js - FIXED VERSION
import { timetableConstants } from '../constants';

/**
 * Conflict Detection Utility
 */
const conflictDetector = {
  /**
   * Detect all conflicts in a timetable
   */
  detectAllConflicts: async (timetable) => {
    console.log("🔍 Starting conflict detection...");
    
    const conflicts = [];
    
    try {
      // Check if timetable has data
      if (!timetable) {
        console.log("⚠️ No timetable data provided");
        return conflicts;
      }
      
      // Detect teacher conflicts
      const teacherConflicts = conflictDetector.detectTeacherConflicts(timetable);
      conflicts.push(...teacherConflicts);
      
      // Detect room conflicts
      const roomConflicts = conflictDetector.detectRoomConflicts(timetable);
      conflicts.push(...roomConflicts);
      
      // Detect workload conflicts
      const workloadConflicts = conflictDetector.detectWorkloadConflicts(timetable);
      conflicts.push(...workloadConflicts);
      
      // Detect timing conflicts
      const timingConflicts = conflictDetector.detectTimingConflicts(timetable);
      conflicts.push(...timingConflicts);
      
      console.log(`✅ Found ${conflicts.length} conflicts`);
      
    } catch (error) {
      console.error("❌ Error in conflict detection:", error);
    }
    
    // Add IDs and timestamps
    return conflicts.map((conflict, index) => ({
      id: `conflict_${Date.now()}_${index}`,
      ...conflict,
      detectedAt: new Date().toISOString(),
      resolved: false,
      ignored: false
    }));
  },

  /**
   * Detect teacher conflicts
   */
  detectTeacherConflicts: (timetable) => {
    const conflicts = [];
    
    if (!timetable) return conflicts;
    
    const teacherSchedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const daySchedule = timetable[day] || [];
      
      daySchedule.forEach((period, periodIndex) => {
        if (!period || !period.teacherName || period.isBreak || period.subjectName === 'Free') return;
        
        const timeSlot = `${day}_${periodIndex}`;
        
        if (!teacherSchedule[period.teacherName]) {
          teacherSchedule[period.teacherName] = new Set();
        }
        
        if (teacherSchedule[period.teacherName].has(timeSlot)) {
          conflicts.push({
            type: 'teacher_conflict',
            severity: 'severe',
            title: 'Teacher Double Booking',
            description: `Teacher ${period.teacherName} is scheduled for multiple classes at the same time`,
            details: `Conflict on ${day}, Period ${periodIndex + 1} (${period.startTime})`,
            suggestions: 'Reschedule one of the conflicting periods or assign a different teacher',
            affectedTeachers: [period.teacherName],
            teacherName: period.teacherName,
            day: day,
            periodIndex: periodIndex
          });
        } else {
          teacherSchedule[period.teacherName].add(timeSlot);
        }
      });
    });
    
    return conflicts;
  },

  /**
   * Detect room conflicts
   */
  detectRoomConflicts: (timetable) => {
    const conflicts = [];
    
    if (!timetable) return conflicts;
    
    const roomSchedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const daySchedule = timetable[day] || [];
      
      daySchedule.forEach((period, periodIndex) => {
        if (!period || !period.roomNumber || period.isBreak || period.subjectName === 'Free') return;
        
        const timeSlot = `${day}_${periodIndex}`;
        
        if (!roomSchedule[timeSlot]) {
          roomSchedule[timeSlot] = new Set();
        }
        
        if (roomSchedule[timeSlot].has(period.roomNumber)) {
          conflicts.push({
            type: 'room_conflict',
            severity: 'severe',
            title: 'Room Double Booking',
            description: `Room ${period.roomNumber} is booked for multiple classes at the same time`,
            details: `Conflict on ${day}, Period ${periodIndex + 1}`,
            suggestions: 'Move one of the classes to a different room or reschedule the period',
            affectedRooms: [period.roomNumber],
            roomName: period.roomNumber,
            day: day,
            periodIndex: periodIndex
          });
        } else {
          roomSchedule[timeSlot].add(period.roomNumber);
        }
      });
    });
    
    return conflicts;
  },

  /**
   * Detect workload conflicts
   */
  detectWorkloadConflicts: (timetable) => {
    const conflicts = [];
    
    if (!timetable) return conflicts;
    
    const teacherWorkload = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Count periods per teacher per day
    days.forEach(day => {
      const daySchedule = timetable[day] || [];
      
      daySchedule.forEach(period => {
        if (!period || !period.teacherName || period.isBreak || period.subjectName === 'Free') return;
        
        if (!teacherWorkload[period.teacherName]) {
          teacherWorkload[period.teacherName] = {
            count: 0,
            name: period.teacherName,
            days: new Set()
          };
        }
        
        teacherWorkload[period.teacherName].count++;
        teacherWorkload[period.teacherName].days.add(day);
      });
    });
    
    // Check for workload issues
    Object.entries(teacherWorkload).forEach(([teacherName, workload]) => {
      // Check if teacher has more than 6 periods per day on average
      const averagePerDay = workload.count / Math.max(1, workload.days.size);
      
      if (averagePerDay > 6) {
        conflicts.push({
          type: 'workload_exceeded',
          severity: 'warning',
          title: 'Teacher Overworked',
          description: `${workload.name} has average of ${averagePerDay.toFixed(1)} periods per day`,
          details: `Total ${workload.count} periods across ${workload.days.size} days`,
          suggestions: 'Redistribute some periods to other teachers',
          affectedTeachers: [teacherName],
          currentWorkload: workload.count,
          averagePerDay: averagePerDay
        });
      }
    });
    
    return conflicts;
  },

  /**
   * Detect timing conflicts
   */
  detectTimingConflicts: (timetable) => {
    const conflicts = [];
    
    if (!timetable) return conflicts;
    
    const periodTimes = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Group periods by day and time
    days.forEach(day => {
      const daySchedule = timetable[day] || [];
      
      daySchedule.forEach(period => {
        if (period.isBreak) return;
        
        const timeKey = `${period.startTime}_${period.endTime}`;
        
        if (!periodTimes[day]) {
          periodTimes[day] = new Set();
        }
        
        if (periodTimes[day].has(timeKey)) {
          conflicts.push({
            type: 'timing_conflict',
            severity: 'warning',
            title: 'Duplicate Period Timing',
            description: 'Multiple periods scheduled at the same time',
            details: `Duplicate on ${day} from ${period.startTime} to ${period.endTime}`,
            suggestions: 'Ensure unique timing for each period',
            day: day,
            startTime: period.startTime,
            endTime: period.endTime
          });
        } else {
          periodTimes[day].add(timeKey);
        }
      });
    });
    
    return conflicts;
  }
};

export default conflictDetector;