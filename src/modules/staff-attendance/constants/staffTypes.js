// src/modules/staff-attendance/constants/staffTypes.js
export const STAFF_TYPES = {
  TEACHING: 'TEACHING',
  NON_TEACHING: 'NON_TEACHING'
};

export const TEACHING_DESIGNATIONS = [
  'Principal',
  'Vice Principal', 
  'Head of Department',
  'Senior Teacher',
  'Teacher',
  'Assistant Teacher',
  'Visiting Faculty',
  'Professor',
  'Lecturer'
];

export const STAFF_TYPE_CONFIG = {
  [STAFF_TYPES.TEACHING]: {
    label: 'Teaching Staff',
    icon: '📚',
    color: '#3b82f6',
    filterBy: 'department'
  },
  [STAFF_TYPES.NON_TEACHING]: {
    label: 'Non-Teaching Staff',
    icon: '👨‍💼',
    color: '#8b5cf6',
    filterBy: 'designation'
  }
};