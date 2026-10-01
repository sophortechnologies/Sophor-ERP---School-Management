// modules/teacher/index.js
export { teacherApi } from './api/index.js';
export * from './constants/index.js';
export * from './utils/index.js';
export { useTeacher } from './hooks/index.js';
export { TeacherManagementPage, TeacherProfilePage } from './pages/index.js';
export { TeacherForm, TeacherCard,  } from './components/index.js';
export { default as TeacherRoutes } from './routes.jsx';