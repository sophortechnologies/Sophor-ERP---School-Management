// src/modules/staff-attendance/utils/index.js
// Format date to YYYY-MM-DD
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Format date for display
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return dateString;
  }
};

// Format time
export const formatTime = (timeString) => {
  if (!timeString) return '-';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

// Calculate working hours - ADDED EXPORT
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  try {
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const checkInTime = new Date();
    checkInTime.setHours(inHour, inMinute, 0, 0);
    
    const checkOutTime = new Date();
    checkOutTime.setHours(outHour, outMinute, 0, 0);
    
    // Handle overnight shifts
    if (checkOutTime < checkInTime) {
      checkOutTime.setDate(checkOutTime.getDate() + 1);
    }
    
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error("Error calculating working hours:", error);
    return 0;
  }
};

// ADD THIS FUNCTION - calculateLeaveDays
export const calculateLeaveDays = (startDate, endDate, includeWeekends = false) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      
      if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        days++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  } catch (error) {
    console.error("Error calculating leave days:", error);
    return 0;
  }
};

// Check if date is weekend
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

// Check if date is holiday
export const isHoliday = (date) => {
  // In real app, check against holiday API
  return false;
};

// Get status display properties
export const getStatusDisplay = (status) => {
  const statusMap = {
    PRESENT: { label: "Present", color: "#10b981", bg: "#dcfce7", icon: "✓" },
    ABSENT: { label: "Absent", color: "#ef4444", bg: "#fee2e2", icon: "✗" },
    LATE: { label: "Late", color: "#f59e0b", bg: "#fef3c7", icon: "⏰" },
    HALF_DAY: { label: "Half Day", color: "#3b82f6", bg: "#dbeafe", icon: "½" },
    LEAVE: { label: "On Leave", color: "#8b5cf6", bg: "#f3e8ff", icon: "📝" },
    HOLIDAY: { label: "Holiday", color: "#6b7280", bg: "#f3f4f6", icon: "🎉" },
    REMOTE: { label: "Remote Work", color: "#06b6d4", bg: "#cffafe", icon: "🏠" },
  };
  
  return statusMap[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", icon: "?" };
};

// Validate attendance record
export const validateAttendanceRecord = (record) => {
  const errors = [];
  
  if (!record.employeeId) errors.push('Employee ID is required');
  if (!record.date) errors.push('Date is required');
  if (!record.status) errors.push('Status is required');
  
  // Validate date format
  if (record.date && !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    errors.push('Invalid date format (YYYY-MM-DD required)');
  }
  
  // Validate time format if provided
  if (record.checkInTime && !/^\d{2}:\d{2}$/.test(record.checkInTime)) {
    errors.push('Invalid check-in time format (HH:MM)');
  }
  
  if (record.checkOutTime && !/^\d{2}:\d{2}$/.test(record.checkOutTime)) {
    errors.push('Invalid check-out time format (HH:MM)');
  }
  
  // Validate check-in before check-out
  if (record.checkInTime && record.checkOutTime) {
    const checkIn = new Date(`2000-01-01T${record.checkInTime}`);
    const checkOut = new Date(`2000-01-01T${record.checkOutTime}`);
    if (checkOut <= checkIn) {
      errors.push('Check-out time must be after check-in time');
    }
  }
  
  return errors;
};

// Validate leave application
export const validateLeaveApplication = (leaveData) => {
  const errors = [];
  
  if (!leaveData.employeeId) errors.push('Employee ID is required');
  if (!leaveData.leaveType) errors.push('Leave type is required');
  if (!leaveData.startDate) errors.push('Start date is required');
  if (!leaveData.endDate) errors.push('End date is required');
  if (!leaveData.reason) errors.push('Reason is required');
  
  // Validate dates
  if (leaveData.startDate && leaveData.endDate) {
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    
    if (end < start) {
      errors.push('End date must be after start date');
    }
    
    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      errors.push('Cannot apply for leave in the past');
    }
  }
  
  return errors;
};

// Generate attendance CSV template
export const generateAttendanceCSVTemplate = () => {
  const headers = ['employeeId', 'employeeName', 'date', 'status', 'checkInTime', 'checkOutTime', 'remarks'];
  const sampleData = [
    ['EMP001', 'John Doe', '2024-03-01', 'PRESENT', '09:00', '17:00', 'Regular work'],
    ['EMP002', 'Jane Smith', '2024-03-01', 'ABSENT', '', '', 'Sick leave'],
    ['EMP003', 'Mike Johnson', '2024-03-01', 'LATE', '09:45', '17:00', 'Traffic delay'],
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Generate leave CSV template
export const generateLeaveCSVTemplate = () => {
  const headers = ['employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'reason'];
  const sampleData = [
    ['EMP001', 'John Doe', 'CASUAL', '2024-03-15', '2024-03-16', 'Family function'],
    ['EMP002', 'Jane Smith', 'SICK', '2024-03-10', '2024-03-12', 'Medical appointment'],
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Parse CSV data
export const parseCSVData = (csvText, type = 'attendance') => {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length < 2) return { data: [], errors: ['CSV file is empty'] };
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];
  const errors = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    // Validate based on type
    let recordErrors = [];
    if (type === 'attendance') {
      recordErrors = validateAttendanceRecord({
        employeeId: record.employeeid,
        date: record.date,
        status: record.status,
        checkInTime: record.checkintime,
        checkOutTime: record.checkouttime
      });
    } else if (type === 'leave') {
      recordErrors = validateLeaveApplication({
        employeeId: record.employeeid,
        leaveType: record.leavetype,
        startDate: record.startdate,
        endDate: record.enddate,
        reason: record.reason
      });
    }
    
    data.push({
      ...record,
      lineNumber: i + 1,
      errors: recordErrors
    });
    
    if (recordErrors.length > 0) {
      errors.push(`Line ${i + 1}: ${recordErrors.join(', ')}`);
    }
  }
  
  return { data, errors };
};

// ADD THESE HELPER FUNCTIONS that might be missing:

// Get days between dates (including/excluding weekends)
export const getDaysBetween = (startDate, endDate, includeWeekends = true) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

// Format date time for API
export const formatDateTime = (dateString, timeString = '') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date.toISOString();
  } catch (error) {
    console.error("Error formatting date time:", error);
    return dateString;
  }
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get current time in HH:mm format
export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Check if time is within working hours
export const isWithinWorkingHours = (timeString, startTime = '09:00', endTime = '17:00') => {
  if (!timeString) return false;
  
  try {
    const [checkHour, checkMinute] = timeString.split(':').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const checkTime = new Date();
    checkTime.setHours(checkHour, checkMinute, 0, 0);
    
    const startTimeObj = new Date();
    startTimeObj.setHours(startHour, startMinute, 0, 0);
    
    const endTimeObj = new Date();
    endTimeObj.setHours(endHour, endMinute, 0, 0);
    
    return checkTime >= startTimeObj && checkTime <= endTimeObj;
  } catch (error) {
    console.error("Error checking working hours:", error);
    return false;
  }
};

// ADD THIS - Default export with all functions
export default {
  formatDate,
  formatDateForDisplay,
  formatTime,
  calculateWorkingHours,
  calculateLeaveDays, // ADDED HERE
  isWeekend,
  isHoliday,
  getStatusDisplay,
  validateAttendanceRecord,
  validateLeaveApplication,
  generateAttendanceCSVTemplate,
  generateLeaveCSVTemplate,
  parseCSVData,
  getDaysBetween,
  formatDateTime,
  getCurrentDate,
  getCurrentTime,
  isWithinWorkingHours,
};