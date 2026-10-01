// src/modules/fee-accounting/hooks/useSimpleStudents.js
import { useState, useEffect } from 'react';

export const useSimpleStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to get students from the same method your student management uses
      // Check if there's already student data in localStorage from student management
      const studentManagementData = localStorage.getItem('studentAdmissions');
      
      if (studentManagementData) {
        try {
          const parsedData = JSON.parse(studentManagementData);
          console.log('Found student data from student management module:', parsedData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Format the student management data
            const formattedStudents = parsedData.map((student, index) => ({
              id: student.id || student._id || index + 1,
              student_id: student.studentId || student.student_id || student.code || `STU${index + 1000}`,
              name: student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student ${index + 1}`,
              class: student.className || student.class || student.grade || 'Not Assigned',
              outstanding: student.outstanding_fee || student.outstanding || student.balance || 0,
              phone: student.phone || student.phoneNumber || student.contact || 'N/A',
              email: student.email || student.emailAddress || '',
              address: student.address || student.location || ''
            }));
            
            setStudents(formattedStudents);
            setError(null); // Clear any previous errors
            return formattedStudents;
          }
        } catch (e) {
          console.log('Failed to parse student management data:', e);
        }
      }
      
      // Try to fetch from backend without authentication first
      const backendUrls = [
        'http://localhost:5000/students',  // Try without auth
        'http://localhost:5000/api/students',
        '/students',  // Relative URL without auth
        '/api/students'
      ];
      
      let response = null;
      let usedUrl = '';
      
      // Try each URL without authorization header first
      for (const url of backendUrls) {
        try {
          console.log(`Trying to fetch from ${url} without auth...`);
          
          // First try without any Authorization header
          response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json'
            },
            // Remove signal to see if it helps with timeouts
          });
          
          if (response.ok) {
            usedUrl = url;
            break;
          } else if (response.status === 401) {
            // If 401, try with token
            const token = localStorage.getItem('token');
            if (token) {
              console.log(`Retrying ${url} with auth token...`);
              const authResponse = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (authResponse.ok) {
                response = authResponse;
                usedUrl = url;
                break;
              }
            }
          }
        } catch (err) {
          console.log(`Failed to fetch from ${url}:`, err.message);
          continue;
        }
      }
      
      if (response && response.ok) {
        setIsOnline(true);
        const data = await response.json();
        console.log(`Students fetched successfully from ${usedUrl}:`, data);
        
        // Handle different response formats
        let studentList = [];
        if (Array.isArray(data)) {
          studentList = data;
        } else if (data.data && Array.isArray(data.data)) {
          studentList = data.data;
        } else if (data.students && Array.isArray(data.students)) {
          studentList = data.students;
        } else if (typeof data === 'object') {
          // Try to find any array in the response object
          for (const key in data) {
            if (Array.isArray(data[key])) {
              studentList = data[key];
              break;
            }
          }
        }
        
        // Format students
        const formattedStudents = studentList.map((student, index) => ({
          id: student.id || student._id || index + 1,
          student_id: student.studentId || student.student_id || student.code || `STU${index + 1000}`,
          name: student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student ${index + 1}`,
          class: student.className || student.class || student.grade || 'Not Assigned',
          outstanding: student.outstanding_fee || student.outstanding || student.balance || 0,
          phone: student.phone || student.phoneNumber || student.contact || 'N/A',
          email: student.email || student.emailAddress || '',
          address: student.address || student.location || ''
        }));
        
        // Cache the successfully fetched data
        try {
          localStorage.setItem('cachedStudents', JSON.stringify(formattedStudents));
          localStorage.setItem('cachedStudentsTimestamp', Date.now().toString());
        } catch (e) {
          console.log('Failed to cache students:', e);
        }
        
        setStudents(formattedStudents);
        return formattedStudents;
        
      } else {
        // Try to use cached data from previous successful fetches
        setIsOnline(false);
        console.log('Backend not accessible, trying cache...');
        
        const cachedStudents = localStorage.getItem('cachedStudents');
        const cachedTimestamp = localStorage.getItem('cachedStudentsTimestamp');
        
        if (cachedStudents) {
          const age = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : Infinity;
          
          // Use cached data if less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            console.log('Using cached students data (age:', Math.round(age/1000/60), 'minutes)');
            const parsedStudents = JSON.parse(cachedStudents);
            setStudents(parsedStudents);
            setError('Using cached data - Backend offline');
            return parsedStudents;
          }
        }
        
        // Use test data
        console.log('Using test data');
        const testStudents = getTestStudents();
        setStudents(testStudents);
        setError('Backend offline. Using test data.');
        return testStudents;
      }
      
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setIsOnline(false);
      
      // Always return test data
      const testStudents = getTestStudents();
      setStudents(testStudents);
      setError(`Network error. Using test data.`);
      return testStudents;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get test students
  const getTestStudents = () => {
    return [
      {
        id: 1,
        student_id: 'STU20260009',
        name: 'Weldesemayat Teklay',
        class: 'Grade 10',
        outstanding: 15000,
        phone: '0911-234567',
        email: 'welde@example.com',
        address: 'Addis Ababa'
      },
      {
        id: 2,
        student_id: 'STU20260010',
        name: 'Test Student 2',
        class: 'Grade 10',
        outstanding: 12000,
        phone: '0922-345678',
        email: 'test2@example.com',
        address: 'Addis Ababa'
      },
      {
        id: 3,
        student_id: 'STU20260011',
        name: 'Test Student 3',
        class: 'Grade 11',
        outstanding: 8000,
        phone: '0933-456789',
        email: 'test3@example.com',
        address: 'Addis Ababa'
      },
      {
        id: 4,
        student_id: 'STU20260012',
        name: 'Test Student 4',
        class: 'Grade 9',
        outstanding: 0,
        phone: '0944-567890',
        email: 'test4@example.com',
        address: 'Addis Ababa'
      }
    ];
  };

  // Enhanced refresh function
  const refreshStudents = async () => {
    return await fetchStudents();
  };

  // Load students on mount
  useEffect(() => {
    refreshStudents();
  }, []);

  return {
    students,
    loading,
    error,
    isOnline,
    fetchStudents,
    refreshStudents
  };
};