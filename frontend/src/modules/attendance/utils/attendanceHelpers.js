// src/modules/attendance/utils/attendanceHelpers.js

// Format date to YYYY-MM-DD format
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Should be YYYY-MM-DD
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return dateString;
  }
};

// Parse backend date to frontend format
export const parseBackendDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Return in YYYY-MM-DD format for input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error parsing backend date:", error);
    return dateString;
  }
};

// Format date for display
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
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

// Format time for display
export const formatTimeForDisplay = (timeString) => {
  if (!timeString) return '-';
  
  try {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${displayHours}:${minutes} ${period}`;
    }
    
    return timeString;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

// Calculate attendance percentage
export const calculateAttendancePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  return Number(((present / total) * 100).toFixed(1));
};

// Get status display properties
export const getStatusDisplay = (status) => {
  const statusMap = {
    PRESENT: { label: "Present", color: "#10b981", bg: "#dcfce7", icon: "✓" },
    ABSENT: { label: "Absent", color: "#ef4444", bg: "#fee2e2", icon: "✗" },
    LATE: { label: "Late", color: "#f59e0b", bg: "#fef3c7", icon: "⏰" },
    HALF_DAY: { label: "Half Day", color: "#3b82f6", bg: "#dbeafe", icon: "½" },
    HOLIDAY: { label: "Holiday", color: "#6b7280", bg: "#f3f4f6", icon: "🎉" },
    LEAVE: { label: "Leave", color: "#8b5cf6", bg: "#f3e8ff", icon: "📝" },
    // Support lowercase for backward compatibility
    present: { label: "Present", color: "#10b981", bg: "#dcfce7", icon: "✓" },
    absent: { label: "Absent", color: "#ef4444", bg: "#fee2e2", icon: "✗" },
    late: { label: "Late", color: "#f59e0b", bg: "#fef3c7", icon: "⏰" },
    half_day: { label: "Half Day", color: "#3b82f6", bg: "#dbeafe", icon: "½" },
    holiday: { label: "Holiday", color: "#6b7280", bg: "#f3f4f6", icon: "🎉" },
    leave: { label: "Leave", color: "#8b5cf6", bg: "#f3e8ff", icon: "📝" },
  };
  
  return statusMap[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", icon: "?" };
};

// Transform backend data to frontend format
export const transformBackendData = (backendData) => {
  console.log("🔄 Transforming backend data:", backendData);
  
  if (!backendData) {
    console.log("No backend data to transform");
    return [];
  }
  
  // If it's already an array of transformed records, return as-is
  if (Array.isArray(backendData) && backendData.length > 0 && backendData[0].studentName) {
    console.log("Data already transformed, returning as-is");
    return backendData;
  }
  
  if (Array.isArray(backendData)) {
    const transformed = backendData.map((record, index) => {
      console.log(`Processing record ${index + 1}:`, record);
      
      // Extract date from various possible fields
      let date = record.date || record.attendanceDate || record.createdAt || record.timestamp;
      if (date && typeof date === 'string') {
        // Ensure date is in YYYY-MM-DD format
        date = date.split('T')[0];
      }
      
      // Get student information from various possible fields
      let studentId = record.studentId || record.student?._id || record.student?.id || record.rollNumber || record.studentNumber;
      let studentName = record.studentName;
      let rollNumber = record.rollNumber || record.student?.rollNumber || studentId;
      
      // If we have a student object but no studentName, construct it
      if (!studentName && record.student) {
        if (typeof record.student === 'string') {
          studentName = record.student;
        } else if (record.student.name) {
          studentName = record.student.name;
        } else if (record.student.firstName || record.student.lastName) {
          studentName = `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim();
        } else if (record.student.fullName) {
          studentName = record.student.fullName;
        }
      }
      
      // If still no studentName, use a default
      if (!studentName) {
        studentName = `Student ${rollNumber || studentId || index + 1}`;
      }
      
      // Get class information
      let classId = record.classId || record.class?._id || record.class?.id || record.class;
      let className = record.className || record.class?.name || record.className;
      
      // Format status (make it uppercase for consistency)
      let status = record.status;
      if (status) {
        status = status.toUpperCase();
      }
      
      const transformedRecord = {
        id: record.id || record._id || record.attendanceId || `temp-${Date.now()}-${index}`,
        studentId: studentId,
        studentName: studentName,
        rollNumber: rollNumber,
        classId: classId,
        className: className,
        date: date,
        status: status,
        checkInTime: record.checkInTime || record.check_in_time || record.checkIn,
        checkOutTime: record.checkOutTime || record.check_out_time || record.checkOut,
        remarks: record.remarks || record.note || "",
        markedBy: record.markedBy || record.teacher?.name || record.createdBy || record.updatedBy || "System",
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
      
      console.log(`Transformed record ${index + 1}:`, transformedRecord);
      return transformedRecord;
    });
    
    console.log(`✅ Successfully transformed ${transformed.length} records`);
    return transformed;
  }
  
  // Single record
  console.log("Single record to transform:", backendData);
  return [{
    id: backendData.id || backendData._id,
    studentId: backendData.studentId || backendData.student?._id,
    studentName: backendData.studentName || backendData.student?.name,
    rollNumber: backendData.rollNumber || backendData.student?.rollNumber,
    classId: backendData.classId || backendData.class?._id,
    className: backendData.className || backendData.class?.name,
    date: backendData.date || backendData.attendanceDate,
    status: backendData.status,
    checkInTime: backendData.checkInTime,
    checkOutTime: backendData.checkOutTime,
    remarks: backendData.remarks,
    markedBy: backendData.markedBy
  }];
};
// Validate attendance record before submission
export const validateAttendanceRecord = (record) => {
  const errors = [];
  
  if (!record.studentId) errors.push('Student ID is required');
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
  
  return errors;
};

// Generate CSV template for bulk upload
export const generateCSVTemplate = () => {
  const headers = ['studentId', 'studentName', 'date', 'status', 'checkInTime', 'checkOutTime', 'remarks', 'classId'];
  const sampleData = [
    ['STU001', 'John Doe', '2024-03-01', 'present', '08:15', '15:30', 'Present for class', '1'],
    ['STU002', 'Jane Smith', '2024-03-01', 'absent', '', '', 'Sick leave', '1'],
    ['STU003', 'Mike Johnson', '2024-03-01', 'late', '08:45', '15:30', 'Late due to traffic', '1'],
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};