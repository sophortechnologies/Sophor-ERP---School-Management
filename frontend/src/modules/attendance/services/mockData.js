// src/modules/attendance/services/mockData.js
export const mockDataService = {
  // Mock classes data
  getClasses: () => {
    const savedClasses = localStorage.getItem('mock_classes');
    if (savedClasses) {
      return JSON.parse(savedClasses);
    }
    
    const defaultClasses = [
      { id: '1', name: 'Grade 1A', grade: '1', section: 'A' },
      { id: '2', name: 'Grade 1B', grade: '1', section: 'B' },
      { id: '3', name: 'Grade 2A', grade: '2', section: 'A' },
      { id: '4', name: 'Grade 2B', grade: '2', section: 'B' },
      { id: '5', name: 'Grade 3A', grade: '3', section: 'A' },
      { id: '6', name: 'Grade 3B', grade: '3', section: 'B' },
    ];
    
    localStorage.setItem('mock_classes', JSON.stringify(defaultClasses));
    return defaultClasses;
  },
  
  // Mock students for a class
  getStudentsByClass: (classId) => {
    const savedStudents = localStorage.getItem(`mock_students_${classId}`);
    if (savedStudents) {
      return JSON.parse(savedStudents);
    }
    
    const students = Array.from({ length: 20 }, (_, i) => ({
      id: `student-${classId}-${i + 1}`,
      studentId: `STU${1000 + i}`,
      name: `Student ${i + 1}`,
      rollNumber: `${i + 1}`,
      classId: classId,
      className: `Class ${classId}`,
    }));
    
    localStorage.setItem(`mock_students_${classId}`, JSON.stringify(students));
    return students;
  },
  
  // Mock attendance data
  getAttendanceByDateClass: (date, classId) => {
    const key = `attendance_${date}_${classId}`;
    const savedAttendance = localStorage.getItem(key);
    
    if (savedAttendance) {
      return JSON.parse(savedAttendance);
    }
    
    const students = this.getStudentsByClass(classId);
    const statuses = ['present', 'present', 'present', 'absent', 'late', 'leave'];
    
    const attendance = students.map((student, index) => ({
      id: `att-${date}-${classId}-${index}`,
      studentId: student.studentId,
      studentName: student.name,
      classId: classId,
      className: `Class ${classId}`,
      date: date,
      status: statuses[index % statuses.length],
      checkInTime: index % 3 === 0 ? '08:15' : index % 3 === 1 ? '08:30' : '08:45',
      checkOutTime: '15:30',
      remarks: '',
      markedBy: 'Teacher',
      createdAt: new Date().toISOString(),
    }));
    
    localStorage.setItem(key, JSON.stringify(attendance));
    return attendance;
  },
  
  // Save attendance
  saveAttendance: (attendanceData) => {
    const { date, classId, attendanceList } = attendanceData;
    const key = `attendance_${date}_${classId}`;
    
    // Update each student's attendance
    const existingAttendance = this.getAttendanceByDateClass(date, classId);
    const updatedAttendance = existingAttendance.map(existing => {
      const newRecord = attendanceList.find(a => a.studentId === existing.studentId);
      if (newRecord) {
        return {
          ...existing,
          status: newRecord.status,
          checkInTime: newRecord.checkInTime || existing.checkInTime,
          checkOutTime: newRecord.checkOutTime || existing.checkOutTime,
          remarks: newRecord.remarks || existing.remarks,
        };
      }
      return existing;
    });
    
    localStorage.setItem(key, JSON.stringify(updatedAttendance));
    return updatedAttendance;
  },
  
  // Get all attendance
  getAllAttendance: () => {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('attendance_'));
    let allAttendance = [];
    
    allKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          allAttendance = [...allAttendance, ...data];
        }
      } catch (e) {
        console.error('Error parsing attendance from localStorage:', e);
      }
    });
    
    return allAttendance;
  },
  
  // Clear mock data (for testing)
  clearMockData: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('mock_') || key.startsWith('attendance_')) {
        localStorage.removeItem(key);
      }
    });
  }
};