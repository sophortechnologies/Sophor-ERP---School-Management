// src/modules/timetable/pages/GenerateTimetable.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerateTimetable.css';
import { useTimetable } from '../hooks';
import timetableService from '../services/timetable.service';

const GenerateTimetable = () => {
  const navigate = useNavigate();
  const { createTimetable: createTimetableHook } = useTimetable();
  
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  
  const [config, setConfig] = useState({
    academicSession: '2024-2025',
    academicYear: '2024-2025',
    term: 'Term 1',
    semester: '1',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    periodsPerDay: 8,
    periodDuration: 45,
    includeBreaks: true,
    breakDuration: 15,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkConflicts: true,
    balanceWorkload: true,
    respectTeacherAvailability: true,
    optimizeRoomUsage: true
  });
  
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    loadData();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      console.log("🔌 Checking backend API status...");
      const result = await timetableService.testBackendConnection();
      
      if (result.success) {
        setApiStatus('connected');
        console.log("✅ Backend API is connected");
      } else {
        setApiStatus('partial');
        console.log("⚠️ Backend API partially available:", result.summary);
      }
    } catch (error) {
      setApiStatus('failed');
      console.log("❌ Backend API check failed:", error.message);
    }
  };

  const loadData = async () => {
    try {
      setLoadingData(true);
      setErrors([]);
      
      console.log("📡 Loading data for timetable generation...");
      
      const data = await timetableService.fetchRealData();
      
      console.log("📊 Data loaded:", {
        classes: data.classes?.length || 0,
        teachers: data.teachers?.length || 0,
        subjects: data.subjects?.length || 0,
        usingRealData: data.usingRealData
      });
      
      setAvailableClasses(data.classes || []);
      setAvailableSubjects(data.subjects || []);
      setAvailableTeachers(data.teachers || []);
      setAvailableRooms(data.rooms || []);
      setUsingRealData(data.usingRealData || false);
      
      if (!data.usingRealData) {
        setErrors(prev => [...prev, 'Using demonstration data. Some backend endpoints may not be available.']);
      }
      
      if (data.classes.length === 0) {
        setErrors(prev => [...prev, 'No classes found. Please create classes first.']);
      }
      
    } catch (error) {
      console.error("❌ Error loading data:", error);
      setErrors(['Failed to load data. Using demonstration mode.']);
      setUsingRealData(false);
      
      // Load mock data
      const mockData = timetableService.generateComprehensiveMockData();
      setAvailableClasses(mockData.classes);
      setAvailableSubjects(mockData.subjects);
      setAvailableTeachers(mockData.teachers);
      setAvailableRooms(mockData.rooms);
      
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTime = (periodIndex, periodDuration) => {
    const startHour = 8;
    const totalMinutes = startHour * 60 + (periodIndex * periodDuration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // In your GenerateTimetable.jsx, update the handleGenerate function:

const handleGenerate = async () => {
  try {
    setGenerating(true);
    setGenerationStatus('Validating configuration...');
    setErrors([]);
    
    console.log("🚀 Starting timetable generation...");
    
    // Generate the timetable structure
    const generated = await timetableService.generateTimetable(config);
    
    if (!generated) {
      throw new Error('Timetable generation failed');
    }
    
    setGeneratedTimetable(generated);
    setGenerationStatus('Timetable generated successfully!');
    
    // IMPORTANT: Actually create periods in the database
    if (generated.periods && generated.periods.length > 0) {
      setGenerationStatus('Creating timetable periods in database...');
      
      try {
        const createdPeriods = [];
        
        // Create first 5 periods (for demonstration)
        const periodsToCreate = generated.periods.slice(0, 5);
        
        for (let i = 0; i < periodsToCreate.length; i++) {
          const period = periodsToCreate[i];
          setGenerationStatus(`Creating period ${i + 1}/${periodsToCreate.length}...`);
          
          try {
            const savedPeriod = await timetableService.createTimetable(period);
            createdPeriods.push(savedPeriod);
            console.log(`✅ Created period ${i + 1}:`, savedPeriod);
          } catch (periodError) {
            console.error(`❌ Failed to create period ${i + 1}:`, periodError.message);
            // Continue with other periods
          }
        }
        
        if (createdPeriods.length > 0) {
          // Get the actual timetable ID from the first created period
          const timetableId = createdPeriods[0].id || createdPeriods[0]._id;
          
          alert(`✅ Timetable created successfully!\nCreated ${createdPeriods.length} periods.\nTimetable ID: ${timetableId}`);
          
          // Navigate to view page
          setTimeout(() => {
            navigate(`/admin/timetable/view/${timetableId}`);
          }, 2000);
        } else {
          throw new Error('Failed to create any timetable periods');
        }
        
      } catch (saveError) {
        console.error("❌ Error saving to database:", saveError);
        alert('✅ Timetable generated!\n⚠️ Could not save to database. Working in demonstration mode.');
        
        // Still show the generated timetable
        setGenerationStatus('Generated in demonstration mode');
      }
    }
    
  } catch (error) {
    console.error("❌ Error in timetable generation:", error);
    setErrors([error.message || 'Failed to generate timetable']);
    setGenerationStatus(`Error: ${error.message}`);
    alert(`❌ Failed to generate timetable: ${error.message}`);
  } finally {
    setGenerating(false);
  }
};

  const generateClassTimetable = (classInfo) => {
    const subjects = availableSubjects.length > 0 
      ? availableSubjects.map(s => s.name) 
      : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
    
    const days = config.workingDays;
    const timetable = {};
    
    days.forEach(day => {
      timetable[day] = [];
      for (let i = 0; i < config.periodsPerDay; i++) {
        const subjectIndex = (i + day.length) % subjects.length;
        const teacher = availableTeachers[subjectIndex % availableTeachers.length];
        const room = availableRooms[i % availableRooms.length];
        
        // Skip break periods
        if (config.includeBreaks && (i === 3 || i === 6)) {
          timetable[day].push({
            period: i + 1,
            startTime: calculateTime(i, config.periodDuration),
            endTime: calculateTime(i + 1, config.periodDuration),
            subject: 'Break',
            teacher: '',
            teacherId: null,
            room: '',
            roomId: null,
            type: 'break',
            isBreak: true
          });
        } else {
          timetable[day].push({
            period: i + 1,
            startTime: calculateTime(i, config.periodDuration),
            endTime: calculateTime(i + 1, config.periodDuration),
            subject: subjects[subjectIndex],
            teacher: teacher?.name || `Teacher ${subjectIndex + 1}`,
            teacherId: teacher?.id || subjectIndex + 1,
            room: room?.name || `Room ${101 + i}`,
            roomId: room?.id || i + 1,
            type: room?.type === 'lab' ? 'lab' : 'lecture'
          });
        }
      }
    });
    
    return timetable;
  };

  const handlePreview = () => {
    if (selectedClasses.length === 0) {
      setErrors(['Please select at least one class first']);
      return;
    }
    
    const previewData = {
      info: {
        name: `${config.academicYear} - ${config.term} Timetable (Preview)`,
        academicYear: config.academicYear,
        term: config.term,
        className: selectedClasses[0].name,
        section: selectedClasses[0].section,
        workingDays: config.workingDays,
        periodsPerDay: config.periodsPerDay,
        periodDuration: config.periodDuration,
        startDate: config.startDate,
        endDate: config.endDate,
        status: 'preview'
      },
      classes: selectedClasses.slice(0, 1).map(cls => ({
        classId: cls.id,
        className: cls.name,
        section: cls.section,
        timetable: generateClassTimetable(cls)
      }))
    };
    
    setGeneratedTimetable(previewData);
    setStep(4);
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="configuration-step">
            <h2>Step 1: Configure Academic Settings</h2>
            
            {!usingRealData && (
              <div className="demo-notice">
                <span className="demo-badge">DEMO MODE</span>
                <p>Using demonstration data. Backend API may not be fully available.</p>
              </div>
            )}
            
            <div className="timetable-generatetimetable-config-grid">
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="academicYear">Academic Year <span className="required">*</span></label>
                <select
                  id="academicYear"
                  className="timetable-generatetimetable-form-select"
                  value={config.academicYear}
                  onChange={(e) => handleConfigChange('academicYear', e.target.value)}
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                </select>
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="term">Term <span className="required">*</span></label>
                <select
                  id="term"
                  className="timetable-generatetimetable-form-select"
                  value={config.term}
                  onChange={(e) => handleConfigChange('term', e.target.value)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label>Working Days <span className="required">*</span></label>
                <div className="timetable-generatetimetable-day-checkboxes">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} className="day-checkbox">
                      <input 
                        type="checkbox"
                        checked={config.workingDays.includes(day.toLowerCase())}
                        onChange={(e) => {
                          const days = e.target.checked 
                            ? [...config.workingDays, day.toLowerCase()]
                            : config.workingDays.filter(d => d !== day.toLowerCase());
                          handleConfigChange('workingDays', days);
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="periodsPerDay">Periods per Day <span className="required">*</span></label>
                <input 
                  type="number"
                  id="periodsPerDay"
                  className="timetable-generatetimetable-form-input"
                  min="4"
                  max="10"
                  value={config.periodsPerDay}
                  onChange={(e) => handleConfigChange('periodsPerDay', parseInt(e.target.value) || 8)}
                />
                <small className="help-text">Typically 6-8 periods</small>
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="periodDuration">Period Duration (minutes) <span className="required">*</span></label>
                <input 
                  type="number"
                  id="periodDuration"
                  className="timetable-generatetimetable-form-input"
                  min="30"
                  max="60"
                  value={config.periodDuration}
                  onChange={(e) => handleConfigChange('periodDuration', parseInt(e.target.value) || 45)}
                />
                <small className="help-text">Typically 45 minutes</small>
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="startDate">Start Date <span className="required">*</span></label>
                <input
                  type="date"
                  id="startDate"
                  className="timetable-generatetimetable-form-input"
                  value={config.startDate}
                  onChange={(e) => handleConfigChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <label htmlFor="endDate">End Date <span className="required">*</span></label>
                <input
                  type="date"
                  id="endDate"
                  className="timetable-generatetimetable-form-input"
                  value={config.endDate}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                />
              </div>
              
              <div className="timetable-generatetimetable-form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="includeBreaks"
                    checked={config.includeBreaks}
                    onChange={(e) => handleConfigChange('includeBreaks', e.target.checked)}
                  />
                  <label htmlFor="includeBreaks">Include Breaks between periods</label>
                </div>
                {config.includeBreaks && (
                  <div className="break-settings">
                    <input
                      type="number"
                      id="breakDuration"
                      className="timetable-generatetimetable-form-input"
                      value={config.breakDuration}
                      onChange={(e) => handleConfigChange('breakDuration', parseInt(e.target.value) || 15)}
                      min="5"
                      max="30"
                      placeholder="Break duration in minutes"
                    />
                    <small className="help-text">Break duration in minutes</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="classes-step">
            <h2>Step 2: Select Classes & Sections</h2>
            <p>Choose classes and sections for timetable generation</p>
            
            {!usingRealData && (
              <div className="demo-notice">
                <span className="demo-badge">DEMO MODE</span>
                <p>Using demonstration data</p>
              </div>
            )}
            
            {availableClasses.length === 0 && !loadingData ? (
              <div className="no-data-message">
                <p>No classes available in the system.</p>
                <p>Please create classes first or refresh the data.</p>
                <button 
                  className="btn-primary"
                  onClick={loadData}
                  disabled={loadingData}
                >
                  {loadingData ? 'Refreshing...' : '🔄 Refresh Data'}
                </button>
              </div>
            ) : (
              <>
                <div className="timetable-generatetimetable-classes-grid">
                  {availableClasses.map(cls => (
                    <div key={cls.id} className="timetable-generatetimetable-class-card">
                      <div className="class-header">
                        <h3>{cls.name}</h3>
                        {cls.grade && <span className="grade-badge">Grade {cls.grade}</span>}
                      </div>
                      <div className="timetable-generatetimetable-sections">
                        <h4>Select Sections:</h4>
                        <div className="section-buttons">
                          {cls.sections && cls.sections.length > 0 ? (
                            cls.sections.map(section => {
                              const isSelected = selectedClasses.some(s => 
                                s.id === cls.id && s.sectionId === section.id
                              );
                              return (
                                <button
                                  key={section.id}
                                  className={`timetable-generatetimetable-section-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedClasses(selectedClasses.filter(s => 
                                        !(s.id === cls.id && s.sectionId === section.id)
                                      ));
                                    } else {
                                      setSelectedClasses([...selectedClasses, { 
                                        id: cls.id, 
                                        name: cls.name,
                                        sectionId: section.id,
                                        section: section.name || section.sectionName || `Section ${section.id}`,
                                        className: cls.name,
                                        classId: cls.id
                                      }]);
                                    }
                                  }}
                                >
                                  {section.name || section.sectionName || `Section ${section.id}`}
                                </button>
                              );
                            })
                          ) : (
                            <p className="no-sections">No sections available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="selection-summary">
                  <h4>Selected Classes & Sections</h4>
                  {selectedClasses.length > 0 ? (
                    <div className="selected-list">
                      <ul>
                        {selectedClasses.map(cls => (
                          <li key={`${cls.id}-${cls.sectionId}`}>
                            <span className="class-name">{cls.name}</span>
                            <span className="section-name">- {cls.section}</span>
                            <button 
                              className="remove-btn"
                              onClick={() => {
                                setSelectedClasses(selectedClasses.filter(s => 
                                  !(s.id === cls.id && s.sectionId === cls.sectionId)
                                ));
                              }}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className="selection-count">{selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''} selected</p>
                    </div>
                  ) : (
                    <p className="no-selection">No classes selected yet. Select classes to proceed.</p>
                  )}
                </div>
              </>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="rules-step">
            <h2>Step 3: Set Generation Rules</h2>
            <p>Configure how the timetable should be generated</p>
            
            <div className="timetable-generatetimetable-rules-grid">
              <div className="timetable-generatetimetable-rule-card">
                <div className="rule-header">
                  <span className="rule-icon">⚖️</span>
                  <h4>Balance Teacher Workload</h4>
                </div>
                <p>Distribute periods evenly among teachers</p>
                <label className="timetable-generatetimetable-switch">
                  <input 
                    type="checkbox"
                    checked={config.balanceWorkload}
                    onChange={(e) => handleConfigChange('balanceWorkload', e.target.checked)}
                  />
                  <span className="timetable-generatetimetable-slider"></span>
                </label>
              </div>
              
              <div className="timetable-generatetimetable-rule-card">
                <div className="rule-header">
                  <span className="rule-icon">✅</span>
                  <h4>Check for Conflicts</h4>
                </div>
                <p>Ensure no teacher/room double-booking</p>
                <label className="timetable-generatetimetable-switch">
                  <input 
                    type="checkbox"
                    checked={config.checkConflicts}
                    onChange={(e) => handleConfigChange('checkConflicts', e.target.checked)}
                  />
                  <span className="timetable-generatetimetable-slider"></span>
                </label>
              </div>
              
              <div className="timetable-generatetimetable-rule-card">
                <div className="rule-header">
                  <span className="rule-icon">👨‍🏫</span>
                  <h4>Respect Teacher Availability</h4>
                </div>
                <p>Consider teacher schedule constraints</p>
                <label className="timetable-generatetimetable-switch">
                  <input 
                    type="checkbox"
                    checked={config.respectTeacherAvailability}
                    onChange={(e) => handleConfigChange('respectTeacherAvailability', e.target.checked)}
                  />
                  <span className="timetable-generatetimetable-slider"></span>
                </label>
              </div>
              
              <div className="timetable-generatetimetable-rule-card">
                <div className="rule-header">
                  <span className="rule-icon">🏫</span>
                  <h4>Optimize Room Usage</h4>
                </div>
                <p>Efficiently allocate classrooms and labs</p>
                <label className="timetable-generatetimetable-switch">
                  <input 
                    type="checkbox"
                    checked={config.optimizeRoomUsage}
                    onChange={(e) => handleConfigChange('optimizeRoomUsage', e.target.checked)}
                  />
                  <span className="timetable-generatetimetable-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="generation-preview">
              <h4>Generation Preview</h4>
              <div className="preview-details">
                <div className="preview-item">
                  <span className="preview-label">Classes:</span>
                  <span className="preview-value">{selectedClasses.length}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Working Days:</span>
                  <span className="preview-value">{config.workingDays.length}/week</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Periods/Day:</span>
                  <span className="preview-value">{config.periodsPerDay}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Period Duration:</span>
                  <span className="preview-value">{config.periodDuration} min</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Conflict Checking:</span>
                  <span className="preview-value">{config.checkConflicts ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="preview-step">
            <h2>Step 4: Preview & Generate</h2>
            <p>Review the timetable before final generation</p>
            
            {generationStatus && (
              <div className={`generation-status ${generating ? 'generating' : ''}`}>
                <div className="status-content">
                  <span className="status-icon">{generating ? '⏳' : '✅'}</span>
                  <span className="status-text">{generationStatus}</span>
                </div>
              </div>
            )}
            
            {errors.length > 0 && (
              <div className="validation-errors">
                <h4>⚠ Please fix the following errors:</h4>
                <ul className="error-list">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {generating ? (
              <div className="generation-progress">
                <div className="progress-header">
                  <h4>Generating Timetable...</h4>
                  <span className="progress-percentage">70%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '70%' }}></div>
                </div>
                <div className="progress-details">
                  <p>{generationStatus}</p>
                  <p className="progress-hint">This may take a few moments...</p>
                </div>
              </div>
            ) : generatedTimetable ? (
              <div className="timetable-preview">
                <div className="preview-header">
                  <h3>{generatedTimetable.info?.name || 'Timetable Preview'}</h3>
                  <div className="preview-meta">
                    <span className="meta-item">{generatedTimetable.info?.academicYear || config.academicYear}</span>
                    <span className="meta-separator">•</span>
                    <span className="meta-item">{generatedTimetable.info?.term || config.term}</span>
                    <span className="meta-separator">•</span>
                    <span className="meta-item status-badge">{generatedTimetable.info?.status || 'Preview'}</span>
                  </div>
                </div>
                
                <div className="timetable-display">
                  <div className="timetable-header">
                    <div className="header-time">Time</div>
                    {config.workingDays.map(day => (
                      <div key={day} className="header-day">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="timetable-body">
                    {Array.from({ length: config.periodsPerDay }).map((_, periodIndex) => (
                      <div key={periodIndex} className="timetable-row">
                        <div className="row-time">
                          {calculateTime(periodIndex, config.periodDuration)} - {calculateTime(periodIndex + 1, config.periodDuration)}
                          {config.includeBreaks && (periodIndex === 3 || periodIndex === 6) && (
                            <span className="break-indicator">Break</span>
                          )}
                        </div>
                        
                        {config.workingDays.map(day => {
                          const period = generatedTimetable.classes?.[0]?.timetable?.[day]?.[periodIndex];
                          return (
                            <div key={`${day}-${periodIndex}`} className="row-period">
                              {period ? (
                                <div className={`period-details ${period.isBreak ? 'break-period' : period.type === 'lab' ? 'lab-period' : 'lecture-period'}`}>
                                  {period.isBreak ? (
                                    <div className="break-details">
                                      <div className="period-subject">Break</div>
                                      <div className="period-duration">{config.breakDuration || 15} min</div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="period-subject">{period.subject}</div>
                                      <div className="period-teacher">{period.teacher}</div>
                                      <div className="period-room">{period.room}</div>
                                      {period.type === 'lab' && <div className="period-type">Lab</div>}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="period-empty">
                                  Free
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="periods-summary">
                  <h4>Periods to be created:</h4>
                  <div className="periods-list">
                    {generatedTimetable.periods && generatedTimetable.periods.slice(0, 5).map((period, index) => (
                      <div key={index} className="period-summary-item">
                        <span className="period-day">{period.dayOfWeek}</span>
                        <span className="period-time">{period.startTime?.split('T')[1]?.substring(0, 5) || '08:30'}-{period.endTime?.split('T')[1]?.substring(0, 5) || '09:30'}</span>
                        <span className="period-subject">{period.subjectName || period.subject}</span>
                        <span className="period-teacher">{period.teacherName || period.teacher}</span>
                      </div>
                    ))}
                    {generatedTimetable.periods && generatedTimetable.periods.length > 5 && (
                      <div className="more-periods">
                        + {generatedTimetable.periods.length - 5} more periods...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="preview-actions">
                  <button 
                    className="timetable-generatetimetable-btn-secondary"
                    onClick={() => setStep(3)}
                    disabled={generating}
                  >
                    ← Back to Rules
                  </button>
                  <button 
                    className="timetable-generatetimetable-btn-success"
                    onClick={handleGenerate}
                    disabled={generating || selectedClasses.length === 0}
                  >
                    {generating ? (
                      <>
                        <span className="spinner-small"></span>
                        Generating...
                      </>
                    ) : (
                      '🚀 Generate Final Timetable'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-preview">
                <div className="no-preview-content">
                  <div className="preview-icon">👁️</div>
                  <h4>No Preview Available</h4>
                  <p>Click "Preview Timetable" to see a sample timetable based on your configuration.</p>
                  <button 
                    className="btn-primary"
                    onClick={handlePreview}
                    disabled={selectedClasses.length === 0}
                  >
                    Preview Timetable
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading timetable data...</p>
        <p className="loading-subtext">Checking backend connection...</p>
      </div>
    );
  }

  return (
    <div className="timetable-generatetimetable-generate-timetable-page">
      <div className="page-header">
        <h1>Timetable Generation</h1>
        <p className="page-subtitle">
          Automatically generate academic schedules as per SRS requirements.
          Ensures no conflicts and balances teacher workload.
        </p>
        
        <div className="timetable-generatetimetable-api-status-indicator">
          <span className={`timetable-generatetimetable-status-dot ${apiStatus}`}></span>
          <span className="status-text">
            {apiStatus === 'connected' ? 'Backend API Connected' : 
             apiStatus === 'partial' ? 'Backend API Partially Available' : 
             'Backend API Not Available (Demo Mode)'}
          </span>
          <button className="btn-refresh" onClick={checkApiStatus} title="Refresh API status">
            🔄
          </button>
        </div>
      </div>

      <div className="timetable-generatetimetable-generation-wizard">
        <div className="timetable-generatetimetable-wizard-steps">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className={`timetable-generatetimetable-step ${step >= stepNum ? 'active' : ''}`}>
              <div className="timetable-generatetimetable-step-number">{stepNum}</div>
              <div className="timetable-generatetimetable-step-info">
                <h4>
                  {stepNum === 1 && 'Configure'}
                  {stepNum === 2 && 'Select Classes'}
                  {stepNum === 3 && 'Set Rules'}
                  {stepNum === 4 && 'Preview & Generate'}
                </h4>
                <p>
                  {stepNum === 1 && 'Academic settings'}
                  {stepNum === 2 && 'Choose classes & sections'}
                  {stepNum === 3 && 'Generation preferences'}
                  {stepNum === 4 && 'Review and create'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="timetable-generatetimetable-wizard-content">
          {renderStepContent()}
          
          <div className="timetable-generatetimetable-wizard-actions">
            {step > 1 && step < 4 && !generating && (
              <button 
                className="timetable-generatetimetable-btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                ← Previous Step
              </button>
            )}
            
            {step < 3 && (
              <button 
                className="btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={(step === 2 && selectedClasses.length === 0)}
              >
                Next Step →
              </button>
            )}
            
            {step === 3 && !generating && (
              <button 
                className="timetable-generatetimetable-btn-success"
                onClick={() => setStep(4)}
                disabled={selectedClasses.length === 0}
              >
                Preview Timetable
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="timetable-generatetimetable-srs-requirements">
        <h3>SRS Compliance Status</h3>
        <div className="timetable-generatetimetable-requirements-grid">
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.1: Define working days & periods</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.2: Class-wise timetables</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.3: Conflict checking</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.4: Auto-generation</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.5: Manual adjustments</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">📄</span>
            <span className="req-text">FR7.6: Export to PDF/Excel</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.7: Personalized views</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">✅</span>
            <span className="req-text">FR7.8: Historical storage</span>
          </div>
          <div className="timetable-generatetimetable-req-item">
            <span className="timetable-generatetimetable-req-icon">📢</span>
            <span className="req-text">FR7.9: Schedule notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateTimetable;