// src/modules/examination/utils/examHelpers.js
export const calculatePercentage = (obtained, total) => {
  if (!total || total === 0) return 0;
  return ((obtained / total) * 100).toFixed(2);
};

export const calculateGrade = (percentage, gradeScale) => {
  if (!percentage && percentage !== 0) return null;

  const scale = gradeScale || DEFAULT_GRADE_SCALES.STANDARD_100;

  if (scale.system === "percentage") {
    for (const threshold of scale.thresholds) {
      if (percentage >= threshold.min && percentage <= threshold.max) {
        return {
          grade: threshold.grade,
          gpa: threshold.gpa,
          description: threshold.description,
        };
      }
    }
  }

  return null;
};

export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;

  const validGrades = grades.filter((grade) => grade.gpa !== undefined);
  if (validGrades.length === 0) return 0;

  const totalGPA = validGrades.reduce((sum, grade) => sum + grade.gpa, 0);
  return (totalGPA / validGrades.length).toFixed(2);
};

export const calculateCGPA = (allGrades) => {
  if (!allGrades || allGrades.length === 0) return 0;

  let totalCredits = 0;
  let totalGradePoints = 0;

  allGrades.forEach((term) => {
    if (term.grades && term.credits) {
      const termGPA = calculateGPA(term.grades);
      totalGradePoints += termGPA * term.credits;
      totalCredits += term.credits;
    }
  });

  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};

export const calculateRank = (studentsResults) => {
  if (!studentsResults || studentsResults.length === 0) return [];

  const sorted = [...studentsResults].sort((a, b) => {
    const totalA = a.totalMarks || 0;
    const totalB = b.totalMarks || 0;
    return totalB - totalA;
  });

  let currentRank = 1;
  let previousMarks = null;
  let skipCount = 0;

  return sorted.map((student, index) => {
    const currentMarks = student.totalMarks || 0;

    if (previousMarks !== null && currentMarks < previousMarks) {
      currentRank += 1 + skipCount;
      skipCount = 0;
    } else if (previousMarks !== null && currentMarks === previousMarks) {
      skipCount++;
    }

    previousMarks = currentMarks;

    return {
      ...student,
      rank: currentRank,
    };
  });
};

export const validateExamData = (examData) => {
  const errors = [];

  if (!examData.name?.trim()) {
    errors.push("Exam name is required");
  }

  if (!examData.classId) {
    errors.push("Class is required");
  }

  if (!examData.examDate) {
    errors.push("Exam date is required");
  }

  if (examData.totalMarks < 1) {
    errors.push("Total marks must be at least 1");
  }

  if (examData.passingMarks < 0) {
    errors.push("Passing marks cannot be negative");
  }

  if (examData.passingMarks > examData.totalMarks) {
    errors.push("Passing marks cannot exceed total marks");
  }

  return errors;
};

export const formatExamDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getExamStatusColor = (status) => {
  const colors = {
    draft: { bg: "#fef3c7", text: "#92400e" },
    scheduled: { bg: "#dbeafe", text: "#1e40af" },
    ongoing: { bg: "#dcfce7", text: "#166534" },
    completed: { bg: "#e0e7ff", text: "#3730a3" },
    published: { bg: "#d1fae5", text: "#065f46" },
    archived: { bg: "#f3f4f6", text: "#374151" },
  };

  return colors[status] || colors.draft;
};
