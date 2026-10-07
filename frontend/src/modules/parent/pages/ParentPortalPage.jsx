import React, { useEffect, useState } from "react";
import { useParent } from "../hooks";
import { parentApi } from "../api";
import "./ParentPortalPage.css";

export const ParentPortalPage = () => {
  const { myChildren, loading, error, fetchMyChildren } = useParent();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [reportCard, setReportCard] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchMyChildren();
  }, [fetchMyChildren]);

  useEffect(() => {
    if (myChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(myChildren[0].id);
    }
  }, [myChildren, selectedChildId]);

  useEffect(() => {
    if (!selectedChildId) return;

    const loadChildData = async () => {
      setDetailsLoading(true);
      try {
        const [attRes, repRes] = await Promise.allSettled([
          parentApi.getChildAttendance(selectedChildId),
          parentApi.getChildReportCard(selectedChildId),
        ]);

        if (attRes.status === "fulfilled") {
          setAttendance(attRes.value.data || attRes.value || []);
        }
        if (repRes.status === "fulfilled") {
          setReportCard(repRes.value.data || repRes.value || null);
        }
      } finally {
        setDetailsLoading(false);
      }
    };

    loadChildData();
  }, [selectedChildId]);

  if (loading) {
    return <div className="parent-state-message">Loading Parent Portal...</div>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "PRESENT":
        return "status-present";
      case "ABSENT":
        return "status-absent";
      default:
        return "status-late";
    }
  };

  return (
    <div className="parent-portal-container">
      <div className="portal-header">
        <h1 className="portal-title">Parent Portal</h1>
        <p className="portal-subtitle">
          Monitor your children&apos;s daily attendance, academic scores, and
          grade reports.
        </p>
      </div>

      {error && <div className="parent-alert-error">{error}</div>}

      {myChildren.length === 0 ? (
        <div className="portal-empty-card">
          No children are currently linked to your parent account. Please reach
          out to the school administration office.
        </div>
      ) : (
        <>
          <div className="children-tab-bar">
            {myChildren.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`tab-child-btn ${selectedChildId === child.id ? "active" : ""}`}
              >
                {child.firstName} {child.lastName}
              </button>
            ))}
          </div>

          {detailsLoading ? (
            <div className="parent-state-message">
              Updating student statistics...
            </div>
          ) : (
            <div className="portal-dashboard-grid">
              <div className="portal-section-card">
                <h3 className="section-card-title">
                  Recent Attendance Records
                </h3>
                {attendance.length > 0 ? (
                  <ul className="attendance-list">
                    {attendance.slice(0, 10).map((record, index) => (
                      <li key={index} className="attendance-row">
                        <span>
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`status-tag ${getStatusClass(record.status)}`}
                        >
                          {record.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="portal-subtitle">
                    No attendance entries recorded.
                  </p>
                )}
              </div>

              <div className="portal-section-card">
                <h3 className="section-card-title">
                  Performance &amp; Report Card
                </h3>
                {reportCard ? (
                  <div className="report-summary-block">
                    <p>
                      <strong>GPA / Average:</strong>{" "}
                      {reportCard.gpa || reportCard.percentage || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong> {reportCard.status || "Active"}
                    </p>
                    {reportCard.subjects && (
                      <div>
                        <strong>Subject Breakdowns:</strong>
                        <ul className="subjects-score-list">
                          {reportCard.subjects.map((sub, index) => (
                            <li key={index} className="subject-score-item">
                              <span>{sub.subjectName || sub.name}</span>
                              <span>{sub.grade || sub.marks}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="portal-subtitle">
                    No published report card found for this term.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
