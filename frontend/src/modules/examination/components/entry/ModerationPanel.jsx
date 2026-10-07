// src/modules/examination/components/entry/ModerationPanel.jsx
import React, { useState } from "react";
import {
  Check,
  X,
  Eye,
  Filter,
  AlertCircle,
  Users,
  BookOpen,
} from "lucide-react";
import "./ModerationPanel.css";

const ModerationPanel = ({
  marks = [],
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const [filter, setFilter] = useState("pending");
  const [selectedMarks, setSelectedMarks] = useState([]);

  const filteredMarks = marks.filter((mark) => {
    if (filter === "all") return true;
    return mark.status === filter;
  });

  const handleSelectAll = () => {
    if (selectedMarks.length === filteredMarks.length) {
      setSelectedMarks([]);
    } else {
      setSelectedMarks(filteredMarks.map((mark) => mark.id));
    }
  };

  const handleSelectMark = (markId) => {
    setSelectedMarks((prev) =>
      prev.includes(markId)
        ? prev.filter((id) => id !== markId)
        : [...prev, markId],
    );
  };

  const handleBulkApprove = () => {
    if (selectedMarks.length === 0) {
      alert("Please select marks to approve");
      return;
    }
    onApprove(selectedMarks);
    setSelectedMarks([]);
  };

  const handleBulkReject = () => {
    if (selectedMarks.length === 0) {
      alert("Please select marks to reject");
      return;
    }
    onReject(selectedMarks);
    setSelectedMarks([]);
  };

  const stats = {
    total: marks.length,
    pending: marks.filter((m) => m.status === "pending").length,
    approved: marks.filter((m) => m.status === "approved").length,
    rejected: marks.filter((m) => m.status === "rejected").length,
  };

  return (
    <div className="examination-entry-moderationpanel-moderation-panel">
      <div className="examination-entry-moderationpanel-panel-controls">
        <div className="examination-entry-moderationpanel-filter-tabs">
          <button
            className={`examination-entry-moderationpanel-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({stats.total})
          </button>
          <button
            className={`examination-entry-moderationpanel-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`examination-entry-moderationpanel-tab ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`examination-entry-moderationpanel-tab ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div className="examination-entry-moderationpanel-bulk-actions">
          <button
            className="btn examination-entry-moderationpanel-btn-secondary"
            onClick={handleSelectAll}
          >
            {selectedMarks.length === filteredMarks.length
              ? "Deselect All"
              : "Select All"}
          </button>

          {selectedMarks.length > 0 && (
            <>
              <button
                className="btn examination-entry-moderationpanel-btn-success"
                onClick={handleBulkApprove}
              >
                <Check size={16} />
                Approve ({selectedMarks.length})
              </button>
              <button className="btn btn-danger" onClick={handleBulkReject}>
                <X size={16} />
                Reject ({selectedMarks.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="examination-entry-moderationpanel-marks-list">
        {filteredMarks.length === 0 ? (
          <div className="examination-entry-moderationpanel-empty-state">
            <AlertCircle size={48} />
            <p>No marks found for the selected filter.</p>
          </div>
        ) : (
          <div className="examination-entry-moderationpanel-marks-grid">
            {filteredMarks.map((mark) => (
              <div
                key={mark.id}
                className={`examination-entry-moderationpanel-mark-card status-${mark.status}`}
              >
                <div className="card-header">
                  <div className="examination-entry-moderationpanel-student-info">
                    <div className="examination-entry-moderationpanel-student-name">
                      {mark.studentName}
                    </div>
                    <div className="examination-entry-moderationpanel-student-id">
                      {mark.studentId}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMarks.includes(mark.id)}
                    onChange={() => handleSelectMark(mark.id)}
                  />
                </div>

                <div className="card-body">
                  <div className="examination-entry-moderationpanel-exam-info">
                    <BookOpen size={14} />
                    <span>{mark.examName}</span>
                  </div>
                  <div className="examination-entry-moderationpanel-subject-info">
                    <span>{mark.subjectName}</span>
                  </div>

                  <div className="examination-entry-moderationpanel-marks-info">
                    <div className="examination-entry-moderationpanel-marks-display">
                      <span className="examination-entry-moderationpanel-obtained">
                        {mark.marksObtained}
                      </span>
                      <span className="examination-entry-moderationpanel-separator">
                        /
                      </span>
                      <span className="examination-entry-moderationpanel-total">
                        {mark.totalMarks}
                      </span>
                    </div>
                    <div className="examination-entry-moderationpanel-percentage">
                      {((mark.marksObtained / mark.totalMarks) * 100).toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>

                  <div className="examination-entry-moderationpanel-grade-info">
                    <span
                      className={`examination-entry-moderationpanel-grade-badge grade-${mark.grade}`}
                    >
                      {mark.grade}
                    </span>
                    <span
                      className={`examination-entry-moderationpanel-status-badge status-${mark.status}`}
                    >
                      {mark.status}
                    </span>
                  </div>
                </div>

                <div className="examination-entry-moderationpanel-card-actions">
                  {mark.status === "pending" && (
                    <>
                      <button
                        className="btn examination-entry-moderationpanel-btn-sm examination-entry-moderationpanel-btn-success"
                        onClick={() => onApprove([mark.id])}
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        className="btn examination-entry-moderationpanel-btn-sm btn-danger"
                        onClick={() => onReject([mark.id])}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    className="btn examination-entry-moderationpanel-btn-sm examination-entry-moderationpanel-btn-secondary"
                    onClick={() => onViewDetails(mark)}
                  >
                    <Eye size={14} />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPanel;
