// modules/subject/components/SubjectList.jsx
import React from 'react';
import { Edit, Trash2, Eye, Users, Award, Clock, Building2 } from 'lucide-react';
import { 
  getSubjectTypeLabel, 
  getSubjectStatusColor 
} from '../utils/subjectHelpers';
import './SubjectList.css';

const SubjectList = ({ subjects, departments = [], onEdit, onDelete, onView }) => {
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'N/A';
    const dept = departments.find(d => d.id === departmentId);
    return dept ? `${dept.name} (${dept.code})` : `ID: ${departmentId}`;
  };

  return (
    <div className="subject-subjectlist-subject-list">
      <table className="subject-subjectlist-subject-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => {
            const statusColor = getSubjectStatusColor(subject.status);
            
            return (
              <tr key={subject.id}>
                <td>
                  <div className="subject-subjectlist-subject-code">
                    <strong>{subject.code || 'N/A'}</strong>
                  </div>
                </td>
                <td>
                  <div className="subject-subjectlist-subject-name">
                    <strong>{subject.name || 'N/A'}</strong>
                    {subject.description && (
                      <div className="subject-subjectlist-subject-description">
                        {subject.description.length > 50 
                          ? `${subject.description.substring(0, 50)}...`
                          : subject.description}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="subject-subjectlist-subject-type">
                    {getSubjectTypeLabel(subject.type)}
                  </span>
                </td>
                <td>
                  <div className="subject-department">
                    <Building2 size={14} />
                    <span>{getDepartmentName(subject.departmentId)}</span>
                  </div>
                </td>
                <td>
                  <span className="subject-subjectlist-status-badge" style={{ backgroundColor: statusColor }}>
                    {subject.status || 'ACTIVE'}
                  </span>
                </td>
                <td>
                  <div className="subject-subjectlist-subject-actions">
                    <button 
                      className="subject-subjectlist-btn-icon" 
                      onClick={() => onView && onView(subject)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="subject-subjectlist-btn-icon" 
                      onClick={() => onEdit && onEdit(subject)}
                      title="Edit Subject"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="subject-subjectlist-btn-icon btn-danger" 
                      onClick={() => onDelete && onDelete(subject)}
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectList;