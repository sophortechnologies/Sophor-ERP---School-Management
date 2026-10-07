export const DEFAULT_GRADE_SCALES = [
  {
    grade: "A+",
    minPercentage: 95,
    maxPercentage: 100,
    gradePoint: 4.0,
    description: "Outstanding",
  },
  {
    grade: "A",
    minPercentage: 85,
    maxPercentage: 94.99,
    gradePoint: 4.0,
    description: "Excellent",
  },
  {
    grade: "B+",
    minPercentage: 75,
    maxPercentage: 84.99,
    gradePoint: 3.5,
    description: "Very Good",
  },
  {
    grade: "B",
    minPercentage: 65,
    maxPercentage: 74.99,
    gradePoint: 3.0,
    description: "Good",
  },
  {
    grade: "C+",
    minPercentage: 55,
    maxPercentage: 64.99,
    gradePoint: 2.5,
    description: "Satisfactory",
  },
  {
    grade: "C",
    minPercentage: 50,
    maxPercentage: 54.99,
    gradePoint: 2.0,
    description: "Pass",
  },
  {
    grade: "D",
    minPercentage: 40,
    maxPercentage: 49.99,
    gradePoint: 1.0,
    description: "Conditional Pass",
  },
  {
    grade: "F",
    minPercentage: 0,
    maxPercentage: 39.99,
    gradePoint: 0.0,
    description: "Fail",
  },
];

export const calculateGrade = (score, maxScore = 100, dynamicScales = []) => {
  const numScore = Number(score);
  const max = Number(maxScore) || 100;
  if (isNaN(numScore) || numScore < 0)
    return { grade: "—", gradePoint: 0, description: "N/A" };

  const percentage = (numScore / max) * 100;
  const scales =
    Array.isArray(dynamicScales) && dynamicScales.length > 0
      ? dynamicScales
      : DEFAULT_GRADE_SCALES;

  for (const s of scales) {
    const minP = Number(s.minPercentage ?? s.min ?? 0);
    const maxP = Number(s.maxPercentage ?? s.max ?? 100);
    if (percentage >= minP && percentage <= maxP) {
      return {
        grade: s.grade || s.name,
        gradePoint: Number(s.gradePoint || s.gpa || 0),
        description: s.description || s.remark || "Satisfactory",
      };
    }
  }

  return { grade: "F", gradePoint: 0.0, description: "Fail" };
};
