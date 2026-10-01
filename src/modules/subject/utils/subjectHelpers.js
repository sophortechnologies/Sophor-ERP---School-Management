// modules/subject/utils/subjectHelpers.js
export const getSubjectTypeLabel = (type) => {
  const types = {
    core: 'Core Subject',
    elective: 'Elective Subject',
    optional: 'Optional Subject',
    extra_curricular: 'Extra Curricular'
  };
  return types[type] || type;
};

export const getSubjectCategoryLabel = (category) => {
  const categories = {
    mathematics: 'Mathematics',
    science: 'Science',
    language: 'Language',
    humanities: 'Humanities',
    arts: 'Arts',
    physical_education: 'Physical Education',
    technology: 'Technology',
    vocational: 'Vocational'
  };
  return categories[category] || category;
};

export const formatGrades = (grades) => {
  if (!grades || !Array.isArray(grades) || grades.length === 0) return 'N/A';
  
  // Sort grades numerically
  const sortedGrades = [...grades].sort((a, b) => a - b);
  
  // Group consecutive grades
  const ranges = [];
  let start = sortedGrades[0];
  let end = start;
  
  for (let i = 1; i < sortedGrades.length; i++) {
    if (sortedGrades[i] === end + 1) {
      end = sortedGrades[i];
    } else {
      ranges.push(start === end ? `Grade ${start}` : `Grades ${start}-${end}`);
      start = sortedGrades[i];
      end = start;
    }
  }
  
  ranges.push(start === end ? `Grade ${start}` : `Grades ${start}-${end}`);
  return ranges.join(', ');
};

export const getSubjectStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    inactive: '#6b7280',
    archived: '#f59e0b'
  };
  return colors[status] || '#6b7280';
};