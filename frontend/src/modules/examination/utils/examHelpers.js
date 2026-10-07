export const getExamStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "PENDING";

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Normalize to start-of-day and end-of-day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ONGOING";
  return "COMPLETED";
};

/**
 * Returns student display name safely across Prisma nested structures
 */
export const getStudentName = (studentOrId, studentList = []) => {
  if (!studentOrId) return "—";

  let s = typeof studentOrId === "object" ? studentOrId : null;
  if (!s && Array.isArray(studentList)) {
    const targetId = Number(studentOrId);
    s = studentList.find(
      (item) =>
        Number(item.id) === targetId ||
        Number(item.studentId) === targetId ||
        Number(item.userId) === targetId,
    );
  }

  if (!s) return `Student #${studentOrId}`;

  return (
    s.fullName ||
    (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : null) ||
    s.user?.fullName ||
    (s.user?.firstName
      ? `${s.user.firstName} ${s.user.lastName || ""}`.trim()
      : null) ||
    `Student #${s.id}`
  );
};
