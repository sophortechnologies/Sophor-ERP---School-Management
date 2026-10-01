// modules/teacher/constants/teacher.constants.js

// Teacher roles and designations
export const TEACHER_ROLES = [
  { value: 'teacher', label: 'Teacher', color: '#4299e1' },
  { value: 'head_teacher', label: 'Head Teacher', color: '#3182ce' },
  { value: 'department_head', label: 'Department Head', color: '#2b6cb0' },
  { value: 'vice_principal', label: 'Vice Principal', color: '#2c5282' },
  { value: 'principal', label: 'Principal', color: '#1a202c' },
  { value: 'coordinator', label: 'Coordinator', color: '#805ad5' },
  { value: 'mentor', label: 'Mentor', color: '#d53f8c' },
  { value: 'counselor', label: 'Counselor', color: '#38b2ac' }
];

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time', color: '#48bb78' },
  { value: 'part_time', label: 'Part Time', color: '#ecc94b' },
  { value: 'contract', label: 'Contract', color: '#ed8936' },
  { value: 'visiting', label: 'Visiting', color: '#4299e1' },
  { value: 'temporary', label: 'Temporary', color: '#f56565' },
  { value: 'permanent', label: 'Permanent', color: '#38a169' }
];

// Academic qualifications
export const QUALIFICATIONS = [
  { value: 'phd', label: 'PhD / Doctorate', level: 'doctorate' },
  { value: 'masters', label: 'Master\'s Degree', level: 'masters' },
  { value: 'bachelor', label: 'Bachelor\'s Degree', level: 'bachelor' },
  { value: 'diploma', label: 'Diploma', level: 'diploma' },
  { value: 'certificate', label: 'Certificate', level: 'certificate' },
  { value: 'bachelor_of_education', label: 'Bachelor of Education (B.Ed)', level: 'bachelor' },
  { value: 'master_of_education', label: 'Master of Education (M.Ed)', level: 'masters' },
  { value: 'associate', label: 'Associate Degree', level: 'associate' }
];

// Subject specializations (mapped to SRS requirements)
export const SUBJECT_SPECIALIZATIONS = [
  // Core subjects
  { value: 'mathematics', label: 'Mathematics', category: 'core', color: '#3182ce' },
  { value: 'english', label: 'English', category: 'core', color: '#4299e1' },
  { value: 'science', label: 'Science', category: 'core', color: '#38a169' },
  { value: 'social_studies', label: 'Social Studies', category: 'core', color: '#d69e2e' },
  
  // Science subjects
  { value: 'physics', label: 'Physics', category: 'science', color: '#3182ce' },
  { value: 'chemistry', label: 'Chemistry', category: 'science', color: '#38a169' },
  { value: 'biology', label: 'Biology', category: 'science', color: '#48bb78' },
  { value: 'computer_science', label: 'Computer Science', category: 'science', color: '#805ad5' },
  
  // Humanities
  { value: 'history', label: 'History', category: 'humanities', color: '#d69e2e' },
  { value: 'geography', label: 'Geography', category: 'humanities', color: '#dd6b20' },
  { value: 'civics', label: 'Civics', category: 'humanities', color: '#ed8936' },
  { value: 'economics', label: 'Economics', category: 'humanities', color: '#c05621' },
  
  // Languages
  { value: 'french', label: 'French', category: 'language', color: '#4299e1' },
  { value: 'spanish', label: 'Spanish', category: 'language', color: '#3182ce' },
  { value: 'german', label: 'German', category: 'language', color: '#2b6cb0' },
  { value: 'arabic', label: 'Arabic', category: 'language', color: '#2c5282' },
  
  // Arts and creative
  { value: 'art', label: 'Art', category: 'arts', color: '#d53f8c' },
  { value: 'music', label: 'Music', category: 'arts', color: '#d53f8c' },
  { value: 'drama', label: 'Drama', category: 'arts', color: '#b83280' },
  { value: 'physical_education', label: 'Physical Education', category: 'arts', color: '#38b2ac' },
  
  // Vocational and technical
  { value: 'home_economics', label: 'Home Economics', category: 'vocational', color: '#38a169' },
  { value: 'technical_drawing', label: 'Technical Drawing', category: 'vocational', color: '#3182ce' },
  { value: 'woodwork', label: 'Woodwork', category: 'vocational', color: '#d69e2e' },
  { value: 'metalwork', label: 'Metalwork', category: 'vocational', color: '#718096' },
  
  // Business and commerce
  { value: 'accounting', label: 'Accounting', category: 'business', color: '#48bb78' },
  { value: 'business_studies', label: 'Business Studies', category: 'business', color: '#38a169' },
  { value: 'commerce', label: 'Commerce', category: 'business', color: '#2f855a' }
];

