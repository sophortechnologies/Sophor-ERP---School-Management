// Export everything from the constants file
export * from './timetable.constants.js';

// Also export the default as a named export
import timetableConstantsDefault from './timetable.constants.js';
export const timetableConstants = timetableConstantsDefault;

// Keep default export
export default timetableConstantsDefault;