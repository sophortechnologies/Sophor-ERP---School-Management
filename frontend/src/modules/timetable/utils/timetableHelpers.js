// src/modules/timetable/utils/timetableHelpers.js
import { timetableConstants } from '../constants';

/**
 * Timetable Helper Functions
 * Utility functions for timetable manipulation and calculations
 */
export const timetableHelpers = {
  /**
   * Calculate period times based on configuration
   * @param {Object} config - Timetable configuration
   * @returns {Array} Array of period time objects
   */
  calculatePeriodTimes: (config) => {
    const {
      startHour = 8,
      startMinute = 0,
      periodsPerDay = 8,
      periodDuration = 45,
      includeBreaks = true,
      breakDuration = 15,
      breakAfterPeriods = 3
    } = config;

    const periods = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    for (let i = 0; i < periodsPerDay; i++) {
      // Calculate start time
      const startTime = this.formatTime(currentHour, currentMinute);

      // Calculate end time
      let endHour = currentHour;
      let endMinute = currentMinute + periodDuration;
      
      while (endMinute >= 60) {
        endHour++;
        endMinute -= 60;
      }
      
      const endTime = this.formatTime(endHour, endMinute);

      periods.push({
        periodNumber: i + 1,
        startTime,
        endTime,
        duration: periodDuration
      });

      // Update current time for next period
      currentHour = endHour;
      currentMinute = endMinute;

      // Add break if configured
      if (includeBreaks && (i + 1) % breakAfterPeriods === 0 && (i + 1) < periodsPerDay) {
        // Add break period
        const breakStartTime = this.formatTime(currentHour, currentMinute);
        
        currentMinute += breakDuration;
        while (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
        
        const breakEndTime = this.formatTime(currentHour, currentMinute);
        
        periods.push({
          periodNumber: `break_${Math.floor((i + 1) / breakAfterPeriods)}`,
          startTime: breakStartTime,
          endTime: breakEndTime,
          duration: breakDuration,
          isBreak: true,
          type: timetableConstants.PERIOD_TYPES.BREAK
        });
      }
    }

    return periods;
  },

  /**
   * Format hour and minute as time string
   * @param {number} hour - Hour (0-23)
   * @param {number} minute - Minute (0-59)
   * @returns {string} Formatted time (HH:MM)
   */
  formatTime: (hour, minute) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  },

  /**
   * Parse time string to hour and minute
   * @param {string} timeString - Time string (HH:MM)
   * @returns {Object} { hour, minute }
   */
  parseTime: (timeString) => {
    if (!timeString) return { hour: 0, minute: 0 };
    
    const [hour, minute] = timeString.split(':').map(Number);
    return { hour: hour || 0, minute: minute || 0 };
  },

  /**
   * Calculate duration between two times in minutes
   * @param {string} startTime - Start time (HH:MM)
   * @param {string} endTime - End time (HH:MM)
   * @returns {number} Duration in minutes
   */
  calculateDuration: (startTime, endTime) => {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    
    return endMinutes - startMinutes;
  },

  /**
   * Generate empty timetable structure
   * @param {Object} config - Timetable configuration
   * @returns {Object} Empty timetable structure
   */
  generateEmptyTimetable: (config = {}) => {
    const emptyTimetable = {
      info: {
        name: config.name || 'New Timetable',
        academicYear: config.academicYear || '2024-2025',
        semester: config.semester || '1',
        classId: config.classId || '',
        sectionId: config.sectionId || '',
        startDate: config.startDate || new Date().toISOString().split('T')[0],
        endDate: config.endDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: timetableConstants.TIMETABLE_STATUS.DRAFT,
        periodsPerDay: config.periodsPerDay || 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Initialize empty arrays for each day
    timetableConstants.WEEK_DAYS.forEach(day => {
      emptyTimetable[day.value] = [];
    });

    return emptyTimetable;
  },

  /**
   * Validate period data
   * @param {Object} period - Period data
   * @returns {Object} { isValid: boolean, errors: Array }
   */
  validatePeriod: (period) => {
    const errors = [];
    
    if (!period) {
      errors.push('Period data is required');
      return { isValid: false, errors };
    }

    if (period.subjectName && !period.subjectName.trim()) {
      errors.push('Subject name cannot be empty');
    }

    if (period.startTime && period.endTime) {
      const duration = this.calculateDuration(period.startTime, period.endTime);
      if (duration <= 0) {
        errors.push('End time must be after start time');
      }
      if (duration > 120) {
        errors.push('Period duration cannot exceed 120 minutes');
      }
    }

    if (period.roomNumber && !/^[A-Za-z0-9\-\s]+$/.test(period.roomNumber)) {
      errors.push('Room number contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Merge two timetables
   * @param {Object} baseTimetable - Base timetable
   * @param {Object} updates - Updates to apply
   * @returns {Object} Merged timetable
   */
  mergeTimetables: (baseTimetable, updates) => {
    const merged = { ...baseTimetable };
    
    // Merge info
    if (updates.info) {
      merged.info = {
        ...merged.info,
        ...updates.info,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Merge daily schedules
    timetableConstants.WEEK_DAYS.forEach(day => {
      if (updates[day.value]) {
        merged[day.value] = [...(updates[day.value] || [])];
      }
    });
    
    return merged;
  },

  /**
   * Find empty time slots in timetable
   * @param {Object} timetable - Timetable to check
   * @returns {Array} Array of empty time slots
   */
  findEmptySlots: (timetable) => {
    const emptySlots = [];
    
    timetableConstants.WEEK_DAYS.forEach(day => {
      const daySchedule = timetable[day.value] || [];
      
      daySchedule.forEach((period, index) => {
        if (!period || !period.subjectId || period.isBreak) {
          emptySlots.push({
            day: day.value,
            periodIndex: index,
            periodNumber: period?.periodNumber || index + 1,
            startTime: period?.startTime,
            endTime: period?.endTime
          });
        }
      });
    });
    
    return emptySlots;
  },

  /**
   * Calculate teacher workload from timetable
   * @param {Object} timetable - Timetable data
   * @returns {Object} Teacher workload statistics
   */
  calculateTeacherWorkload: (timetable) => {
    const workload = {};
    
    timetableConstants.WEEK_DAYS.forEach(day => {
      const daySchedule = timetable[day.value] || [];
      
      daySchedule.forEach(period => {
        if (!period || !period.teacherId || period.isBreak) return;
        
        if (!workload[period.teacherId]) {
          workload[period.teacherId] = {
            teacherId: period.teacherId,
            teacherName: period.teacherName,
            totalPeriods: 0,
            days: new Set(),
            subjects: new Set(),
            periodsByDay: {}
          };
        }
        
        const teacherWorkload = workload[period.teacherId];
        teacherWorkload.totalPeriods++;
        teacherWorkload.days.add(day.value);
        teacherWorkload.subjects.add(period.subjectName);
        
        if (!teacherWorkload.periodsByDay[day.value]) {
          teacherWorkload.periodsByDay[day.value] = 0;
        }
        teacherWorkload.periodsByDay[day.value]++;
      });
    });
    
    // Convert sets to arrays for easier use
    Object.values(workload).forEach(teacherWorkload => {
      teacherWorkload.days = Array.from(teacherWorkload.days);
      teacherWorkload.subjects = Array.from(teacherWorkload.subjects);
    });
    
    return workload;
  },

  /**
   * Generate timetable statistics
   * @param {Object} timetable - Timetable data
   * @returns {Object} Statistics
   */
  generateStatistics: (timetable) => {
    const stats = {
      totalPeriods: 0,
      teachingPeriods: 0,
      freePeriods: 0,
      labPeriods: 0,
      practicalPeriods: 0,
      breakPeriods: 0,
      uniqueTeachers: new Set(),
      uniqueSubjects: new Set(),
      uniqueRooms: new Set(),
      periodsByDay: {}
    };
    
    timetableConstants.WEEK_DAYS.forEach(day => {
      const daySchedule = timetable[day.value] || [];
      stats.periodsByDay[day.value] = daySchedule.length;
      stats.totalPeriods += daySchedule.length;
      
      daySchedule.forEach(period => {
        if (!period || period.isBreak) {
          stats.breakPeriods++;
          return;
        }
        
        if (!period.subjectId) {
          stats.freePeriods++;
          return;
        }
        
        stats.teachingPeriods++;
        
        if (period.teacherId) {
          stats.uniqueTeachers.add(period.teacherId);
        }
        
        if (period.subjectId) {
          stats.uniqueSubjects.add(period.subjectId);
        }
        
        if (period.roomId) {
          stats.uniqueRooms.add(period.roomId);
        }
        
        switch (period.type) {
          case timetableConstants.PERIOD_TYPES.LAB:
            stats.labPeriods++;
            break;
          case timetableConstants.PERIOD_TYPES.PRACTICAL:
            stats.practicalPeriods++;
            break;
        }
      });
    });
    
    // Convert sets to counts
    stats.uniqueTeachers = stats.uniqueTeachers.size;
    stats.uniqueSubjects = stats.uniqueSubjects.size;
    stats.uniqueRooms = stats.uniqueRooms.size;
    
    // Calculate utilization rate
    stats.utilizationRate = stats.totalPeriods > 0 
      ? ((stats.teachingPeriods / stats.totalPeriods) * 100).toFixed(1)
      : 0;
    
    return stats;
  },

  /**
   * Export timetable to different formats
   * @param {Object} timetable - Timetable data
   * @param {string} format - Export format ('json', 'csv', 'pdf')
   * @returns {string|Blob} Exported data
   */
  exportTimetable: (timetable, format = 'json') => {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(timetable, null, 2);
        
      case 'csv':
        return this.convertToCSV(timetable);
        
      case 'pdf':
        // This would generate PDF using a library
        // For now, return JSON
        return JSON.stringify(timetable, null, 2);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  },

  /**
   * Convert timetable to CSV format
   * @param {Object} timetable - Timetable data
   * @returns {string} CSV string
   */
  convertToCSV: (timetable) => {
    const rows = [];
    
    // Add header
    rows.push(['Day', 'Period', 'Start Time', 'End Time', 'Subject', 'Teacher', 'Room', 'Type'].join(','));
    
    // Add data rows
    timetableConstants.WEEK_DAYS.forEach(day => {
      const daySchedule = timetable[day.value] || [];
      
      daySchedule.forEach((period, index) => {
        const row = [
          day.label,
          period?.periodNumber || index + 1,
          period?.startTime || '',
          period?.endTime || '',
          period?.subjectName || (period?.isBreak ? 'Break' : 'Free'),
          period?.teacherName || '',
          period?.roomNumber || '',
          period?.type || ''
        ];
        
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');
  },

  /**
   * Import timetable from CSV
   * @param {string} csvText - CSV text
   * @returns {Object} Parsed timetable
   */
  importFromCSV: (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const timetable = this.generateEmptyTimetable();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const row = {};
      
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      // Map CSV row to timetable period
      const day = Object.keys(timetableConstants.WEEK_DAYS_MAP || {}).find(
        key => timetableConstants.WEEK_DAYS_MAP[key] === row.Day
      ) || 'monday';
      
      if (!timetable[day]) {
        timetable[day] = [];
      }
      
      const period = {
        periodNumber: parseInt(row.Period) || timetable[day].length + 1,
        startTime: row['Start Time'],
        endTime: row['End Time'],
        subjectName: row.Subject,
        teacherName: row.Teacher,
        roomNumber: row.Room,
        type: row.Type || 'lecture',
        isBreak: row.Subject === 'Break'
      };
      
      timetable[day].push(period);
    }
    
    return timetable;
  },

  /**
   * Check if timetable is empty
   * @param {Object} timetable - Timetable to check
   * @returns {boolean} True if empty
   */
  isEmpty: (timetable) => {
    if (!timetable) return true;
    
    let hasContent = false;
    
    timetableConstants.WEEK_DAYS.forEach(day => {
      const daySchedule = timetable[day.value] || [];
      if (daySchedule.length > 0) {
        hasContent = true;
      }
    });
    
    return !hasContent;
  },

  /**
   * Clone timetable
   * @param {Object} timetable - Timetable to clone
   * @returns {Object} Cloned timetable
   */
  cloneTimetable: (timetable) => {
    return JSON.parse(JSON.stringify(timetable));
  },

  /**
   * Sort periods by time
   * @param {Array} periods - Array of periods
   * @returns {Array} Sorted periods
   */
  sortPeriodsByTime: (periods) => {
    return [...periods].sort((a, b) => {
      const timeA = this.parseTime(a.startTime);
      const timeB = this.parseTime(b.startTime);
      
      const minutesA = timeA.hour * 60 + timeA.minute;
      const minutesB = timeB.hour * 60 + timeB.minute;
      
      return minutesA - minutesB;
    });
  },

  /**
   * Find overlapping periods
   * @param {Array} periods - Array of periods
   * @returns {Array} Array of overlapping period pairs
   */
  findOverlappingPeriods: (periods) => {
    const overlapping = [];
    const sortedPeriods = this.sortPeriodsByTime(periods);
    
    for (let i = 0; i < sortedPeriods.length; i++) {
      for (let j = i + 1; j < sortedPeriods.length; j++) {
        const periodA = sortedPeriods[i];
        const periodB = sortedPeriods[j];
        
        if (this.doPeriodsOverlap(periodA, periodB)) {
          overlapping.push([periodA, periodB]);
        } else {
          // Since periods are sorted by start time, if B starts after A ends, no need to check further
          break;
        }
      }
    }
    
    return overlapping;
  },

  /**
   * Check if two periods overlap
   * @param {Object} periodA - First period
   * @param {Object} periodB - Second period
   * @returns {boolean} True if periods overlap
   */
  doPeriodsOverlap: (periodA, periodB) => {
    if (!periodA.startTime || !periodA.endTime || !periodB.startTime || !periodB.endTime) {
      return false;
    }
    
    const startA = this.parseTime(periodA.startTime);
    const endA = this.parseTime(periodA.endTime);
    const startB = this.parseTime(periodB.startTime);
    const endB = this.parseTime(periodB.endTime);
    
    const startMinutesA = startA.hour * 60 + startA.minute;
    const endMinutesA = endA.hour * 60 + endA.minute;
    const startMinutesB = startB.hour * 60 + startB.minute;
    const endMinutesB = endB.hour * 60 + endB.minute;
    
    return startMinutesA < endMinutesB && startMinutesB < endMinutesA;
  }
};

export default timetableHelpers;