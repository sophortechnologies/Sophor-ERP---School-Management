// src/modules/staff-attendance/components/StaffAttendanceReport/StaffAttendanceReport.jsx
import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter, Calendar, Users, BarChart3, TrendingUp, AlertCircle, Building, Clock, FileText } from 'lucide-react';
import { REPORT_TYPES, DEPARTMENTS } from '../../constants';
import { formatDateForDisplay } from '../../utils';
import './StaffAttendanceReport.css';

const StaffAttendanceReport = ({ 
  stats, 
  onGenerateReport, 
  onExport, 
  loading = false 
}) => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showFilters, setShowFilters] = useState(true);

  // Set default dates (current month)
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
      departmentId: departmentId || undefined,
    };
    onGenerateReport(params);
  };

  const handleExport = () => {
    onExport({
      format: exportFormat,
      startDate,
      endDate,
      departmentId: departmentId || undefined,
    });
  };

  const getReportTitle = () => {
    const titles = {
      daily: 'Daily Staff Attendance Report',
      weekly: 'Weekly Staff Attendance Report',
      monthly: 'Monthly Staff Attendance Report',
      custom: 'Custom Staff Attendance Report',
    };
    return titles[reportType] || 'Staff Attendance Report';
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!stats?.summary) {
      return {
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
      };
    }

    const summary = stats.summary;
    const total = summary.total || 0;
    
    return {
      presentPercentage: total > 0 ? Math.round((summary.present / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((summary.absent / total) * 100) : 0,
      latePercentage: total > 0 ? Math.round((summary.late / total) * 100) : 0,
    };
  };

  const summaryStats = calculateSummary();

  return (
    <div className="staff-attendance-staffattendancereport-staffattendancereport-staff-attendance-report">
      {/* Report Header */}
      <div className="staff-attendance-staffattendancereport-staffattendancereport-report-header">
        <div className="staff-attendance-staffattendancereport-staffattendancereport-header-left">
          <h2>
            <BarChart3 size={24} />
            {getReportTitle()}
          </h2>
          <p className="staff-attendance-staffattendancereport-staffattendancereport-report-subtitle">
            Generate detailed staff attendance reports and analytics
          </p>
        </div>
        <div className="staff-attendance-staffattendancereport-staffattendancereport-header-right">
          <button 
            className="btn staff-attendance-staffattendancereport-staffattendancereport-btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="btn staff-attendance-staffattendancereport-staffattendancereport-btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
          <button className="btn staff-attendance-staffattendancereport-staffattendancereport-btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="staff-attendance-staffattendancereport-staffattendancereport-filters-section">
          <div className="staff-attendance-staffattendancereport-staffattendancereport-filter-group">
            <label htmlFor="reportType">
              <Calendar size={16} />
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="staff-attendance-staffattendancereport-staffattendancereport-filter-select"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-attendance-staffattendancereport-staffattendancereport-filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="staff-attendance-staffattendancereport-staffattendancereport-filter-input"
            />
          </div>

          <div className="staff-attendance-staffattendancereport-staffattendancereport-filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="staff-attendance-staffattendancereport-staffattendancereport-filter-input"
            />
          </div>

          <div className="staff-attendance-staffattendancereport-staffattendancereport-filter-group">
            <label htmlFor="departmentId">
              <Building size={16} />
              Department (Optional)
            </label>
            <select
              id="departmentId"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="staff-attendance-staffattendancereport-staffattendancereport-filter-select"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-attendance-staffattendancereport-staffattendancereport-filter-actions">
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
      <div className="staff-attendance-staffattendancereport-staffattendancereport-stats-overview">
        <div className="stat-card">
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-icon" style={{ background: '#dcfce7' }}>
            <Users size={24} color="#10b981" />
          </div>
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-content">
            <h3>{stats?.summary?.total || 0}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-icon" style={{ background: '#dcfce7' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-content">
            <h3>{summaryStats.presentPercentage}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-icon" style={{ background: '#fee2e2' }}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-content">
            <h3>{stats?.summary?.absent || 0}</h3>
            <p>Total Absent</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-icon" style={{ background: '#fef3c7' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-content">
            <h3>{stats?.summary?.late || 0}</h3>
            <p>Late Arrivals</p>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {(!stats || stats.summary?.total === 0) && (
        <div className="staff-attendance-staffattendancereport-staffattendancereport-empty-state">
          <BarChart3 size={48} />
          <h3>No Report Data Available</h3>
          <p>
            Select a date range and click "Generate Report" to see attendance statistics.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              // Auto-fill with current month
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(lastDay.toISOString().split('T')[0]);
              setReportType('monthly');
            }}
          >
            Use Current Month
          </button>
        </div>
      )}

      {/* Detailed Statistics (when data exists) */}
      {stats && stats.summary?.total > 0 && (
        <>
          {/* Department-wise Statistics */}
          {stats.departmentStats && stats.departmentStats.length > 0 && (
            <div className="staff-attendance-staffattendancereport-staffattendancereport-department-section">
              <h3>
                <Building size={20} />
                Department-wise Attendance
              </h3>
              <div className="staff-attendance-staffattendancereport-staffattendancereport-department-table">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Late</th>
                      <th>Attendance Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.departmentStats.map(deptStat => {
                      const attendanceRate = deptStat.total > 0 ? 
                        Math.round((deptStat.present / deptStat.total) * 100) : 0;
                      
                      return (
                        <tr key={deptStat.departmentId}>
                          <td>{deptStat.departmentName}</td>
                          <td>{deptStat.total}</td>
                          <td>{deptStat.present}</td>
                          <td>{deptStat.absent}</td>
                          <td>{deptStat.late}</td>
                          <td>
                            <div className="staff-attendance-staffattendancereport-staffattendancereport-attendance-bar">
                              <div 
                                className="staff-attendance-staffattendancereport-staffattendancereport-bar-fill"
                                style={{ width: `${attendanceRate}%` }}
                              />
                              <span className="staff-attendance-staffattendancereport-staffattendancereport-bar-text">{attendanceRate}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`staff-attendance-staffattendancereport-staffattendancereport-status-badge ${
                              attendanceRate >= 90 ? 'excellent' :
                              attendanceRate >= 80 ? 'good' :
                              attendanceRate >= 70 ? 'average' :
                              'poor'
                            }`}>
                              {attendanceRate >= 90 ? 'Excellent' :
                               attendanceRate >= 80 ? 'Good' :
                               attendanceRate >= 70 ? 'Average' :
                               'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Trends */}
          {stats.dailyStats && stats.dailyStats.length > 0 && (
            <div className="staff-attendance-staffattendancereport-staffattendancereport-trends-section">
              <h3>
                <TrendingUp size={20} />
                Daily Attendance Trends
              </h3>
              <div className="staff-attendance-staffattendancereport-staffattendancereport-trends-chart">
                {stats.dailyStats.slice(-7).map(day => (
                  <div key={day.date} className="staff-attendance-staffattendancereport-staffattendancereport-trend-item">
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-trend-date">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-trend-bar">
                      <div 
                        className="staff-attendance-staffattendancereport-staffattendancereport-bar-fill"
                        style={{ height: `${day.percentage}%` }}
                      />
                    </div>
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-trend-percentage">
                      {day.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performers */}
          {stats.topPerformers && stats.topPerformers.length > 0 && (
            <div className="staff-attendance-staffattendancereport-staffattendancereport-performers-section">
              <h3>
                <FileText size={20} />
                Top Performers
              </h3>
              <div className="staff-attendance-staffattendancereport-staffattendancereport-performers-list">
                {stats.topPerformers.map((staff, index) => (
                  <div key={index} className="staff-attendance-staffattendancereport-staffattendancereport-performer-card">
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-performer-rank">{index + 1}</div>
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-performer-info">
                      <div className="staff-attendance-staffattendancereport-staffattendancereport-performer-name">{staff.name}</div>
                      <div className="staff-attendance-staffattendancereport-staffattendancereport-performer-details">
                        <span>{staff.department}</span>
                        <span>{staff.employeeId}</span>
                      </div>
                    </div>
                    <div className="staff-attendance-staffattendancereport-staffattendancereport-performer-stats">
                      <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-item">
                        <span className="stat-label">Present:</span>
                        <span className="stat-value">{staff.present}</span>
                      </div>
                      <div className="staff-attendance-staffattendancereport-staffattendancereport-stat-item">
                        <span className="stat-label">Rate:</span>
                        <span className="stat-value">{staff.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Attendance */}
          {stats.recentAttendance && stats.recentAttendance.length > 0 && (
            <div className="staff-attendance-staffattendancereport-staffattendancereport-recent-section">
              <h3>
                <Clock size={20} />
                Recent Attendance Records
              </h3>
              <div className="staff-attendance-staffattendancereport-staffattendancereport-recent-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Working Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAttendance.slice(0, 5).map(record => (
                      <tr key={record.id}>
                        <td>{formatDateForDisplay(record.date)}</td>
                        <td>{record.employeeName}</td>
                        <td>{record.department}</td>
                        <td>
                          <span 
                            className="staff-attendance-staffattendancereport-staffattendancereport-status-badge"
                            style={{ 
                              backgroundColor: record.status === 'PRESENT' ? '#dcfce7' : 
                                            record.status === 'ABSENT' ? '#fee2e2' :
                                            record.status === 'LATE' ? '#fef3c7' : '#f3f4f6',
                              color: record.status === 'PRESENT' ? '#166534' : 
                                     record.status === 'ABSENT' ? '#991b1b' :
                                     record.status === 'LATE' ? '#92400e' : '#374151',
                            }}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td>{record.checkInTime || '-'}</td>
                        <td>{record.checkOutTime || '-'}</td>
                        <td>{record.workingHours || '0'}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Actions */}
      <div className="staff-attendance-staffattendancereport-staffattendancereport-report-actions">
        <button className="btn staff-attendance-staffattendancereport-staffattendancereport-btn-secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print Report
        </button>
        <button className="btn staff-attendance-staffattendancereport-staffattendancereport-btn-secondary" onClick={handleExport}>
          <Download size={16} />
          Export Report
        </button>
        <button className="btn btn-primary" onClick={handleGenerateReport}>
          Refresh Report
        </button>
      </div>
    </div>
  );
};

export default StaffAttendanceReport;