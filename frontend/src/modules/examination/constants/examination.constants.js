// src/modules/examination/constants/examination.constants.js

// DEFAULT EXAM FORM - Updated for backend expectations
export const DEFAULT_EXAM_FORM = {
  name: '',
  examTypeId: '',
  classId: '',
  academicSessionId: '',
  academicYear: new Date().getFullYear().toString(),
  term: '1',
  startDate: '',
  endDate: '',
  description: '',
};

// DEFAULT GRADE FORM - For marks entry
export const DEFAULT_GRADE_FORM = {
  studentId: '',
  examId: '',
  subjectId: '',
  marksObtained: '',
  totalMarks: 100,
  grade: '',
  remarks: '',
  enteredBy: ''
};

// TERM OPTIONS
export const TERM_OPTIONS = [
  { value: '1', label: 'Term 1' },
  { value: '2', label: 'Term 2' },
  { value: '3', label: 'Term 3' },
];

// EXAM STATUS
export const EXAM_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Note: Removed EXAM_TYPES and EXAM_TYPE_MAPPING since we'll fetch from backend