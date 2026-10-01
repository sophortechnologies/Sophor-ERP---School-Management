// src/modules/staff/components/DeleteConfirmationModal.jsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import "./DeleteConfirmationModal.css";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  staffMember 
}) => {
  if (!isOpen || !staffMember) return null;

  const fullName = `${staffMember.firstName || ''} ${staffMember.lastName || ''}`.trim() || 
                   staffMember.staffId || 
                   'this staff member';

  return (
    <div className="staff-deleteconfirmationmodal-delete-modal-overlay" onClick={onClose}>
      <div className="staff-deleteconfirmationmodal-delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="staff-deleteconfirmationmodal-delete-modal-header">
          <div className="staff-deleteconfirmationmodal-warning-icon">
            <AlertTriangle size={24} />
          </div>
          <h3>Delete Staff Member</h3>
          <button className="staff-deleteconfirmationmodal-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="staff-deleteconfirmationmodal-delete-modal-body">
          <p className="staff-deleteconfirmationmodal-warning-text">
            Are you sure you want to delete <strong>{fullName}</strong>?
          </p>
          
          <div className="staff-deleteconfirmationmodal-staff-details">
            <div className="staff-deleteconfirmationmodal-detail-item">
              <span className="staff-deleteconfirmationmodal-detail-label">Staff ID:</span>
              <span className="staff-deleteconfirmationmodal-detail-value">{staffMember.staffId || 'N/A'}</span>
            </div>
            <div className="staff-deleteconfirmationmodal-detail-item">
              <span className="staff-deleteconfirmationmodal-detail-label">Designation:</span>
              <span className="staff-deleteconfirmationmodal-detail-value">{staffMember.designation || 'N/A'}</span>
            </div>
            <div className="staff-deleteconfirmationmodal-detail-item">
              <span className="staff-deleteconfirmationmodal-detail-label">Email:</span>
              <span className="staff-deleteconfirmationmodal-detail-value">{staffMember.email || 'N/A'}</span>
            </div>
          </div>

          <div className="staff-deleteconfirmationmodal-warning-message">
            <AlertTriangle size={16} />
            <p>This action cannot be undone. All related data will be permanently removed.</p>
          </div>
        </div>

        <div className="staff-deleteconfirmationmodal-delete-modal-footer">
          <button 
            className="btn staff-deleteconfirmationmodal-btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              onConfirm(staffMember);
              onClose();
            }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;