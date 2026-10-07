import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, User, Book, Home, Users, FileText } from "lucide-react";
import api from "../../../api/axios";
import "./StudentDetails.css";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudentDetails();
  }, [id]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students");
      
      let studentsArray = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        studentsArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        studentsArray = response.data.data;
      } else if (response.data && Array.isArray(response.data.students)) {
        studentsArray = response.data.students;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any array property
        const arrayProperties = Object.keys(response.data).filter(
          key => Array.isArray(response.data[key])
        );
        if (arrayProperties.length > 0) {
          studentsArray = response.data[arrayProperties[0]];
        } else {
          studentsArray = [response.data];
        }
      }
      
      // Find the specific student
      const foundStudent = studentsArray.find(item => {
        const itemId = item.id || item._id || item.userId || item.studentId;
        const studentId = item.studentCode || item.student_id || item.studentId || item.registrationNumber;
        return itemId == id || studentId == id || item.studentId == id;
      });
      
      if (foundStudent) {
        const transformed = transformStudentData(foundStudent);
        setStudent(transformed);
        setError(null);
      } else {
        // Try direct API call to get by ID
        try {
          const directResponse = await api.get(`/students/${id}`);
          if (directResponse.data) {
            const transformed = transformStudentData(directResponse.data);
            setStudent(transformed);
            setError(null);
          } else {
            setError(`Student with ID ${id} not found`);
          }
        } catch (directError) {
          setError(`Student with ID ${id} not found`);
        }
      }
      
    } catch (err) {
      console.error("Error loading student:", err);
      setError("Failed to load student data.");
    } finally {
      setLoading(false);
    }
  };

  const transformStudentData = (studentData) => {
    console.log("Transforming student data:", studentData);
    
    // Extract name
    let firstName = studentData.firstName || studentData.first_name || studentData.fname || '';
    let lastName = studentData.lastName || studentData.last_name || studentData.lname || '';
    
    if (!firstName && studentData.name) {
      const nameParts = String(studentData.name).split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Check nested user object
    if (studentData.user) {
      if (!firstName) firstName = studentData.user.firstName || studentData.user.first_name || '';
      if (!lastName) lastName = studentData.user.lastName || studentData.user.last_name || '';
    }
    
    // Extract academic info
    let className = studentData.className || studentData.class || studentData.grade || '';
    let sectionName = studentData.sectionName || studentData.section || '';
    
    // If class is an object, extract name
    if (className && typeof className === 'object') {
      className = className.name || className.className || '';
    }
    
    // If section is an object, extract name
    if (sectionName && typeof sectionName === 'object') {
      sectionName = sectionName.name || sectionName.sectionName || '';
    }
    
    const transformed = {
      id: studentData.id || studentData._id || studentData.userId || id,
      studentId: studentData.studentCode || studentData.student_id || studentData.studentId || 
                 studentData.registrationNumber || studentData.regNumber ||
                 `STU${String(id).padStart(3, '0')}`,
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`.trim() || 'Unnamed Student',
      email: studentData.email || studentData.user?.email || '',
      phone: studentData.phone || studentData.phone_number || studentData.mobile || studentData.user?.phone || '',
      gender: studentData.gender || 'Not specified',
      dateOfBirth: studentData.dateOfBirth || studentData.dob || studentData.birthDate || '',
      admissionDate: studentData.admissionDate || studentData.admission_date || studentData.createdAt || '',
      className: className,
      sectionName: sectionName,
      classNameAndSection: className && sectionName ? `${className} - ${sectionName}` : className || 'Not assigned',
      status: (studentData.status || 'ACTIVE').toUpperCase(),
      
      // Guardian info
      guardianName: studentData.guardianName || studentData.guardian?.name || '',
      guardianPhone: studentData.guardianPhone || studentData.guardian?.phone || '',
      guardianEmail: studentData.guardianEmail || studentData.guardian?.email || '',
      guardianRelation: studentData.guardianRelation || studentData.guardian?.relation || '',
      
      // Address
      address: studentData.address || studentData.user?.address || '',
      city: studentData.city || studentData.user?.city || '',
      state: studentData.state || studentData.user?.state || '',
      
      // Previous education
      previousSchool: studentData.previousSchool || studentData.lastSchool || '',
      lastGrade: studentData.lastGrade || studentData.previousGrade || '',
    };
    
    console.log("Transformed student:", transformed);
    return transformed;
  };

  const handleBack = () => {
    navigate("/admin/students");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender) => {
    if (!gender) return 'Not specified';
    return gender
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    try {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return '';
      
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="students-studentdetails-loading-container">
        <div className="students-studentdetails-spinner"></div>
        <p>Loading student details...</p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="students-studentdetails-error-container">
        <div className="students-studentdetails-error-icon">⚠️</div>
        <h3>Unable to Load Student Details</h3>
        <p className="students-studentdetails-error-message">{error}</p>
        <button className="btn btn-back" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Student List
        </button>
      </div>
    );
  }

  const fullName = student?.fullName || 'Unnamed Student';
  const age = getAge(student?.dateOfBirth);

  return (
    <div className="students-studentdetails-student-details">
      {/* Header */}
      <div className="students-studentdetails-details-header">
        <button className="btn btn-back" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Students
        </button>
      </div>

      {/* Profile Header */}
      <div className="students-studentdetails-profile-header">
        <div className="students-studentdetails-profile-avatar">
          {student?.firstName?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="students-studentdetails-profile-info">
          <h1>{fullName}</h1>
          <div className="students-studentdetails-profile-meta">
            <span className={`students-studentdetails-status-badge ${student?.status?.toLowerCase() || 'active'}`}>
              {student?.status || 'ACTIVE'}
            </span>
            <span className="students-studentdetails-student-id-display">{student?.studentId}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="students-studentdetails-details-content">
        <div className="students-studentdetails-details-grid">
          {/* Personal Information Card */}
          <div className="students-studentdetails-details-card">
            <div className="card-header">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className="card-body">
              <div className="students-studentdetails-info-grid">
                <div className="students-studentdetails-info-item">
                  <label>Name</label>
                  <p>{fullName}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label><Mail size={16} /> Email Address</label>
                  <p className={!student?.email ? 'students-studentdetails-text-muted' : ''}>
                    {student?.email || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label><Phone size={16} /> Phone Number</label>
                  <p className={!student?.phone ? 'students-studentdetails-text-muted' : ''}>
                    {student?.phone || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Gender</label>
                  <p>{formatGender(student?.gender)} {age ? `(${age} years)` : ''}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label><Calendar size={16} /> Date of Birth</label>
                  <p>{formatDate(student?.dateOfBirth)}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Status</label>
                  <span className={`students-studentdetails-status-indicator ${student?.status?.toLowerCase() || 'active'}`}>
                    {student?.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="students-studentdetails-details-card">
            <div className="card-header">
              <Book size={20} />
              <h2>Academic Information</h2>
            </div>
            <div className="card-body">
              <div className="students-studentdetails-info-grid">
                <div className="students-studentdetails-info-item">
                  <label>Student ID</label>
                  <p className="students-studentdetails-student-id-value">{student?.studentId || 'N/A'}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Class & Section</label>
                  <p>{student?.classNameAndSection || 'Not assigned'}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label><Calendar size={16} /> Admission Date</label>
                  <p>{formatDate(student?.admissionDate)}</p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Previous School</label>
                  <p className={!student?.previousSchool ? 'students-studentdetails-text-muted' : ''}>
                    {student?.previousSchool || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Previous Grade</label>
                  <p className={!student?.lastGrade ? 'students-studentdetails-text-muted' : ''}>
                    {student?.lastGrade || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Information Card */}
          <div className="students-studentdetails-details-card">
            <div className="card-header">
              <Users size={20} />
              <h2>Guardian Information</h2>
            </div>
            <div className="card-body">
              <div className="students-studentdetails-info-grid">
                <div className="students-studentdetails-info-item">
                  <label>Guardian Name</label>
                  <p className={!student?.guardianName ? 'students-studentdetails-text-muted' : ''}>
                    {student?.guardianName || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label><Phone size={16} /> Guardian Phone</label>
                  <p className={!student?.guardianPhone ? 'students-studentdetails-text-muted' : ''}>
                    {student?.guardianPhone || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Guardian Email</label>
                  <p className={!student?.guardianEmail ? 'students-studentdetails-text-muted' : ''}>
                    {student?.guardianEmail || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>Relationship</label>
                  <p className={!student?.guardianRelation ? 'students-studentdetails-text-muted' : ''}>
                    {student?.guardianRelation || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="students-studentdetails-details-card">
            <div className="card-header">
              <Home size={20} />
              <h2>Address Information</h2>
            </div>
            <div className="card-body">
              <div className="students-studentdetails-info-grid">
                <div className="students-studentdetails-info-item">
                  <label>Address</label>
                  <p className={!student?.address ? 'students-studentdetails-text-muted' : ''}>
                    {student?.address || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>City</label>
                  <p className={!student?.city ? 'students-studentdetails-text-muted' : ''}>
                    {student?.city || 'Not specified'}
                  </p>
                </div>
                <div className="students-studentdetails-info-item">
                  <label>State/Region</label>
                  <p className={!student?.state ? 'students-studentdetails-text-muted' : ''}>
                    {student?.state || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;