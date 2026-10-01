// src/modules/academic-sessions/components/AcademicSessionStats.jsx
import React, { useEffect, useState } from "react";
import {
  X,
  Users,
  BookOpen,
  FileText,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { academicSessionsApi } from "../api/academic-sessions.api";
import "../../classes/components/ClassForm.css"; // Reuse shared clean modal CSS

const AcademicSessionStats = ({ sessionId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await academicSessionsApi.getStats(sessionId);
        if (response.success && response.data) {
          setSession(response.data.session);
          setStatistics(response.data.statistics);
        } else {
          const sessionResponse = await academicSessionsApi.getById(sessionId);
          if (sessionResponse.success) {
            setSession(sessionResponse.data);
            setStatistics({
              studentCount: 0,
              classCount: 0,
              examCount: 0,
              holidayCount: 0,
              durationInDays: Math.ceil(
                (new Date(sessionResponse.data.endDate) -
                  new Date(sessionResponse.data.startDate)) /
                  (1000 * 3600 * 24),
              ),
              isCurrent:
                new Date(sessionResponse.data.startDate) <= new Date() &&
                new Date(sessionResponse.data.endDate) >= new Date(),
            });
          } else {
            setError(sessionResponse.message);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [sessionId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  if (!sessionId) return null;

  return (
    <div className="class-modal-overlay" onClick={onClose}>
      <div className="class-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="class-modal-header">
          <h2>
            <CalendarIcon size={20} />
            Session Statistics: {session?.name || "Loading..."}
          </h2>
          <button
            type="button"
            className="class-modal-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="class-modal-body session-stats-body">
          {loading ? (
            <div className="session-stats-loading">Loading statistics...</div>
          ) : error ? (
            <div className="class-modal-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="session-details-summary">
                <div className="session-summary-row">
                  <span>Start Date:</span>
                  <strong>{formatDate(session?.startDate)}</strong>
                </div>
                <div className="session-summary-row">
                  <span>End Date:</span>
                  <strong>{formatDate(session?.endDate)}</strong>
                </div>
                <div className="session-summary-row">
                  <span>Duration:</span>
                  <strong>{statistics?.durationInDays || 0} days</strong>
                </div>
                <div className="session-summary-row">
                  <span>Status:</span>
                  <strong>
                    {statistics?.isCurrent
                      ? "Currently Active"
                      : new Date(session?.endDate) < new Date()
                        ? "Completed"
                        : "Upcoming"}
                  </strong>
                </div>
              </div>

              <div className="session-stats-grid">
                <div className="session-stat-card">
                  <div className="session-stat-icon blue">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="session-stat-num">
                      {statistics?.studentCount || 0}
                    </p>
                    <p className="session-stat-label">Students Enrolled</p>
                  </div>
                </div>

                <div className="session-stat-card">
                  <div className="session-stat-icon green">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="session-stat-num">
                      {statistics?.classCount || 0}
                    </p>
                    <p className="session-stat-label">Active Classes</p>
                  </div>
                </div>

                <div className="session-stat-card">
                  <div className="session-stat-icon orange">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="session-stat-num">
                      {statistics?.examCount || 0}
                    </p>
                    <p className="session-stat-label">Exams Conducted</p>
                  </div>
                </div>

                <div className="session-stat-card">
                  <div className="session-stat-icon purple">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <p className="session-stat-num">
                      {statistics?.holidayCount || 0}
                    </p>
                    <p className="session-stat-label">Holidays</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="class-modal-actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicSessionStats;
