import React from "react";
import "./ParentCard.css";

export const ParentCard = ({ parent, onView, onEdit, onAssignChild }) => {
  const fullName =
    `${parent.firstName || ""} ${parent.lastName || ""}`.trim() || "Guardian";
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "P";

  const childrenCount = parent.students?.length || 0;

  return (
    <div className="parent-card">
      <div className="parent-card-header">
        <div className="parent-card-identity">
          <div className="parent-avatar-badge">{initials}</div>
          <div className="parent-card-meta">
            <h4 className="parent-name">{fullName}</h4>
            <span className="parent-relation-badge">
              {parent.relationship || "Guardian"}
            </span>
          </div>
        </div>
      </div>

      <div className="parent-details-list">
        <div className="parent-detail-row">
          <span className="detail-label">Email:</span>
          <span>{parent.email || "N/A"}</span>
        </div>
        <div className="parent-detail-row">
          <span className="detail-label">Phone:</span>
          <span>{parent.phone || "N/A"}</span>
        </div>
        <div className="parent-detail-row">
          <span className="detail-label">Children:</span>
          <span>{childrenCount} linked</span>
        </div>
      </div>

      <div className="parent-card-footer">
        <button
          type="button"
          onClick={() => onView(parent)}
          className="btn-link-action"
        >
          View Details
        </button>
        <div className="parent-action-buttons">
          <button
            type="button"
            onClick={() => onAssignChild(parent)}
            className="btn-action-assign"
          >
            + Link Child
          </button>
          <button
            type="button"
            onClick={() => onEdit(parent)}
            className="btn-action-edit"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
