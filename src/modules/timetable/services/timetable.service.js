// src/modules/timetable/services/timetable.service.js - UPDATED WITH SECTIONS
import api from "../../../lib/api";
import { API_ENDPOINTS } from '../../../config/swagger.config.js';
import { classesApi } from '../../classes/api/classes.api';

/**
 * Timetable Service - Using REAL data from your backend APIs
 */

// Helper function to test API connection
const testApiConnection = async (endpoint) => {
  try {
    console.log(`🔌 Testing connection to ${endpoint}...`);
    const response = await api.get(endpoint);
    console.log(`✅ ${endpoint} is accessible`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ ${endpoint} connection failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Helper function to validate and format period data
const validateAndFormatPeriod = (period) => {
  console.log("🔍 Validating period data:", period);
  
  // Ensure all IDs are integers
  const formattedPeriod = {
    sectionId: parseInt(period.sectionId) || parseInt(period.section_id) || 1,
    subjectId: parseInt(period.subjectId) || parseInt(period.subject_id) || 1,
    teacherId: parseInt(period.teacherId) || parseInt(period.teacher_id) || 1,
    dayOfWeek: period.dayOfWeek || 'MON',
    startTime: period.startTime || new Date().toISOString(),
    endTime: period.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString()
  };
  
  // Validate ISO date strings
  const isValidISO = (str) => {
    if (typeof str !== 'string') return false;
    try {
      const date = new Date(str);
      return !isNaN(date.getTime()) && str.includes('T') && str.includes('Z');
    } catch {
      return false;
    }
  };
  
  // Fix startTime if not valid ISO
  if (!isValidISO(formattedPeriod.startTime)) {
    const startDate = new Date();
    startDate.setHours(8, 30, 0, 0);
    formattedPeriod.startTime = startDate.toISOString();
  }
  
  // Fix endTime if not valid ISO
  if (!isValidISO(formattedPeriod.endTime)) {
    const endDate = new Date(formattedPeriod.startTime);
    endDate.setHours(endDate.getHours() + 1);
    formattedPeriod.endTime = endDate.toISOString();
  }
  
  console.log("✅ Formatted period for API:", formattedPeriod);
  console.log("🔍 Type verification:");
  console.log("  sectionId:", typeof formattedPeriod.sectionId, "->", formattedPeriod.sectionId);
  console.log("  subjectId:", typeof formattedPeriod.subjectId, "->", formattedPeriod.subjectId);
  console.log("  teacherId:", typeof formattedPeriod.teacherId, "->", formattedPeriod.teacherId);
  console.log("  dayOfWeek:", typeof formattedPeriod.dayOfWeek, "->", formattedPeriod.dayOfWeek);
  console.log("  startTime:", typeof formattedPeriod.startTime, "->", formattedPeriod.startTime);
  console.log("  endTime:", typeof formattedPeriod.endTime, "->", formattedPeriod.endTime);
  
  return formattedPeriod;
};

// Fetch REAL data from backend INCLUDING SECTIONS
const fetchRealData = async () => {
  try {
    console.log("🔍 Fetching REAL data from backend APIs...");
    
    let classes = [];
    let teachers = [];
    let subjects = [];
    
    // 1. Fetch Classes (using your classesApi)
    try {
      console.log("📚 Fetching classes...");
      const classesResponse = await classesApi.getClasses();
      
      if (classesResponse.data && Array.isArray(classesResponse.data)) {
        classes = classesResponse.data;
        console.log(`✅ Found ${classes.length} classes`);
        
        // For each class, fetch its sections
        const classesWithSections = await Promise.all(
          classes.map(async (cls) => {
            try {
              const sectionsResponse = await classesApi.getSectionsByClass(cls.id);
              return {
                ...cls,
                sections: sectionsResponse.data || []
              };
            } catch (sectionError) {
              console.error(`⚠️ Could not fetch sections for class ${cls.id}:`, sectionError.message);
              return {
                ...cls,
                sections: [
                  { id: cls.id * 10 + 1, name: 'A', sectionName: 'A' },
                  { id: cls.id * 10 + 2, name: 'B', sectionName: 'B' }
                ]
              };
            }
          })
        );
        
        classes = classesWithSections;
      } else {
        console.warn("No classes found in response");
        classes = [];
      }
    } catch (classError) {
      console.error("❌ Error fetching classes:", classError.message);
      classes = [];
    }
    
    // 2. Fetch Teachers (using /teacher endpoint - singular)
    try {
      console.log("👨‍🏫 Fetching teachers...");
      const teachersResponse = await api.get("/teacher");
      
      if (teachersResponse.data) {
        // Handle different response formats
        if (teachersResponse.data.data && Array.isArray(teachersResponse.data.data)) {
          teachers = teachersResponse.data.data;
        } else if (Array.isArray(teachersResponse.data)) {
          teachers = teachersResponse.data;
        } else {
          console.warn("Unexpected teachers response format:", teachersResponse.data);
          teachers = [];
        }
        
        console.log(`✅ Found ${teachers.length} teachers`);
        
        // Transform teachers to consistent format
        teachers = teachers.map(teacher => ({
          id: parseInt(teacher.id) || teacher.id,
          name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name || `Teacher ${teacher.id}`,
          email: teacher.email || '',
          phone: teacher.phone || '',
          specialization: teacher.specialization || teacher.qualification || 'General',
          departmentId: parseInt(teacher.departmentId) || parseInt(teacher.department_id) || 1
        }));
      }
    } catch (teacherError) {
      console.error("❌ Error fetching teachers:", teacherError.message);
      teachers = [];
    }
    
    // 3. Fetch Subjects (using /subjects endpoint)
    try {
      console.log("📖 Fetching subjects...");
      const subjectsResponse = await api.get("/subjects");
      
      if (subjectsResponse.data) {
        // Handle different response formats
        if (subjectsResponse.data.data && Array.isArray(subjectsResponse.data.data)) {
          subjects = subjectsResponse.data.data;
        } else if (Array.isArray(subjectsResponse.data)) {
          subjects = subjectsResponse.data;
        } else {
          console.warn("Unexpected subjects response format:", subjectsResponse.data);
          subjects = [];
        }
        
        console.log(`✅ Found ${subjects.length} subjects`);
        
        // Transform subjects to consistent format
        subjects = subjects.map(subject => ({
          id: parseInt(subject.id) || subject.id,
          name: subject.name || subject.subjectName || `Subject ${subject.id}`,
          code: subject.code || subject.subjectCode || '',
          description: subject.description || ''
        }));
      }
    } catch (subjectError) {
      console.error("❌ Error fetching subjects:", subjectError.message);
      subjects = [];
    }
    
    // 4. Generate mock rooms (since you might not have rooms API)
    const rooms = [
      { id: 1, name: 'Room 101', capacity: 30, type: 'classroom' },
      { id: 2, name: 'Room 102', capacity: 35, type: 'classroom' },
      { id: 3, name: 'Room 103', capacity: 40, type: 'classroom' },
      { id: 4, name: 'Science Lab', capacity: 25, type: 'lab' },
      { id: 5, name: 'Computer Lab', capacity: 30, type: 'lab' }
    ];
    
    const result = {
      classes,
      teachers,
      subjects,
      rooms,
      usingRealData: classes.length > 0 || teachers.length > 0 || subjects.length > 0
    };
    
    console.log("✅ REAL data fetched successfully:", {
      classes: classes.length,
      teachers: teachers.length,
      subjects: subjects.length,
      usingRealData: result.usingRealData
    });
    
    return result;
    
  } catch (error) {
    console.error("❌ Error in fetchRealData:", error.message);
    
    // Fall back to comprehensive mock data
    console.log("🔄 Falling back to comprehensive mock data...");
    return generateComprehensiveMockData();
  }
};

// Generate comprehensive mock data for demonstration
const generateComprehensiveMockData = () => {
  console.log("🔄 Generating comprehensive mock data for demonstration...");
  
  const mockClasses = [
    { 
      id: 1, 
      name: 'Class 10',
      grade: '10',
      sections: [
        { id: 1, name: 'A', sectionName: 'A' },
        { id: 2, name: 'B', sectionName: 'B' },
        { id: 3, name: 'C', sectionName: 'C' }
      ]
    },
    { 
      id: 2, 
      name: 'Class 11',
      grade: '11',
      sections: [
        { id: 4, name: 'A', sectionName: 'A' },
        { id: 5, name: 'B', sectionName: 'B' }
      ]
    },
    { 
      id: 3, 
      name: 'Class 12',
      grade: '12',
      sections: [
        { id: 6, name: 'Science', sectionName: 'Science' },
        { id: 7, name: 'Commerce', sectionName: 'Commerce' },
        { id: 8, name: 'Arts', sectionName: 'Arts' }
      ]
    },
    { 
      id: 4, 
      name: 'Class 9',
      grade: '9',
      sections: [
        { id: 9, name: 'A', sectionName: 'A' },
        { id: 10, name: 'B', sectionName: 'B' }
      ]
    }
  ];
  
  const mockTeachers = [
    { id: 1, name: 'Dr. Sharma', email: 'sharma@school.com', specialization: 'Mathematics', departmentId: 1 },
    { id: 2, name: 'Ms. Patel', email: 'patel@school.com', specialization: 'Physics', departmentId: 2 },
    { id: 3, name: 'Mr. Kumar', email: 'kumar@school.com', specialization: 'Chemistry', departmentId: 2 },
    { id: 4, name: 'Mrs. Gupta', email: 'gupta@school.com', specialization: 'Biology', departmentId: 2 },
    { id: 5, name: 'Prof. Singh', email: 'singh@school.com', specialization: 'English', departmentId: 3 }
  ];
  
  const mockSubjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', description: 'Algebra, Calculus, Geometry' },
    { id: 2, name: 'Physics', code: 'PHY101', description: 'Mechanics, Thermodynamics, Optics' },
    { id: 3, name: 'Chemistry', code: 'CHEM101', description: 'Organic, Inorganic, Physical Chemistry' },
    { id: 4, name: 'Biology', code: 'BIO101', description: 'Botany, Zoology, Genetics' },
    { id: 5, name: 'English', code: 'ENG101', description: 'Literature, Grammar, Composition' },
    { id: 6, name: 'Computer Science', code: 'CS101', description: 'Programming, Algorithms, Data Structures' }
  ];
  
  const mockRooms = [
    { id: 1, name: 'Room 101', capacity: 30, type: 'classroom' },
    { id: 2, name: 'Room 102', capacity: 35, type: 'classroom' },
    { id: 3, name: 'Room 103', capacity: 40, type: 'classroom' },
    { id: 4, name: 'Science Lab', capacity: 25, type: 'lab' },
    { id: 5, name: 'Computer Lab', capacity: 30, type: 'lab' }
  ];
  
  return {
    classes: mockClasses,
    teachers: mockTeachers,
    subjects: mockSubjects,
    rooms: mockRooms,
    usingRealData: false
  };
};

// Generate timetable periods with proper data types
const generateTimetablePeriods = (config, realData) => {
  const { classes, teachers, subjects, rooms } = realData;
  const periods = [];
  
  const selectedClass = config.selectedClasses && config.selectedClasses.length > 0 
    ? config.selectedClasses[0] 
    : classes[0];
  
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const periodsPerDay = config.periodsPerDay || 8;
  
  // Generate a realistic timetable
  let periodId = 1;
  days.forEach((day, dayIndex) => {
    for (let period = 1; period <= periodsPerDay; period++) {
      // Skip break periods
      if ((period === 4 || period === 7) && config.includeBreaks) {
        periods.push({
          id: periodId++,
          dayOfWeek: day,
          periodNumber: period,
          isBreak: true,
          breakDuration: config.breakDuration || 15,
          type: 'break'
        });
        continue;
      }
      
      // Select subject, teacher, and room
      const subjectIndex = (period + day.length) % (subjects.length || 1);
      const teacherIndex = (period + day.length) % (teachers.length || 1);
      const roomIndex = period % (rooms.length || 1);
      
      const subject = subjects[subjectIndex] || { id: 1, name: 'Mathematics' };
      const teacher = teachers[teacherIndex] || { id: 1, name: 'Dr. Sharma' };
      const room = rooms[roomIndex] || { id: 1, name: 'Room 101' };
      
      // Calculate times with proper ISO format
      const startHour = 8;
      const periodDuration = config.periodDuration || 45;
      const breakDuration = config.breakDuration || 15;
      
      let startMinutes = startHour * 60 + ((period - 1) * periodDuration);
      // Account for breaks
      const breaksBefore = Math.floor((period - 1) / 3);
      startMinutes += breaksBefore * breakDuration;
      
      const endMinutes = startMinutes + periodDuration;
      
      // Create dates with proper ISO format
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayIndex); // Different day for each column
      baseDate.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      const startTime = baseDate.toISOString();
      
      const endDate = new Date(baseDate);
      endDate.setMinutes(endDate.getMinutes() + periodDuration);
      const endTime = endDate.toISOString();
      
      periods.push({
        id: periodId++,
        sectionId: parseInt(selectedClass.sections?.[0]?.id) || 1,
        subjectId: parseInt(subject.id) || 1,
        teacherId: parseInt(teacher.id) || 1,
        dayOfWeek: day,
        periodNumber: period,
        startTime: startTime,
        endTime: endTime,
        subjectName: subject.name,
        teacherName: teacher.name,
        roomName: room.name,
        roomId: parseInt(room.id) || 1,
        type: room.type === 'lab' ? 'lab' : 'lecture'
      });
    }
  });
  
  console.log(`✅ Generated ${periods.length} periods`);
  return periods;
};

// Test backend connection
const testBackendConnection = async () => {
  console.log("🔌 Testing backend connection with real endpoints...");
  
  const endpointsToTest = [
    '/teacher',        // Your teacher endpoint (singular)
    '/classes',        // Your classes endpoint
    '/sections',       // Your sections endpoint
    '/subjects'        // Your subjects endpoint
  ];
  
  const results = [];
  
  for (const endpoint of endpointsToTest) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await api.get(endpoint);
      results.push({
        endpoint,
        success: true,
        dataCount: Array.isArray(response.data) ? response.data.length : 
                  (response.data?.data && Array.isArray(response.data.data)) ? response.data.data.length : 0
      });
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log("📊 Backend connection test results:", results);
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  return {
    success: successfulTests > 0,
    results,
    summary: `${successfulTests}/${totalTests} endpoints accessible`
  };
};

// Transform timetable for display
const transformTimetableForDisplay = (timetable) => {
  console.log("🔄 Transforming timetable data for display:", timetable);
  
  // If timetable already has the right display format, return it
  if (timetable && (timetable.monday || timetable.tuesday || timetable.info)) {
    return timetable;
  }
  
  // Create display timetable structure
  const displayTimetable = {
    info: {
      name: timetable.name || `Timetable ${timetable.id}`,
      academicYear: timetable.academicYear || '2024-2025',
      semester: timetable.semester || '1',
      className: timetable.className || 'Class',
      sectionName: timetable.sectionName || 'A',
      startDate: timetable.startDate,
      endDate: timetable.endDate,
      status: timetable.status || 'draft',
      createdAt: timetable.createdAt,
      updatedAt: timetable.updatedAt
    },
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  };
  
  // Check if we have periods data
  if (timetable.periods && Array.isArray(timetable.periods)) {
    console.log(`📊 Processing ${timetable.periods.length} periods`);
    
    // Map day strings
    const dayMap = {
      'MON': 'monday', 'TUE': 'tuesday', 'WED': 'wednesday',
      'THU': 'thursday', 'FRI': 'friday', 'SAT': 'saturday', 'SUN': 'sunday'
    };
    
    timetable.periods.forEach(period => {
      const day = dayMap[period.dayOfWeek] || 'monday';
      
      const displayPeriod = {
        periodNumber: period.periodNumber || 1,
        startTime: period.startTime ? 
          (period.startTime.includes('T') ? 
            period.startTime.split('T')[1].substring(0, 5) : 
            period.startTime.substring(0, 5)) : 
          '08:00',
        endTime: period.endTime ? 
          (period.endTime.includes('T') ? 
            period.endTime.split('T')[1].substring(0, 5) : 
            period.endTime.substring(0, 5)) : 
          '08:45',
        subjectName: period.subjectName || period.subject?.name || 'Subject',
        teacherName: period.teacherName || period.teacher?.name || 'Teacher',
        roomNumber: period.roomName || period.roomNumber || 'Room 101',
        type: period.type || 'lecture',
        isBreak: period.isBreak || false
      };
      
      if (displayTimetable[day]) {
        displayTimetable[day].push(displayPeriod);
      }
    });
    
    // Sort periods by time
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      if (displayTimetable[day].length > 0) {
        displayTimetable[day].sort((a, b) => {
          const timeA = a.startTime.replace(':', '');
          const timeB = b.startTime.replace(':', '');
          return timeA.localeCompare(timeB);
        });
      }
    });
  } else {
    console.log("⚠️ No periods data found, creating empty timetable");
  }
  
  return displayTimetable;
};

