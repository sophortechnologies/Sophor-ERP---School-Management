import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter, Calendar, Users, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { REPORT_TYPES, ATTENDANCE_STATUS, EXPORT_FORMATS } from '../constants';
import './AttendanceReport.css';

const AttendanceReport = ({ 
  stats, 
  onGenerateReport, 
  onExport, 
  loading = false 
}) => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classId, setClassId] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showFilters, setShowFilters] = useState(true);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = () => {
    const params = {
      reportType,
      startDate,
      endDate,
      classId: classId || undefined,
    };
    onGenerateReport(params);
  };

  const handleExport = () => {
    onExport({
      format: exportFormat,
      startDate,
      endDate,
      classId: classId || undefined,
    });
  };

  const getReportTitle = () => {
    const titles = {
      daily: 'Daily Attendance Report',
      weekly: 'Weekly Attendance Report',
      monthly: 'Monthly Attendance Report',
      term: 'Term Attendance Report',
      annual: 'Annual Attendance Report',
      custom: 'Custom Attendance Report',
    };
    return titles[reportType] || 'Attendance Report';
  };

  return (
    <div className="attendance-attendancereport-attendance-report">
      {/* Report Header */}
      <div className="attendance-attendancereport-report-header">
        <div className="attendance-attendancereport-header-left">
          <h2>
            <BarChart3 size={24} />
            {getReportTitle()}
          </h2>
          <p className="attendance-attendancereport-report-subtitle">
            Generate detailed attendance reports and analytics
          </p>
        </div>
        <div className="attendance-attendancereport-header-right">
          <button 
            className="btn attendance-attendancereport-btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="btn attendance-attendancereport-btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
          <button className="btn attendance-attendancereport-btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="attendance-attendancereport-filters-section">
          <div className="attendance-attendancereport-filter-group">
            <label htmlFor="reportType">
              <Calendar size={16} />
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="attendance-attendancereport-filter-select"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="attendance-attendancereport-filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="attendance-attendancereport-filter-input"
            />
          </div>

          <div className="attendance-attendancereport-filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="attendance-attendancereport-filter-input"
            />
          </div>

          <div className="attendance-attendancereport-filter-group">
            <label htmlFor="classId">
              <Users size={16} />
              Class (Optional)
            </label>
            <input
              type="text"
              id="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Enter class ID"
              className="attendance-attendancereport-filter-input"
            />
          </div>

          <div className="attendance-attendancereport-filter-group">
            <label htmlFor="exportFormat">
              <Download size={16} />
              Export Format
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="attendance-attendancereport-filter-select"
            >
              {EXPORT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>
                  {format.icon} {format.label}
                </option>
              ))}
            </select>
          </div>

          <div className="attendance-attendancereport-filter-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="attendance-attendancereport-stats-overview">
        <div className="stat-card">
          <div className="attendance-attendancereport-stat-icon" style={{ background: '#dcfce7' }}>
            <Users size={24} color="#10b981" />
          </div>
          <div className="attendance-attendancereport-stat-content">
            <h3>{stats?.summary?.total || 0}</h3>
            <p>Total Records</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="attendance-attendancereport-stat-icon" style={{ background: '#dbeafe' }}>
            <TrendingUp size={24} color="#3b82f6" />
          </div>
          <div className="attendance-attendancereport-stat-content">
            <h3>{stats?.summary?.presentPercentage || '0.0'}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="attendance-attendancereport-stat-icon" style={{ background: '#fef3c7' }}>
            <AlertCircle size={24} color="#d97706" />
          </div>
          <div className="attendance-attendancereport-stat-content">
            <h3>{stats?.summary?.absent || 0}</h3>
            <p>Total Absent</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="attendance-attendancereport-stat-icon" style={{ background: '#fee2e2' }}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
          <div className="attendance-attendancereport-stat-content">
            <h3>{stats?.summary?.late || 0}</h3>
            <p>Late Arrivals</p>
          </div>
        </div>
      </div>
<div className="debug-info" style={{ 
  padding: '10px', 
  background: '#f3f4f6', 
  borderRadius: '6px', 
  margin: '10px 0',
  fontSize: '12px'
}}>
  <strong>Debug Info:</strong>
  <div>Total Records: {stats?.summary?.total || 0}</div>
  <div>Present: {stats?.summary?.present || 0}</div>
  <div>Absent: {stats?.summary?.absent || 0}</div>
  <div>Late: {stats?.summary?.late || 0}</div>
  <div>Data available: {stats ? 'Yes' : 'No'}</div>
</div>


