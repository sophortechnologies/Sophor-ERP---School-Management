// src/modules/examination/utils/resultProcessors.js
export const calculateOverallResult = (marks, gradeScale) => {
  if (!marks || marks.length === 0) return null;

  const totalMarks = marks.reduce(
    (sum, mark) => sum + (mark.marksObtained || 0),
    0,
  );
  const maxMarks = marks.reduce(
    (sum, mark) => sum + (mark.totalMarks || 100),
    0,
  );
  const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

  let grade = "F";
  if (percentage >= 97) grade = "A+";
  else if (percentage >= 93) grade = "A";
  else if (percentage >= 90) grade = "A-";
  else if (percentage >= 87) grade = "B+";
  else if (percentage >= 83) grade = "B";
  else if (percentage >= 80) grade = "B-";
  else if (percentage >= 77) grade = "C+";
  else if (percentage >= 73) grade = "C";
  else if (percentage >= 70) grade = "C-";
  else if (percentage >= 60) grade = "D";

  return {
    totalMarks,
    maxMarks,
    percentage: percentage.toFixed(2),
    grade,
    status: percentage >= 40 ? "PASS" : "FAIL",
  };
};

export const calculateSubjectAverage = (marksBySubject) => {
  const averages = {};

  Object.entries(marksBySubject).forEach(([subject, marks]) => {
    if (marks.length > 0) {
      const total = marks.reduce((sum, mark) => sum + mark.marksObtained, 0);
      const maxTotal = marks.reduce((sum, mark) => sum + mark.totalMarks, 0);
      averages[subject] = {
        average: (total / marks.length).toFixed(2),
        percentage: maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : 0,
        count: marks.length,
      };
    }
  });

  return averages;
};

export const processBulkResults = (resultsData, gradeScale) => {
  const processed = {
    success: [],
    errors: [],
    summary: {
      total: resultsData.length,
      processed: 0,
      failed: 0,
    },
  };

  resultsData.forEach((result, index) => {
    try {
      if (!result.studentId || !result.examId) {
        throw new Error("Missing required fields");
      }

      if (
        result.marksObtained < 0 ||
        result.marksObtained > result.totalMarks
      ) {
        throw new Error("Invalid marks");
      }

      const percentage = (result.marksObtained / result.totalMarks) * 100;
      const overall = calculateOverallResult([result], gradeScale);

      processed.success.push({
        ...result,
        percentage: percentage.toFixed(2),
        grade: overall.grade,
        status: overall.status,
        processedAt: new Date().toISOString(),
      });

      processed.summary.processed++;
    } catch (error) {
      processed.errors.push({
        index,
        studentId: result.studentId,
        error: error.message,
        data: result,
      });
      processed.summary.failed++;
    }
  });

  return processed;
};

export const validateResultData = (resultData) => {
  const errors = [];

  if (!resultData.studentId) errors.push("Student ID is required");
  if (!resultData.examId) errors.push("Exam ID is required");
  if (resultData.marksObtained === undefined) errors.push("Marks are required");
  if (resultData.totalMarks === undefined)
    errors.push("Total marks are required");

  if (resultData.marksObtained < 0) errors.push("Marks cannot be negative");
  if (resultData.marksObtained > resultData.totalMarks) {
    errors.push("Marks cannot exceed total marks");
  }

  return errors;
};