// Get timetable by ID with real data
const getTimetableById = async (id) => {
  try {
    console.log(`📅 Fetching timetable ${id}...`);
    const response = await api.get(API_ENDPOINTS.TIMETABLE.BY_ID(id));
    
    let timetable = null;
    if (response.data) {
      timetable = response.data.data || response.data;
    }
    
    if (!timetable) {
      console.log(`ℹ️ Timetable ${id} not found`);
      return null;
    }
    
    // Transform to display format
    const displayTimetable = transformTimetableForDisplay(timetable);
    console.log("✅ Timetable transformed for display:", displayTimetable);
    
    return displayTimetable;
    
  } catch (error) {
    console.error(`❌ Error fetching timetable ${id}:`, error);
    
    // Check if it's a 404 error
    if (error.response?.status === 404) {
      console.log(`📅 Timetable ${id} not found, creating demo timetable`);
      return createDemoTimetable(id);
    }
    
    throw error;
  }
};

// Create demo timetable for testing
const createDemoTimetable = (id) => {
  const demoTimetable = {
    info: {
      name: `Demo Timetable ${id}`,
      academicYear: '2024-2025',
      semester: '1',
      className: 'Class 10',
      sectionName: 'A',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'draft'
    },
    monday: [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45', subjectName: 'Mathematics', teacherName: 'Dr. Sharma', roomNumber: '101', type: 'lecture' },
      { periodNumber: 2, startTime: '08:45', endTime: '09:30', subjectName: 'Physics', teacherName: 'Ms. Patel', roomNumber: '102', type: 'lecture' },
      { periodNumber: 3, startTime: '09:30', endTime: '10:15', subjectName: 'Chemistry', teacherName: 'Mr. Kumar', roomNumber: '103', type: 'lecture' },
      { periodNumber: 4, startTime: '10:15', endTime: '10:30', subjectName: 'Break', isBreak: true, type: 'break' },
      { periodNumber: 5, startTime: '10:30', endTime: '11:15', subjectName: 'Biology', teacherName: 'Mrs. Gupta', roomNumber: '104', type: 'lecture' }
    ],
    tuesday: [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45', subjectName: 'English', teacherName: 'Prof. Singh', roomNumber: '101', type: 'lecture' },
      { periodNumber: 2, startTime: '08:45', endTime: '09:30', subjectName: 'Mathematics', teacherName: 'Dr. Sharma', roomNumber: '102', type: 'lecture' },
      { periodNumber: 3, startTime: '09:30', endTime: '10:15', subjectName: 'Computer Science', teacherName: 'Mr. Verma', roomNumber: 'Lab-1', type: 'lab' }
    ],
    wednesday: [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45', subjectName: 'Physics Lab', teacherName: 'Ms. Patel', roomNumber: 'Science Lab', type: 'lab' },
      { periodNumber: 2, startTime: '08:45', endTime: '09:30', subjectName: 'Chemistry', teacherName: 'Mr. Kumar', roomNumber: '103', type: 'lecture' }
    ],
    thursday: [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45', subjectName: 'Biology', teacherName: 'Mrs. Gupta', roomNumber: '104', type: 'lecture' },
      { periodNumber: 2, startTime: '08:45', endTime: '09:30', subjectName: 'English', teacherName: 'Prof. Singh', roomNumber: '101', type: 'lecture' }
    ],
    friday: [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45', subjectName: 'Mathematics', teacherName: 'Dr. Sharma', roomNumber: '102', type: 'lecture' },
      { periodNumber: 2, startTime: '08:45', endTime: '09:30', subjectName: 'Physics', teacherName: 'Ms. Patel', roomNumber: '103', type: 'lecture' },
      { periodNumber: 3, startTime: '09:30', endTime: '10:15', subjectName: 'Computer Science', teacherName: 'Mr. Verma', roomNumber: 'Lab-1', type: 'lab' }
    ],
    saturday: [],
    sunday: []
  };
  
  return demoTimetable;
};

