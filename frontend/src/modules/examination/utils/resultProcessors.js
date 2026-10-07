import { calculateGrade } from "./gradeCalculators";

/**
 * Calculates summary metrics for a class or examination subject evaluation sheet
 */
export const processSubjectResults = (
  marksList = [],
  totalMarks = 100,
  dynamicScales = [],
) => {
  if (!Array.isArray(marksList) || marksList.length === 0) {
    return {
      totalStudents: 0,
      evaluatedStudents: 0,
      absentStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      failCount: 0,
      passPercentage: 0,
    };
  }

  let totalObtained = 0;
  let highest = -Infinity;
  let lowest = Infinity;
  let evaluated = 0;
  let absent = 0;
  let passCount = 0;
  let failCount = 0;

  marksList.forEach((entry) => {
    const scoreVal = entry.marksObtained ?? entry.score;

    if (scoreVal === null || scoreVal === undefined || scoreVal === "") {
      absent += 1;
      return;
    }

    const numericScore = Number(scoreVal);
    if (isNaN(numericScore)) {
      absent += 1;
      return;
    }

    evaluated += 1;
    totalObtained += numericScore;

    if (numericScore > highest) highest = numericScore;
    if (numericScore < lowest) lowest = numericScore;

    const { grade } = calculateGrade(numericScore, totalMarks, dynamicScales);
    if (grade === "F") {
      failCount += 1;
    } else {
      passCount += 1;
    }
  });

  const average = evaluated > 0 ? (totalObtained / evaluated).toFixed(1) : 0;
  const passRate =
    evaluated > 0 ? ((passCount / evaluated) * 100).toFixed(1) : 0;

  return {
    totalStudents: marksList.length,
    evaluatedStudents: evaluated,
    absentStudents: absent,
    averageScore: Number(average),
    highestScore: highest === -Infinity ? 0 : highest,
    lowestScore: lowest === Infinity ? 0 : lowest,
    passCount,
    failCount,
    passPercentage: Number(passRate),
  };
};

/**
 * Groups an array of marks by Student ID for report card generation
 */
export const groupMarksByStudent = (marksList = []) => {
  const map = new Map();

  marksList.forEach((entry) => {
    const studentId = Number(entry.studentId || entry.student?.id);
    if (!studentId) return;

    if (!map.has(studentId)) {
      map.set(studentId, {
        student: entry.student || { id: studentId },
        marks: [],
      });
    }

    map.get(studentId).marks.push(entry);
  });

  return Array.from(map.values());
};
