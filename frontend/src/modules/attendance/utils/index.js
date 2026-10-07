// Utility functions for attendance module

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time for display
export const formatTime = (timeString) => {
  if (!timeString) return '-';
  return timeString;
};

// Calculate attendance percentage
export const calculateAttendancePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

// Check if date is weekend
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    present: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    absent: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    late: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    leave: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
    half_day: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    holiday: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
  };
  return colors[status] || colors.absent;
};

// Validate attendance record
export const validateAttendanceRecord = (record) => {
  const errors = [];
  
  if (!record.studentId) errors.push('Student ID is required');
  if (!record.studentName) errors.push('Student name is required');
  if (!record.date) errors.push('Date is required');
  if (!record.status) errors.push('Status is required');
  
  // Validate date format
  if (record.date && !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    errors.push('Invalid date format (YYYY-MM-DD)');
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

// Parse CSV data for bulk upload
export const parseCSVData = (csvText) => {
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
    
    const recordErrors = validateAttendanceRecord({
      studentId: record.studentid,
      studentName: record.studentname,
      date: record.date,
      status: record.status,
      checkInTime: record.checkintime,
      checkOutTime: record.checkouttime
    });
    
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

// Generate attendance report data
export const generateReportData = (attendanceRecords, params = {}) => {
  const { startDate, endDate, classId } = params;
  
  let filteredRecords = [...attendanceRecords];
  
  if (startDate && endDate) {
    filteredRecords = filteredRecords.filter(record =>
      record.date >= startDate && record.date <= endDate
    );
  }
  
  if (classId) {
    filteredRecords = filteredRecords.filter(record =>
      record.classId === parseInt(classId)
    );
  }
  
  const summary = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    late: filteredRecords.filter(r => r.status === 'late').length,
    leave: filteredRecords.filter(r => r.status === 'leave').length,
    half_day: filteredRecords.filter(r => r.status === 'half_day').length
  };
  
  summary.presentPercentage = calculateAttendancePercentage(summary.present, summary.total);
  
  // Group by date for daily trends
  const dailyStats = {};
  filteredRecords.forEach(record => {
    if (!dailyStats[record.date]) {
      dailyStats[record.date] = {
        date: record.date,
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      };
    }
    
    dailyStats[record.date].total++;
    if (record.status === 'present') dailyStats[record.date].present++;
    if (record.status === 'absent') dailyStats[record.date].absent++;
    if (record.status === 'late') dailyStats[record.date].late++;
  });
  
  const dailyStatsArray = Object.values(dailyStats).map(day => ({
    ...day,
    percentage: calculateAttendancePercentage(day.present, day.total)
  }));
  
  // Group by class for class-wise stats
  const classStats = {};
  filteredRecords.forEach(record => {
    if (!classStats[record.classId]) {
      classStats[record.classId] = {
        classId: record.classId,
        className: record.className || `Class ${record.classId}`,
        present: 0,
        absent: 0,
        total: 0
      };
    }
    
    classStats[record.classId].total++;
    if (record.status === 'present') classStats[record.classId].present++;
    if (record.status === 'absent') classStats[record.classId].absent++;
  });
  
  const classStatsArray = Object.values(classStats).map(cls => ({
    ...cls,
    percentage: calculateAttendancePercentage(cls.present, cls.total)
  }));
  
  // Calculate top attendees
  const studentStats = {};
  filteredRecords.forEach(record => {
    if (!studentStats[record.studentId]) {
      studentStats[record.studentId] = {
        studentId: record.studentId,
        name: record.studentName,
        present: 0,
        total: 0
      };
    }
    
    studentStats[record.studentId].total++;
    if (record.status === 'present') studentStats[record.studentId].present++;
  });
  
  const topAttendees = Object.values(studentStats)
    .map(stats => ({
      ...stats,
      percentage: calculateAttendancePercentage(stats.present, stats.total)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);
  
  // Calculate frequent absentees
  const absentStudentStats = {};
  filteredRecords.forEach(record => {
    if (!absentStudentStats[record.studentId]) {
      absentStudentStats[record.studentId] = {
        studentId: record.studentId,
        name: record.studentName,
        absent: 0,
        total: 0
      };
    }
    
    absentStudentStats[record.studentId].total++;
    if (record.status === 'absent') absentStudentStats[record.studentId].absent++;
  });
  
  const frequentAbsentees = Object.values(absentStudentStats)
    .filter(stats => stats.absent > 0)
    .map(stats => ({
      ...stats,
      percentage: calculateAttendancePercentage(stats.absent, stats.total)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);
  
  return {
    summary,
    dailyStats: dailyStatsArray.sort((a, b) => a.date.localeCompare(b.date)),
    classWiseStats: classStatsArray,
    topAttendees,
    frequentAbsentees,
    rawData: filteredRecords
  };
};

// Export attendance data to CSV
export const exportToCSV = (attendanceData, filename = 'attendance_export.csv') => {
  const headers = ['Student ID', 'Student Name', 'Date', 'Status', 'Check-in Time', 'Check-out Time', 'Remarks', 'Class'];
  
  const csvContent = [
    headers.join(','),
    ...attendanceData.map(record => [
      record.studentId,
      `"${record.studentName}"`,
      record.date,
      record.status,
      record.checkInTime || '',
      record.checkOutTime || '',
      `"${record.remarks || ''}"`,
      record.className
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};