// Teacher statuses
export const TEACHER_STATUS = {
  ACTIVE: { value: 'active', label: 'Active', color: '#48bb78' },
  INACTIVE: { value: 'inactive', label: 'Inactive', color: '#a0aec0' },
  SUSPENDED: { value: 'suspended', label: 'Suspended', color: '#f56565' },
  RESIGNED: { value: 'resigned', label: 'Resigned', color: '#718096' },
  RETIRED: { value: 'retired', label: 'Retired', color: '#4a5568' }
};

// Genders
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

// Marital status
export const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' }
];

// Blood groups
export const BLOOD_GROUPS = [
  { value: 'A+', label: 'A Positive (A+)' },
  { value: 'A-', label: 'A Negative (A-)' },
  { value: 'B+', label: 'B Positive (B+)' },
  { value: 'B-', label: 'B Negative (B-)' },
  { value: 'O+', label: 'O Positive (O+)' },
  { value: 'O-', label: 'O Negative (O-)' },
  { value: 'AB+', label: 'AB Positive (AB+)' },
  { value: 'AB-', label: 'AB Negative (AB-)' },
  { value: 'unknown', label: 'Unknown' }
];

// Teacher categories (teaching vs non-teaching)
export const TEACHER_CATEGORIES = [
  { value: 'teaching', label: 'Teaching Staff', color: '#4299e1' },
  { value: 'non_teaching', label: 'Non-Teaching Staff', color: '#718096' },
  { value: 'administrative', label: 'Administrative', color: '#38a169' },
  { value: 'support', label: 'Support Staff', color: '#ed8936' }
];

// Departments (based on SRS module requirements)
export const DEPARTMENTS = [
  { value: 'mathematics', label: 'Mathematics Department' },
  { value: 'science', label: 'Science Department' },
  { value: 'english', label: 'English Department' },
  { value: 'humanities', label: 'Humanities Department' },
  { value: 'languages', label: 'Languages Department' },
  { value: 'arts', label: 'Arts Department' },
  { value: 'physical_education', label: 'Physical Education Department' },
  { value: 'technology', label: 'Technology Department' },
  { value: 'business', label: 'Business Department' },
  { value: 'administration', label: 'Administration' },
  { value: 'library', label: 'Library' },
  { value: 'laboratory', label: 'Laboratory' }
];

// Salary grades/levels
export const SALARY_GRADES = [
  { value: 'grade_1', label: 'Grade 1 (Entry Level)', range: 'Basic' },
  { value: 'grade_2', label: 'Grade 2 (Junior)', range: 'Junior' },
  { value: 'grade_3', label: 'Grade 3 (Mid Level)', range: 'Mid' },
  { value: 'grade_4', label: 'Grade 4 (Senior)', range: 'Senior' },
  { value: 'grade_5', label: 'Grade 5 (Lead)', range: 'Lead' },
  { value: 'grade_6', label: 'Grade 6 (Principal)', range: 'Principal' },
  { value: 'grade_7', label: 'Grade 7 (Executive)', range: 'Executive' }
];

// Leave types (for HR integration)
export const LEAVE_TYPES = [
  { value: 'sick_leave', label: 'Sick Leave', paid: true },
  { value: 'annual_leave', label: 'Annual Leave', paid: true },
  { value: 'casual_leave', label: 'Casual Leave', paid: true },
  { value: 'maternity_leave', label: 'Maternity Leave', paid: true },
  { value: 'paternity_leave', label: 'Paternity Leave', paid: true },
  { value: 'study_leave', label: 'Study Leave', paid: true },
  { value: 'compensatory_leave', label: 'Compensatory Leave', paid: true },
  { value: 'unpaid_leave', label: 'Unpaid Leave', paid: false }
];

// Default values for forms
export const DEFAULT_VALUES = {
  employmentType: 'full_time',
  role: 'teacher',
  status: 'active',
  gender: 'male',
  maritalStatus: 'single',
  category: 'teaching',
  bloodGroup: 'unknown',
  dateOfJoining: new Date().toISOString().split('T')[0]
};

// Validation constants
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 254,
  PHONE_REGEX: /^[+]?[\d\s\-()]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_NUMBER_REGEX: /^[A-Za-z0-9\-]{6,20}$/
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Helper functions
export const getTeacherRoleLabel = (roleValue) => {
  const role = TEACHER_ROLES.find(r => r.value === roleValue);
  return role ? role.label : roleValue;
};

export const getEmploymentTypeLabel = (typeValue) => {
  const type = EMPLOYMENT_TYPES.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
};

export const getStatusColor = (statusValue) => {
  const status = Object.values(TEACHER_STATUS).find(s => s.value === statusValue);
  return status ? status.color : '#718096';
};

export const getSubjectSpecializationLabel = (subjectValue) => {
  const subject = SUBJECT_SPECIALIZATIONS.find(s => s.value === subjectValue);
  return subject ? subject.label : subjectValue;
};

export const getDepartmentLabel = (deptValue) => {
  const dept = DEPARTMENTS.find(d => d.value === deptValue);
  return dept ? dept.label : deptValue;
};