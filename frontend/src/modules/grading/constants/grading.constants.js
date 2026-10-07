export const ASSESSMENT_TYPES = [
  { value: "FINAL_EXAM", label: "Final Exam (100%)" },
  { value: "MID_TERM", label: "Mid-Term Exam" },
  { value: "TEST", label: "Continuous Assessment / Test" },
  { value: "ASSIGNMENT", label: "Assignment / Project" },
  { value: "QUIZ", label: "Quiz" },
];

export const TERMS = [
  { value: "TERM_1", label: "Term 1 (Semester 1)" },
  { value: "TERM_2", label: "Term 2 (Semester 2)" },
  { value: "TERM_3", label: "Term 3" },
];

export const STANDARD_GRADE_BOUNDARIES = [
  { grade: "A+", min: 95, max: 100, gpa: 4.0, remark: "Outstanding" },
  { grade: "A", min: 85, max: 94.99, gpa: 4.0, remark: "Excellent" },
  { grade: "B+", min: 75, max: 84.99, gpa: 3.5, remark: "Very Good" },
  { grade: "B", min: 65, max: 74.99, gpa: 3.0, remark: "Good" },
  { grade: "C+", min: 55, max: 64.99, gpa: 2.5, remark: "Satisfactory" },
  { grade: "C", min: 50, max: 54.99, gpa: 2.0, remark: "Fair / Pass" },
  { grade: "D", min: 40, max: 49.99, gpa: 1.0, remark: "Conditional Pass" },
  { grade: "F", min: 0, max: 39.99, gpa: 0.0, remark: "Fail" },
];

export const calculateGrade = (score) => {
  const num = Number(score);
  if (isNaN(num)) return { grade: "—", gpa: 0, remark: "N/A" };
  for (const b of STANDARD_GRADE_BOUNDARIES) {
    if (num >= b.min && num <= b.max) {
      return b;
    }
  }
  return { grade: "F", gpa: 0.0, remark: "Fail" };
};
