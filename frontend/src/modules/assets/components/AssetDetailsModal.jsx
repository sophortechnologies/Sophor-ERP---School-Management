// src/modules/assets/components/AssetDetailsModal.jsx
import React from "react";
import {
  X,
  Calendar,
  DollarSign,
  Package,
  User,
  Building,
  Wrench,
  AlertCircle,
  FileText,
  QrCode,
} from "lucide-react";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
} from "../constants/assets.constants";

const AssetDetailsModal = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryInfo = (category) => {
    return (
      ASSET_CATEGORIES.find((c) => c.value === category) || {
        icon: "📦",
        label: category,
        color: "#6b7280",
      }
    );
  };

  const getStatusInfo = (status) => {
    return (
      ASSET_STATUSES.find((s) => s.value === status) || {
        label: status,
        color: "#6b7280",
      }
    );
  };

  const categoryInfo = getCategoryInfo(asset.category);
  const statusInfo = getStatusInfo(asset.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <Package size={20} />
            Asset Details
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header Section */}
          <div className="asset-header">
            <div className="asset-tag-large">
              <QrCode size={16} />
              <span>{asset.assetTag}</span>
            </div>
            <h3 className="asset-title">{asset.name}</h3>
            {asset.model && <div className="asset-model">{asset.model}</div>}
          </div>

          {/* Status and Category */}
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">Category</span>
              <div
                className="category-badge-large"
                style={{
                  backgroundColor: `${categoryInfo.color}15`,
                  color: categoryInfo.color,
                }}
              >
                {categoryInfo.icon} {categoryInfo.label}
              </div>
            </div>
            <div className="info-card">
              <span className="info-label">Status</span>
              <div
                className="status-badge-large"
                style={{
                  backgroundColor: `${statusInfo.color}15`,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="info-section">
            <h4>Financial Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Purchase Cost</span>
                <span className="info-value">
                  {formatCurrency(asset.purchaseCost)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Value</span>
                <span className="info-value">
                  {formatCurrency(asset.currentValue)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Depreciation Method</span>
                <span className="info-value">
                  {asset.depreciationMethod?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Useful Life</span>
                <span className="info-value">
                  {asset.usefulLifeYears} years
                </span>
              </div>
              {asset.salvageValue > 0 && (
                <div className="info-item">
                  <span className="info-label">Salvage Value</span>
                  <span className="info-value">
                    {formatCurrency(asset.salvageValue)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Information */}
          <div className="info-section">
            <h4>Purchase Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Purchase Date</span>
                <span className="info-value">
                  {formatDate(asset.purchaseDate)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Vendor</span>
                <span className="info-value">{asset.vendorName || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Invoice Number</span>
                <span className="info-value">
                  {asset.invoiceNumber || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Warranty Expiry</span>
                <span className="info-value">
                  {formatDate(asset.warrantyExpiry)}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="info-section">
            <h4>Assignment Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Current Location</span>
                <span className="info-value">
                  {asset.currentLocation || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Assigned To</span>
                <span className="info-value">
                  {asset.assignedToUser ? (
                    <div className="assigned-user-info">
                      <User size={14} />
                      {asset.assignedToUser.firstName}{" "}
                      {asset.assignedToUser.lastName}
                    </div>
                  ) : asset.assignedToDepartment ? (
                    <div className="assigned-dept-info">
                      <Building size={14} />
                      {asset.assignedToDepartment.name}
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </span>
              </div>
              {asset.assignedAt && (
                <div className="info-item">
                  <span className="info-label">Assigned Date</span>
                  <span className="info-value">
                    {formatDate(asset.assignedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Information */}
          <div className="info-section">
            <h4>Maintenance Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Last Maintenance</span>
                <span className="info-value">
                  {formatDate(asset.lastMaintenanceDate)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Next Maintenance</span>
                <span className="info-value">
                  {formatDate(asset.nextMaintenanceDate)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Maintenance Cost</span>
                <span className="info-value">
                  {formatCurrency(asset.maintenanceCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Maintenance History */}
          {asset.maintenanceRecords && asset.maintenanceRecords.length > 0 && (
            <div className="info-section">
              <h4>Maintenance History</h4>
              <div className="history-list">
                {asset.maintenanceRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="history-item">
                    <div className="history-date">
                      {formatDate(record.maintenanceDate)}
                    </div>
                    <div className="history-details">
                      <span className="history-type">{record.type}</span>
                      <span className="history-cost">
                        {formatCurrency(record.cost)}
                      </span>
                    </div>
                    <div className="history-description">
                      {record.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {asset.notes && (
            <div className="info-section">
              <h4>Notes</h4>
              <div className="notes-content">{asset.notes}</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsModal;
