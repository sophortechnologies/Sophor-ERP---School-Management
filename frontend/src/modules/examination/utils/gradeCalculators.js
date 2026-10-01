// src/modules/examination/utils/gradeCalculators.js
import { DEFAULT_GRADE_SCALES } from "../constants/gradeScales";

export const calculateTotalMarks = (marks) => {
  if (!marks || !Array.isArray(marks)) return 0;
  return marks.reduce(
    (total, mark) => total + (parseFloat(mark.marksObtained) || 0),
    0,
  );
};

export const calculateAverage = (marks) => {
  if (!marks || marks.length === 0) return 0;
  const total = calculateTotalMarks(marks);
  return (total / marks.length).toFixed(2);
};

export const calculateSubjectGrade = (
  marksObtained,
  totalMarks,
  gradeScale,
) => {
  if (!totalMarks || totalMarks === 0) return null;

  const percentage = (marksObtained / totalMarks) * 100;
  return calculateGradeFromPercentage(percentage, gradeScale);
};

export const calculateGradeFromPercentage = (percentage, gradeScale) => {
  const scale = gradeScale || DEFAULT_GRADE_SCALES.STANDARD_100;

  for (const threshold of scale.thresholds) {
    if (percentage >= threshold.min && percentage <= threshold.max) {
      return {
        grade: threshold.grade,
        gpa: threshold.gpa,
        description: threshold.description,
        percentage: percentage.toFixed(2),
      };
    }
  }

  return null;
};

export const calculateWeightedAverage = (subjects) => {
  if (!subjects || subjects.length === 0) return 0;

  let totalWeight = 0;
  let totalWeightedMarks = 0;

  subjects.forEach((subject) => {
    const weight = subject.weight || 1;
    const percentage = subject.percentage || 0;

    totalWeight += weight;
    totalWeightedMarks += percentage * weight;
  });

  return totalWeight > 0 ? (totalWeightedMarks / totalWeight).toFixed(2) : 0;
};

export const calculatePassFailStatus = (marksObtained, passingMarks) => {
  return marksObtained >= passingMarks ? "PASS" : "FAIL";
};

export const calculateClassAverage = (studentsResults) => {
  if (!studentsResults || studentsResults.length === 0) return 0;

  const total = studentsResults.reduce((sum, student) => {
    return sum + (student.percentage || 0);
  }, 0);

  return (total / studentsResults.length).toFixed(2);
};

export const calculateGradeDistribution = (studentsResults, gradeScale) => {
  const distribution = {};
  const scale = gradeScale || DEFAULT_GRADE_SCALES.STANDARD_100;

  scale.thresholds.forEach((threshold) => {
    distribution[threshold.grade] = 0;
  });

  studentsResults.forEach((student) => {
    if (student.grade) {
      distribution[student.grade] = (distribution[student.grade] || 0) + 1;
    }
  });

  return distribution;
};

export const calculatePercentageImprovement = (currentMarks, previousMarks) => {
  if (!previousMarks || previousMarks === 0) return null;

  const improvement = ((currentMarks - previousMarks) / previousMarks) * 100;
  return improvement.toFixed(2);
};
