// src/modules/staff-attendance/constants/index.js
// Barrel export for constants

export * from './constants';

// Helper functions for constants
export const getStatusLabel = (statusValue) => {
  const status = STAFF_ATTENDANCE_STATUS.find(s => s.value === statusValue);
  return status ? status.label : statusValue;
};

export const getStatusColor = (statusValue) => {
  const status = STAFF_ATTENDANCE_STATUS.find(s => s.value === statusValue);
  return status ? status.color : '#6b7280';
};

export const getLeaveTypeLabel = (typeValue) => {
  const type = LEAVE_TYPES.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
};

export const getDepartmentLabel = (deptValue) => {
  const dept = DEPARTMENTS.find(d => d.value === deptValue);
  return dept ? dept.label : deptValue;
};

export const getReportTypeLabel = (reportValue) => {
  const report = REPORT_TYPES.find(r => r.value === reportValue);
  return report ? report.label : reportValue;
};

// Calculate attendance statistics
export const calculateAttendanceStats = (attendanceRecords) => {
  const stats = {
    total: attendanceRecords.length,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    presentPercentage: 0,
  };

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'PRESENT':
        stats.present++;
        break;
      case 'ABSENT':
        stats.absent++;
        break;
      case 'LATE':
        stats.late++;
        break;
      case 'HALF_DAY':
        stats.halfDay++;
        break;
      case 'LEAVE':
        stats.leave++;
        break;
    }
  });

  stats.presentPercentage = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;

  return stats;
};

// Validate attendance time
export const validateAttendanceTime = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return { valid: false, error: 'Both times are required' };

  const [inHour, inMinute] = checkIn.split(':').map(Number);
  const [outHour, outMinute] = checkOut.split(':').map(Number);

  if (inHour > 23 || inMinute > 59 || outHour > 23 || outMinute > 59) {
    return { valid: false, error: 'Invalid time format' };
  }

  const checkInTime = new Date();
  checkInTime.setHours(inHour, inMinute, 0, 0);

  const checkOutTime = new Date();
  checkOutTime.setHours(outHour, outMinute, 0, 0);

  if (checkOutTime <= checkInTime) {
    return { valid: false, error: 'Check-out time must be after check-in time' };
  }

  return { valid: true };
};

export default {
  getStatusLabel,
  getStatusColor,
  getLeaveTypeLabel,
  getDepartmentLabel,
  getReportTypeLabel,
  calculateAttendanceStats,
  validateAttendanceTime,
};