// modules/teacher/utils/teacherHelpers.js
export const transformTeacher = (teacher) => {
  // Ensure we have proper data transformation
  return {
    id: teacher.id || teacher._id || '',
    username: teacher.username || '',
    email: teacher.email || '',
    password: teacher.password || '',
    firstName: teacher.firstName || teacher.first_name || '',
    lastName: teacher.lastName || teacher.last_name || '',
    phone: teacher.phone || '',
    dateOfBirth: teacher.dateOfBirth || teacher.date_of_birth || '',
    gender: teacher.gender || '',
    address: teacher.address || '',
    qualification: teacher.qualification || '',
    specialization: teacher.specialization || '',
    employmentType: teacher.employmentType || teacher.employment_type || '',
    dateOfJoining: teacher.dateOfJoining || teacher.date_of_joining || '',
    salary: teacher.salary || 0,
    status: teacher.status || 'active',
    emergencyContact: teacher.emergencyContact || teacher.emergency_contact || '',
    emergencyPhone: teacher.emergencyPhone || teacher.emergency_phone || '',
    departmentId: teacher.departmentId || teacher.department_id || '',
    name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name || '',
    isActive: teacher.status === 'active' || teacher.isActive === true,
    createdAt: teacher.createdAt || teacher.created_at || ''
  };
};

export const formatTeacherName = (teacher) => {
  if (!teacher) return 'Unknown Teacher';
  if (teacher.firstName && teacher.lastName) {
    return `${teacher.firstName} ${teacher.lastName}`;
  }
  if (teacher.name) return teacher.name;
  if (teacher.fullName) return teacher.fullName;
  return 'Teacher';
};

export const calculateTeacherAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 'N/A';
  }
};

export const getEmploymentTypeLabel = (type) => {
  if (!type) return 'Not Set';
  const typeLower = type.toLowerCase();
  switch(typeLower) {
    case 'full_time':
      return 'Full Time';
    case 'part_time':
      return 'Part Time';
    case 'contract':
      return 'Contract';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }
};

export const getTeacherStatusColor = (status) => {
  if (!status) return '#9ca3af';
  const statusLower = status.toLowerCase();
  switch(statusLower) {
    case 'active':
      return '#10b981';
    case 'inactive':
      return '#ef4444';
    case 'suspended':
      return '#6b7280';
    default:
      return '#9ca3af';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};