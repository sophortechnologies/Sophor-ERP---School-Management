// Create a new file: src/modules/fee-accounting/hooks/useStudents.js
import { useState, useEffect } from 'react';
import { feeApi } from '../api/feeApi';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.getStudents(params);
      
      // Format the students
      const formattedStudents = (Array.isArray(response) ? response : [])
        .map((student, index) => {
          const studentId = student.id || student._id || student.studentId || index;
          const studentCode = student.studentId || student.student_code || `STU${studentId}`;
          
          // Get name
          const firstName = student.firstName || student.first_name || '';
          const lastName = student.lastName || student.last_name || '';
          const fullName = student.fullName || student.name || '';
          const displayName = `${firstName} ${lastName}`.trim() || fullName || `Student ${studentCode}`;
          
          return {
            id: studentId,
            student_id: studentCode,
            name: displayName,
            class: student.className || student.class || student.grade || 'Not Assigned',
            outstanding: student.outstanding_fee || student.outstanding || 0,
            phone: student.phone || student.contact || 'N/A',
            email: student.email || '',
            address: student.address || ''
          };
        });
      
      setStudents(formattedStudents);
      return formattedStudents;
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    setLoading(true);
    try {
      const response = await feeApi.getStudentsByClass(classId);
      
      const formattedStudents = (Array.isArray(response) ? response : [])
        .map((student, index) => {
          const studentId = student.id || student._id || student.studentId || index;
          const studentCode = student.studentId || student.student_code || `STU${studentId}`;
          
          const firstName = student.firstName || student.first_name || '';
          const lastName = student.lastName || student.last_name || '';
          const fullName = student.fullName || student.name || '';
          const displayName = `${firstName} ${lastName}`.trim() || fullName || `Student ${studentCode}`;
          
          return {
            id: studentId,
            student_id: studentCode,
            name: displayName,
            class: student.className || student.class || student.grade || 'Not Assigned',
            outstanding: student.outstanding_fee || student.outstanding || 0,
            phone: student.phone || student.contact || 'N/A',
            email: student.email || '',
            address: student.address || ''
          };
        });
      
      setStudents(formattedStudents);
      return formattedStudents;
    } catch (err) {
      setError(err.message || 'Failed to fetch students by class');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    fetchStudentsByClass,
    refreshStudents: fetchStudents
  };
};