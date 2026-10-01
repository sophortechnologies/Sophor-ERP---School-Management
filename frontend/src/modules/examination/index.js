// modules/examination/index.js
export { examinationApi } from './api/index.js';
export * from './constants/index.js';
export * from './utils/index.js';
export { useExamination } from './hooks/index.js';

// Pages
export { 
  ExamSetupPage, 
  MarksEntryPage, 
  ReportCardPage, 
  PerformanceAnalyticsPage, 
  ModerationPage 
} from './pages/index.js';

// Components - using the corrected barrel exports
export { 
  ExamForm, 
  MarksEntryForm, 
  BulkUploadModal, 
  ModerationPanel,
  GradeConfiguration,  // Now included!
  ReportCardView, 
  PerformanceChart 
} from './components/index.js';

// Routes
export { default as ExaminationRoutes } from './routes.jsx';