// Generate timetable
const generateTimetable = async (config) => {
  console.log("🤖 Generating timetable with config:", config);
  
  try {
    // Fetch real data first
    const realData = await fetchRealData();
    
    // Generate periods with proper data types
    const periods = generateTimetablePeriods(config, realData);
    
    const selectedClass = config.selectedClasses && config.selectedClasses.length > 0 
      ? config.selectedClasses[0] 
      : realData.classes[0];
    
    // Create the generated timetable object
    const generatedTimetable = {
      id: `timetable_${Date.now()}`,
      info: {
        name: `${selectedClass?.name || 'Class'} Timetable - ${config.academicYear || '2024-2025'}`,
        academicYear: config.academicYear || '2024-2025',
        term: config.term || 'Term 1',
        className: selectedClass?.name || 'Class',
        section: selectedClass?.sections?.[0]?.name || 'A',
        sectionId: parseInt(selectedClass?.sections?.[0]?.id) || 1,
        workingDays: config.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        periodsPerDay: config.periodsPerDay || 8,
        periodDuration: config.periodDuration || 45,
        includeBreaks: config.includeBreaks || true,
        breakDuration: config.breakDuration || 15,
        startDate: config.startDate,
        endDate: config.endDate,
        status: 'draft',
        generatedAt: new Date().toISOString(),
        usingRealData: realData.usingRealData
      },
      
      // All periods for potential bulk creation
      periods: periods,
      
      // First period for immediate creation
      firstPeriod: periods[0],
      
      // Statistics
      statistics: {
        totalPeriods: periods.length,
        teachingPeriods: periods.filter(p => !p.isBreak).length,
        breakPeriods: periods.filter(p => p.isBreak).length,
        labPeriods: periods.filter(p => p.type === 'lab').length,
        uniqueSubjects: new Set(periods.filter(p => p.subjectId).map(p => p.subjectId)).size,
        uniqueTeachers: new Set(periods.filter(p => p.teacherId).map(p => p.teacherId)).size,
        uniqueRooms: new Set(periods.filter(p => p.roomId).map(p => p.roomId)).size
      },
      
      // Store real data reference
      realData: {
        classes: realData.classes,
        teachers: realData.teachers,
        subjects: realData.subjects
      }
    };
    
    console.log("✅ Timetable generated successfully:", {
      periods: generatedTimetable.periods.length,
      usingRealData: realData.usingRealData
    });
    
    return generatedTimetable;
    
  } catch (error) {
    console.error("❌ Error generating timetable:", error);
    throw error;
  }
};

