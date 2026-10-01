// src/modules/academic-sessions/components/AcademicSessionList.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Plus,
  Check,
  Download,
  Printer,
  Search,
} from "lucide-react";
import { useAcademicSessions } from "../hooks/useAcademicSessions";
import AcademicSessionForm from "./AcademicSessionForm";
import AcademicSessionStats from "./AcademicSessionStats";
import "./AcademicSessions.css";

const AcademicSessionList = () => {
  const {
    sessions,
    activeSession,
    loading,
    loadAllSessions,
    activateSession,
    deleteSession,
  } = useAcademicSessions();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewingStatsId, setViewingStatsId] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadAllSessions();
  }, [loadAllSessions]);

  const handleActivate = async (id) => {
    if (
      window.confirm(
        "Activate this academic session? It will become the active session.",
      )
    ) {
      const response = await activateSession(id);
      if (response?.success) {
        alert("Session activated successfully");
      } else {
        alert(`Error: ${response?.message || "Failed"}`);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Delete academic session "${name}"? This action cannot be undone.`,
      )
    ) {
      const response = await deleteSession(id);
      if (response?.success) {
        alert("Session deleted successfully");
      } else {
        alert(`Error: ${response?.message || "Failed"}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const currentActiveSession =
    activeSession || safeSessions.find((s) => s.isActive);

  const filteredSessions = safeSessions.filter((session) => {
    const term = searchTerm.toLowerCase();
    return session.name?.toLowerCase().includes(term);
  });

  const stats = {
    total: safeSessions.length,
    active: safeSessions.filter((s) => s.isActive).length,
    inactive: safeSessions.filter((s) => !s.isActive).length,
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-sessions-area");
    if (!printArea) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Academic Sessions Roster</title>
          <style>
            body { font-family: sans-serif; margin: 24px; color: #1e293b; }
            .print-title { font-size: 22px; font-weight: 800; color: #172b4c; margin-bottom: 4px; }
            .print-meta { font-size: 13px; color: #64748b; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1b633b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="print-title">SophorERP — Academic Sessions Directory</div>
          <div class="print-meta">Generated on ${new Date().toLocaleDateString()} | Total Sessions: ${filteredSessions.length}</div>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExport = () => {
    const csvContent = [
      ["Session Name", "Start Date", "End Date", "Duration", "Status"],
      ...filteredSessions.map((s) => {
        const duration = Math.ceil(
          (new Date(s.endDate) - new Date(s.startDate)) / (1000 * 3600 * 24),
        );
        return [
          s.name,
          formatDate(s.startDate),
          formatDate(s.endDate),
          `${duration} days`,
          s.isActive ? "Active" : "Inactive",
        ];
      }),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic_sessions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading && safeSessions.length === 0) {
    return (
      <div className="classes-management-page sessions-loading-wrapper">
        <p>Loading academic sessions...</p>
      </div>
    );
  }

  return (
    <div className="classes-management-page">
      {/* Header Banner */}
      <div className="classes-header-banner no-print">
        <div className="classes-header-content">
          <div>
            <h1>Academic Sessions</h1>
            <p>
              Manage school terms, academic years, and enrollment session
              windows
            </p>
          </div>
          <div className="classes-header-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingSession(null);
                setShowForm(true);
              }}
            >
              <Plus size={16} /> New Academic Session
            </button>
          </div>
        </div>
      </div>

      <div className="classes-page-body">
        {/* Active Session Notice Banner */}
        <div
          className={`sessions-notice-banner ${
            currentActiveSession ? "active-notice" : "inactive-notice"
          }`}
        >
          {currentActiveSession ? (
            <div className="sessions-notice-content">
              <CheckCircle size={20} />
              <span>
                Active Session: <strong>{currentActiveSession.name}</strong> (
                {formatDate(currentActiveSession.startDate)} -{" "}
                {formatDate(currentActiveSession.endDate)})
              </span>
            </div>
          ) : (
            <div className="sessions-notice-content">
              <Calendar size={20} />
              <span>
                No active academic session. Please activate a session.
              </span>
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="classes-stats-grid no-print">
          <div className="classes-stat-card">
            <div className="classes-stat-icon blue">
              <Calendar size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Total Sessions</p>
              <p className="classes-stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Active Sessions</p>
              <p className="classes-stat-value">{stats.active}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon amber">
              <XCircle size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Inactive Sessions</p>
              <p className="classes-stat-value">{stats.inactive}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="classes-action-bar no-print">
          <div className="classes-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search sessions by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="classes-filter-group">
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Printable Header */}
        <div className="classes-print-header">
          <h2>SophorERP — Academic Sessions Directory</h2>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content Table Card */}
        <div className="classes-content-card" id="printable-sessions-area">
          <div className="classes-table-responsive">
            <table className="classes-table">
              <thead>
                <tr>
                  <th>Session Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="classes-empty-row">
                      No academic sessions found. Click "New Academic Session"
                      to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => {
                    const duration = Math.ceil(
                      (new Date(session.endDate) -
                        new Date(session.startDate)) /
                        (1000 * 3600 * 24),
                    );
                    return (
                      <tr
                        key={session.id}
                        className={session.isActive ? "classes-active-row" : ""}
                      >
                        <td className="classes-name-cell">{session.name}</td>
                        <td className="classes-session-cell">
                          {formatDate(session.startDate)}
                        </td>
                        <td className="classes-session-cell">
                          {formatDate(session.endDate)}
                        </td>
                        <td className="classes-students-cell">
                          {duration} days
                        </td>
                        <td>
                          <span
                            className={`classes-pill-badge ${
                              session.isActive
                                ? "session-status-active"
                                : "session-status-inactive"
                            }`}
                          >
                            {session.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="no-print">
                          <div className="classes-action-buttons">
                            <button
                              type="button"
                              className="classes-action-btn"
                              onClick={() => {
                                setViewingStatsId(session.id);
                                setShowStats(true);
                              }}
                              title="View Stats"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="classes-action-btn"
                              onClick={() => {
                                setEditingSession(session);
                                setShowForm(true);
                              }}
                              title="Edit Session"
                            >
                              <Edit size={16} />
                            </button>
                            {!session.isActive && (
                              <button
                                type="button"
                                className="classes-action-btn"
                                onClick={() => handleActivate(session.id)}
                                title="Activate Session"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="classes-action-btn delete-btn"
                              onClick={() =>
                                handleDelete(session.id, session.name)
                              }
                              title="Delete Session"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <AcademicSessionForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingSession(null);
          }}
          initialData={editingSession}
          onSuccess={() => {
            setShowForm(false);
            setEditingSession(null);
            loadAllSessions();
          }}
        />
      )}

      {/* Stats Modal */}
      {showStats && viewingStatsId && (
        <AcademicSessionStats
          sessionId={viewingStatsId}
          onClose={() => {
            setShowStats(false);
            setViewingStatsId(null);
          }}
        />
      )}
    </div>
  );
};

export default AcademicSessionList;
