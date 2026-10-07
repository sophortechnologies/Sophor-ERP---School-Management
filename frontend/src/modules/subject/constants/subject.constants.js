// modules/subject/constants/subject.constants.js
export const SUBJECT_TYPES = [
  { value: 'core', label: 'Core Subject' },
  { value: 'elective', label: 'Elective Subject' },
  { value: 'optional', label: 'Optional Subject' },
  { value: 'extra_curricular', label: 'Extra Curricular' }
];

export const SUBJECT_CATEGORIES = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'language', label: 'Language' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'arts', label: 'Arts' },
  { value: 'physical_education', label: 'Physical Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'vocational', label: 'Vocational' }
];

export const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const SUBJECT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

export const DEFAULT_PERIODS_PER_WEEK = 5;
export const DEFAULT_TOTAL_MARKS = 100;
export const DEFAULT_PASSING_MARKS = 40;