// modules/teacher/components/TeacherCard.jsx
import React from 'react';
import { Mail, Phone, GraduationCap, Briefcase, MapPin, Edit, Eye, Building2, User } from 'lucide-react';
import './TeacherCard.css';

const TeacherCard = ({ teacher, departments = [], onEdit, onView }) => {
  // Helper function to get department name
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'No Department';
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : `Dept: ${departmentId}`;
  };

  // Helper function to get teacher name
  const getTeacherName = () => {
    if (teacher.firstName && teacher.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    if (teacher.name) return teacher.name;
    if (teacher.fullName) return teacher.fullName;
    return 'Teacher';
  };

  // Helper function to get employment type label
  const getEmploymentTypeLabel = (type) => {
    if (!type) return 'N/A';
    const typeLower = type.toLowerCase();
    switch(typeLower) {
      case 'full_time':
        return 'Full Time';
      case 'part_time':
        return 'Part Time';
      case 'contract':
        return 'Contract';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ');
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    if (!status) return '#a0aec0';
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'active':
        return '#48bb78';
      case 'inactive':
        return '#f56565';
      case 'suspended':
        return '#6b7280';
      default:
        return '#a0aec0';
    }
  };

  const teacherName = getTeacherName();
  const departmentName = getDepartmentName(teacher.departmentId);
  const statusColor = getStatusColor(teacher.status);

  return (
    <div className="teacher-teachercard-teacher-card">
      <div className="teacher-teachercard-teacher-card-header">
        <div className="teacher-teachercard-teacher-avatar">
          <div className="teacher-teachercard-avatar-initial">
            {teacherName.charAt(0).toUpperCase()}
          </div>
          <div className="teacher-teachercard-teacher-status" style={{ backgroundColor: statusColor }}></div>
        </div>
        <div className="teacher-teachercard-teacher-info">
          <h3 className="teacher-teachercard-teacher-name">{teacherName}</h3>
          <p className="teacher-teachercard-teacher-department">
            <Building2 size={14} />
            <span>{departmentName}</span>
          </p>
          <div className="teacher-teachercard-teacher-employment-type">
            <span className="teacher-teachercard-employment-badge">
              {getEmploymentTypeLabel(teacher.employmentType)}
            </span>
          </div>
        </div>
      </div>

      <div className="teacher-teachercard-teacher-contact-info">
        <div className="teacher-teachercard-contact-item">
          <Mail size={14} />
          <span className="teacher-teachercard-truncate">{teacher.email || 'No email'}</span>
        </div>
        
        <div className="teacher-teachercard-contact-item">
          <Phone size={14} />
          <span>{teacher.phone || 'No phone'}</span>
        </div>
      </div>

      {teacher.specialization && (
        <div className="teacher-teachercard-teacher-specialization">
          <GraduationCap size={14} />
          <span>{teacher.specialization}</span>
        </div>
      )}

      <div className="teacher-teachercard-teacher-card-footer">
        <div className="teacher-teachercard-teacher-id">
          <small>ID: {teacher.id || teacher.teacherId || 'N/A'}</small>
        </div>
        <div className="teacher-teachercard-teacher-card-actions">
          {onView && (
            <button 
              className="teacher-teachercard-btn-action teacher-teachercard-view-btn" 
              onClick={() => onView(teacher)} 
              title="View Profile"
            >
              <Eye size={16} />
              <span>View</span>
            </button>
          )}
          {onEdit && (
            <button 
              className="teacher-teachercard-btn-action teacher-teachercard-edit-btn" 
              onClick={() => onEdit(teacher)} 
              title="Edit Teacher"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;