// Create timetable (single period) - FIXED VERSION
const createTimetable = async (periodData) => {
  try {
    console.log("📝 Creating timetable period...");
    console.log("📥 Input period data:", periodData);
    
    // Validate and format the period data
    const formattedPeriod = validateAndFormatPeriod(periodData);
    
    console.log("📤 Sending to API:", formattedPeriod);
    console.log("📤 Stringified:", JSON.stringify(formattedPeriod, null, 2));
    
    const response = await api.post(API_ENDPOINTS.TIMETABLE.BASE, formattedPeriod);
    
    console.log("✅ Timetable period created:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("❌ Error creating timetable period:");
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
      
      if (error.response.data?.message) {
        console.error("Backend validation errors:");
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg, idx) => {
            console.error(`  ${idx + 1}. ${msg}`);
          });
        } else {
          console.error("  ", error.response.data.message);
        }
      }
      
      // Provide troubleshooting tips
      if (error.response.status === 400) {
        console.error("💡 TROUBLESHOOTING TIPS:");
        console.error("1. Ensure sectionId, subjectId, teacherId are INTEGER numbers (not strings)");
        console.error("2. startTime and endTime must be ISO 8601 strings like: '2024-01-15T08:30:00.000Z'");
        console.error("3. Check that all required fields are present");
        console.error("4. Verify the backend accepts this exact format");
      }
    } else if (error.request) {
      console.error("No response received. Request:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    
    throw error;
  }
};

