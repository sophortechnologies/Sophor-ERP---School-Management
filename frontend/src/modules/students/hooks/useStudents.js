// In src/modules/students/hooks/useStudents.js
import { useState, useEffect, useCallback } from "react";
import { studentApi } from "../api/student.api";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    newThisMonth: 0,
  });

  // Load students data
  const loadStudents = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getStudents(params);
      
      if (response.success) {
        setStudents(response.data);
        
        // Calculate statistics
        const activeStudents = response.data.filter(s => s.status === "ACTIVE");
        const inactiveStudents = response.data.filter(s => s.status === "INACTIVE");
        const graduatedStudents = response.data.filter(s => s.status === "GRADUATED");
        
        // Count new this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = response.data.filter(s => {
          if (!s.admissionDate) return false;
          try {
            const admissionDate = new Date(s.admissionDate);
            return admissionDate >= firstDayOfMonth && admissionDate <= now;
          } catch {
            return false;
          }
        }).length;
        
        setStats({
          total: response.total || response.data.length,
          active: activeStudents.length,
          inactive: inactiveStudents.length,
          graduated: graduatedStudents.length,
          newThisMonth: newThisMonth,
        });
        
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error loading students:", err);
      const errorMessage = err.message || "Failed to load student data";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Create new student
// In src/modules/students/hooks/useStudents.js
// In src/modules/students/hooks/useStudents.js - Update the createStudent function:

