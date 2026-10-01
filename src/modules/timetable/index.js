// src/modules/timetable/index.js
export { default as TimetableManager } from "./components/TimetableManager";
export { default as TimetableForm } from "./components/TimetableForm";
export { default as MyTimetablePage } from "./pages/MyTimetablePage";
export {
  TimetableRoutes,
  AdminTimetableRoutes,
  TeacherTimetableRoutes,
  StudentTimetableRoutes,
} from "./routes";

export { useTimetable } from "./hooks/useTimetable";
export { timetableApi } from "./api/timetable.api";