{(!stats || stats.summary?.total === 0) && (
  <div className="attendance-attendancereport-empty-state" style={{ 
    textAlign: 'center', 
    padding: '40px', 
    color: '#6b7280' 
  }}>
    <BarChart3 size={48} style={{ marginBottom: '16px' }} />
    <h3>No Report Data Available</h3>
    <p style={{ marginBottom: '20px' }}>
      Select a date range and click "Generate Report" to see attendance statistics.
    </p>
    <button 
      className="btn btn-primary"
      onClick={() => {
        // Auto-fill with current date range
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
      }}
    >
      Use This Month
    </button>
  </div>
)}
      {/* Status Distribution */}
      <div className="attendance-attendancereport-distribution-section">
        <h3>Attendance Distribution</h3>
        <div className="attendance-attendancereport-distribution-chart">
          {ATTENDANCE_STATUS.map(status => {
            const count = stats?.summary?.[status.value] || 0;
            const percentage = stats?.summary?.total 
              ? (count / stats.summary.total * 100).toFixed(1) 
              : 0;
            
            return (
              <div key={status.value} className="attendance-attendancereport-distribution-item">
                <div className="attendance-attendancereport-distribution-header">
                  <span 
                    className="attendance-attendancereport-status-indicator"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="attendance-attendancereport-status-label">{status.label}</span>
                  <span className="attendance-attendancereport-status-count">{count}</span>
                </div>
                <div className="attendance-attendancereport-distribution-bar">
                  <div 
                    className="attendance-attendancereport-bar-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: status.color 
                    }}
                  />
                </div>
                <div className="attendance-attendancereport-distribution-percentage">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Trends */}
      {stats?.dailyStats && stats.dailyStats.length > 0 && (
        <div className="attendance-attendancereport-trends-section">
          <h3>Daily Attendance Trends</h3>
          <div className="attendance-attendancereport-trends-chart">
            {stats.dailyStats.slice(-7).map(day => (
              <div key={day.date} className="attendance-attendancereport-trend-item">
                <div className="attendance-attendancereport-trend-date">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="attendance-attendancereport-trend-bar">
                  <div 
                    className="attendance-attendancereport-bar-fill"
                    style={{ height: `${day.percentage}%` }}
                  />
                </div>
                <div className="attendance-attendancereport-trend-percentage">
                  {day.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class-wise Performance */}
      {stats?.classWiseStats && stats.classWiseStats.length > 0 && (
        <div className="attendance-attendancereport-class-performance">
          <h3>Class-wise Attendance</h3>
          <div className="attendance-attendancereport-performance-table">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.classWiseStats.map(classStat => (
                  <tr key={classStat.className}>
                    <td>{classStat.className}</td>
                    <td>{classStat.present}</td>
                    <td>{classStat.absent}</td>
                    <td>{classStat.total}</td>
                    <td>{classStat.percentage}%</td>
                    <td>
                      <span className={`attendance-attendancereport-status-badge ${
                        parseFloat(classStat.percentage) >= 90 ? 'good' :
                        parseFloat(classStat.percentage) >= 75 ? 'average' :
                        'poor'
                      }`}>
                        {parseFloat(classStat.percentage) >= 90 ? 'Excellent' :
                         parseFloat(classStat.percentage) >= 75 ? 'Good' :
                         'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Performers & Frequent Absentees */}
      <div className="attendance-attendancereport-performance-cards">
        <div className="card">
          <h3>Top Attendees</h3>
          <div className="attendance-attendancereport-performers-list">
            {stats?.topAttendees && stats.topAttendees.length > 0 ? (
              stats.topAttendees.map((student, index) => (
                <div key={index} className="attendance-attendancereport-performer-item">
                  <div className="attendance-attendancereport-performer-rank">{index + 1}</div>
                  <div className="attendance-attendancereport-performer-info">
                    <div className="attendance-attendancereport-performer-name">{student.name}</div>
                    <div className="attendance-attendancereport-performer-stats">
                      {student.present}/{student.total} present
                    </div>
                  </div>
                  <div className="attendance-attendancereport-performer-percentage">
                    {student.percentage}%
                  </div>
                </div>
              ))
            ) : (
              <p className="attendance-attendancereport-empty-state">No data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Frequent Absentees</h3>
          <div className="attendance-attendancereport-absentees-list">
            {stats?.frequentAbsentees && stats.frequentAbsentees.length > 0 ? (
              stats.frequentAbsentees.map((student, index) => (
                <div key={index} className="attendance-attendancereport-absentee-item">
                  <div className="attendance-attendancereport-absentee-rank warning">{index + 1}</div>
                  <div className="attendance-attendancereport-absentee-info">
                    <div className="attendance-attendancereport-absentee-name">{student.name}</div>
                    <div className="attendance-attendancereport-absentee-stats">
                      {student.absent}/{student.total} absent
                    </div>
                  </div>
                  <div className="attendance-attendancereport-absentee-percentage">
                    {student.percentage}%
                  </div>
                </div>
              ))
            ) : (
              <p className="attendance-attendancereport-empty-state">No frequent absentees</p>
            )}
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="attendance-attendancereport-report-actions">
        <button className="btn attendance-attendancereport-btn-secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print Report
        </button>
        <button className="btn attendance-attendancereport-btn-secondary" onClick={handleExport}>
          <Download size={16} />
          Export as {exportFormat.toUpperCase()}
        </button>
        <button className="btn btn-primary" onClick={handleGenerateReport}>
          Refresh Report
        </button>
      </div>
    </div>
  );
};

export default AttendanceReport;