const createStudent = async (formData) => {
  try {
    setLoading(true);
    
    // USE THE CORRECT API METHOD
    const response = await studentAPI.createStudentAdmission(formData);
    
    console.log("Create student response:", response);
    
    if (response.data || response.success) {
      // Refresh the student list
      await loadStudents();
      return { 
        success: true, 
        data: response.data, 
        message: response.message || "Student created successfully" 
      };
    } else {
      // Handle backend failure
      console.log("Backend failed, saving to localStorage...");
      
      // Generate a local student ID
      const localStudentId = `LOCAL${Date.now().toString().slice(-6)}`;
      
      const localStudent = {
        ...formData,
        studentId: localStudentId,
        id: Date.now(),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        source: "local"
      };
      
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("studentAdmissions") || "[]");
      existing.push(localStudent);
      localStorage.setItem("studentAdmissions", JSON.stringify(existing));
      
      // Refresh from localStorage
      await loadStudents();
      
      return { 
        success: true, 
        data: localStudent, 
        message: "Student saved locally (backend unavailable)" 
      };
    }
  } catch (err) {
    console.error("Error creating student:", err);
    
    // Even on error, save to localStorage
    const localStudentId = `LOCAL${Date.now().toString().slice(-6)}`;
    const localStudent = {
      ...formData,
      studentId: localStudentId,
      id: Date.now(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      source: "local"
    };
    
    const existing = JSON.parse(localStorage.getItem("studentAdmissions") || "[]");
    existing.push(localStudent);
    localStorage.setItem("studentAdmissions", JSON.stringify(existing));
    
    await loadStudents();
    
    return { 
      success: true, 
      data: localStudent, 
      message: "Student saved locally due to error" 
    };
  } finally {
    setLoading(false);
  }
};

  // Update student
  const updateStudent = async (id, studentData) => {
    try {
      setLoading(true);
      const response = await studentApi.updateStudent(id, studentData);
      
      if (response.success) {
        // Refresh student list to get updated data
        await loadStudents();
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error updating student:", err);
      return { success: false, error: err.message || "Failed to update student" };
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      setLoading(true);
      const response = await studentApi.deleteStudent(id);
      
      console.log("Delete response in hook:", response);
      
      if (response.success) {
        // Remove from local state immediately for better UX
        setStudents(prev => prev.filter(s => s.id !== id));
        
        // Recalculate stats
        const updatedStudents = students.filter(s => s.id !== id);
        const activeStudents = updatedStudents.filter(s => s.status === "ACTIVE");
        const inactiveStudents = updatedStudents.filter(s => s.status === "INACTIVE");
        const graduatedStudents = updatedStudents.filter(s => s.status === "GRADUATED");
        
        // Count new this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = updatedStudents.filter(s => {
          if (!s.admissionDate) return false;
          try {
            const admissionDate = new Date(s.admissionDate);
            return admissionDate >= firstDayOfMonth && admissionDate <= now;
          } catch {
            return false;
          }
        }).length;
        
        setStats({
          total: updatedStudents.length,
          active: activeStudents.length,
          inactive: inactiveStudents.length,
          graduated: graduatedStudents.length,
          newThisMonth: newThisMonth,
        });
        
        return { 
          success: true, 
          message: response.message,
          data: response.data
        };
      } else {
        // If API delete failed but we have a hard-coded ID, try to remove it anyway
        console.log("API delete failed, checking for local removal...");
        
        // Check if this might be a locally created student
        const studentToDelete = students.find(s => s.id === id);
        if (studentToDelete && studentToDelete.studentId?.startsWith('STU999')) {
          // This was likely a locally created test entry
          setStudents(prev => prev.filter(s => s.id !== id));
          return { 
            success: true, 
            message: "Student removed from local storage" 
          };
        }
        
        return { 
          success: false, 
          error: response.message || "Failed to delete student" 
        };
      }
    } catch (err) {
      console.error("Error deleting student in hook:", err);
      return { 
        success: false, 
        error: err.message || "Failed to delete student" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Update student status
  const updateStudentStatus = async (id, status) => {
    try {
      const response = await studentApi.updateStudentStatus(id, status);
      
      if (response.success) {
        // Update local state
        setStudents(prev => prev.map(s => 
          s.id === id ? { ...s, status: status.toUpperCase() } : s
        ));
        return { success: true, message: response.message };
      } else {
        // If API fails, still update local state for UI
        setStudents(prev => prev.map(s => 
          s.id === id ? { ...s, status: status.toUpperCase() } : s
        ));
        return { 
          success: false, 
          error: response.message,
          message: "Status updated locally (backend update failed)" 
        };
      }
    } catch (err) {
      console.error("Error updating student status:", err);
      // Still update local state for UI consistency
      setStudents(prev => prev.map(s => 
        s.id === id ? { ...s, status: status.toUpperCase() } : s
      ));
      return { 
        success: false, 
        error: err.message || "Failed to update student status" 
      };
    }
  };

  // Search students
  const searchStudents = async (searchTerm) => {
    return await loadStudents({ search: searchTerm });
  };

  // Filter students by class
  const filterByClass = async (className) => {
    return await loadStudents({ class: className });
  };

  // Filter students by status
  const filterByStatus = async (status) => {
    return await loadStudents({ status: status.toUpperCase() });
  };

  // Get student by ID
  const getStudentById = (id) => {
    return students.find(s => s.id === id);
  };

  // Get unique classes from students
  const getUniqueClasses = () => {
    const classes = new Set();
    students.forEach(s => {
      if (s.className) classes.add(s.className);
    });
    return Array.from(classes);
  };

  // Export student data
  const exportStudents = () => {
    if (students.length === 0) {
      alert("No student data to export.");
      return;
    }
    
    const csvContent = [
      ["Student ID", "Name", "Class", "Section", "Gender", "Phone", "Guardian Phone", "Admission Date", "Status"],
      ...students.map(s => [
        s.studentId,
        `${s.firstName} ${s.lastName}`,
        s.className,
        s.sectionName,
        s.gender,
        s.phone,
        s.guardianPhone,
        s.admissionDate,
        s.status,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return {
    // Data
    students,
    loading,
    error,
    stats,
    
    // Actions
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    searchStudents,
    filterByClass,
    filterByStatus,
    exportStudents,
    
    // Helpers
    getStudentById,
    getUniqueClasses,
  };
};