// Create multiple timetable periods
const createTimetablePeriods = async (periods) => {
  try {
    console.log(`📝 Creating ${periods.length} timetable periods...`);
    
    const createdPeriods = [];
    
    for (let i = 0; i < periods.length; i++) {
      console.log(`Creating period ${i + 1}/${periods.length}...`);
      try {
        // Validate and format each period
        const formattedPeriod = validateAndFormatPeriod(periods[i]);
        const savedPeriod = await createTimetable(formattedPeriod);
        createdPeriods.push(savedPeriod);
        console.log(`✅ Period ${i + 1} created successfully`);
      } catch (periodError) {
        console.error(`❌ Failed to create period ${i + 1}:`, periodError.message);
        // Continue with other periods
      }
    }
    
    console.log(`✅ Created ${createdPeriods.length}/${periods.length} periods`);
    return createdPeriods;
    
  } catch (error) {
    console.error("❌ Error in bulk creation:", error);
    throw error;
  }
};

// Get all timetables
const getAllTimetables = async () => {
  try {
    console.log("📅 Fetching all timetables...");
    const response = await api.get(API_ENDPOINTS.TIMETABLE.BASE);
    
    let timetables = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        timetables = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        timetables = response.data.data;
      }
    }
    
    console.log(`✅ Found ${timetables.length} timetables`);
    
    // Transform each timetable for display
    return timetables.map(t => transformTimetableForDisplay(t));
    
  } catch (error) {
    console.error("❌ Error fetching timetables:", error);
    return [];
  }
};

