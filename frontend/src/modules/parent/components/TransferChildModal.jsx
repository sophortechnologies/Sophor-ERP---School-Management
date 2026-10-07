import React, { useState } from "react";
import "./AssignChildModal.css";

export const TransferChildModal = ({
  isOpen,
  onClose,
  onTransfer,
  currentParent,
  student,
  allParents = [],
}) => {
  const [targetParentId, setTargetParentId] = useState("");

  if (!isOpen || !student) return null;

  // Filter out the current parent so you only transfer to a DIFFERENT parent
  const destinationParents = allParents.filter(
    (p) => String(p.id) !== String(currentParent?.id),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetParentId) return;
    onTransfer(currentParent.id, targetParentId, student.id);
    onClose();
  };

  return (
    <div className="assign-modal-overlay">
      <div className="assign-modal-content">
        <div className="assign-modal-header">
          <h3 className="assign-modal-title">
            Transfer Guardian for {student.firstName} {student.lastName}
          </h3>
          <button
            type="button"
            className="assign-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="assign-modal-body">
            <p className="assign-modal-description">
              School policy requires all students to have an assigned
              guardian[cite: 2]. Please choose the parent to whom{" "}
              <strong>{student.firstName}</strong> will be transferred.
            </p>

            <div className="assign-form-group">
              <label className="assign-form-label">Current Guardian</label>
              <input
                type="text"
                className="assign-form-input"
                disabled
                value={`${currentParent?.firstName || ""} ${currentParent?.lastName || ""} (${currentParent?.relationship || "Guardian"})`}
              />
            </div>

            <div className="assign-form-group">
              <label className="assign-form-label">
                Transfer To Guardian *
              </label>
              <select
                className="assign-form-select"
                value={targetParentId}
                onChange={(e) => setTargetParentId(e.target.value)}
                required
              >
                <option value="">-- Select Destination Parent --</option>
                {destinationParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.phone || p.email} (
                    {p.relationship})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="assign-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!targetParentId}
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
