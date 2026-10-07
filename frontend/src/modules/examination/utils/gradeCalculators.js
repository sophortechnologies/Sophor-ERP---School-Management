import { DEFAULT_GRADE_SCALES } from "../constants/gradeScales";

/**
 * Calculates grade, GPA points, and remark from percentage score.
 * Safely accepts dynamic scales from the database or falls back to system defaults.
 */
export const calculateGrade = (score, totalMarks = 100, dynamicScales = []) => {
  const numScore = Number(score);
  const max = Number(totalMarks) || 100;

  if (
    score === "" ||
    score === null ||
    score === undefined ||
    isNaN(numScore)
  ) {
    return { grade: "—", gradePoint: 0.0, description: "N/A", percentage: 0 };
  }

  // Round percentage to 2 decimal places to avoid floating-point boundary misses
  const percentage = Math.round((Math.max(0, numScore) / max) * 10000) / 100;

  const scales =
    Array.isArray(dynamicScales) && dynamicScales.length > 0
      ? dynamicScales
      : DEFAULT_GRADE_SCALES;

  // Sort descending by min percentage to match highest boundary first
  const sortedScales = [...scales].sort(
    (a, b) =>
      Number(b.minPercentage ?? b.min ?? 0) -
      Number(a.minPercentage ?? a.min ?? 0),
  );

  for (const s of sortedScales) {
    const minP = Number(s.minPercentage ?? s.min ?? 0);
    const maxP = Number(s.maxPercentage ?? s.max ?? 100);

    if (percentage >= minP && percentage <= maxP + 0.01) {
      return {
        grade: s.grade || s.name,
        gradePoint: Number(s.gradePoint || s.gpa || 0),
        description: s.description || s.remark || "Satisfactory",
        percentage,
      };
    }
  }

  return { grade: "F", gradePoint: 0.0, description: "Fail", percentage };
};

/**
 * Computes Cumulative GPA across an array of subject marks
 */
export const calculateCGPA = (subjectMarks = [], dynamicScales = []) => {
  if (!Array.isArray(subjectMarks) || subjectMarks.length === 0) return "0.00";

  let totalPoints = 0;
  let validCount = 0;

  subjectMarks.forEach((item) => {
    const obtained = item.marksObtained ?? item.score;
    const max = item.totalMarks ?? item.maxScore ?? 100;

    if (obtained !== null && obtained !== undefined && obtained !== "") {
      const { gradePoint } = calculateGrade(obtained, max, dynamicScales);
      totalPoints += gradePoint;
      validCount += 1;
    }
  });

  if (validCount === 0) return "0.00";
  return (totalPoints / validCount).toFixed(2);
};