// Update timetable
const updateTimetable = async (id, updateData) => {
  try {
    console.log(`🔄 Updating timetable ${id}...`);
    const response = await api.patch(API_ENDPOINTS.TIMETABLE.BY_ID(id), updateData);
    
    console.log("✅ Timetable updated:", response.data);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error updating timetable ${id}:`, error);
    throw error;
  }
};

// Delete timetable
const deleteTimetable = async (id) => {
  try {
    console.log(`🗑️ Deleting timetable ${id}...`);
    const response = await api.delete(API_ENDPOINTS.TIMETABLE.BY_ID(id));
    
    console.log("✅ Timetable deleted:", response.data);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error deleting timetable ${id}:`, error);
    throw error;
  }
};

// Get section timetable
const getSectionTimetable = async (sectionId) => {
  try {
    console.log(`📅 Fetching section timetable ${sectionId}...`);
    const response = await api.get(API_ENDPOINTS.TIMETABLE.SECTION_TIMETABLE(sectionId));
    
    let timetable = null;
    if (response.data) {
      timetable = response.data.data || response.data;
    }
    
    if (!timetable) {
      console.log(`ℹ️ No timetable found for section ${sectionId}`);
      return null;
    }
    
    return transformTimetableForDisplay(timetable);
    
  } catch (error) {
    console.error(`❌ Error fetching section timetable ${sectionId}:`, error);
    return null;
  }
};

// Get teacher timetable
const getTeacherTimetable = async (teacherId) => {
  try {
    console.log(`📅 Fetching teacher timetable ${teacherId}...`);
    const response = await api.get(API_ENDPOINTS.TIMETABLE.TEACHER_TIMETABLE(teacherId));
    
    let timetable = null;
    if (response.data) {
      timetable = response.data.data || response.data;
    }
    
    if (!timetable) {
      console.log(`ℹ️ No timetable found for teacher ${teacherId}`);
      return null;
    }
    
    return transformTimetableForDisplay(timetable);
    
  } catch (error) {
    console.error(`❌ Error fetching teacher timetable ${teacherId}:`, error);
    return null;
  }
};

// Main service object
const timetableService = {
  // Data fetching
  fetchRealData,
  testBackendConnection,
  
  // Timetable operations
  getTimetableById,
  getAllTimetables,
  createTimetable,
  createTimetablePeriods,
  updateTimetable,
  deleteTimetable,
  generateTimetable,
  getSectionTimetable,
  getTeacherTimetable,
  
  // Helper methods
  transformTimetableForDisplay,
  createDemoTimetable,
  validateAndFormatPeriod,
  generateComprehensiveMockData
};

export default timetableService;