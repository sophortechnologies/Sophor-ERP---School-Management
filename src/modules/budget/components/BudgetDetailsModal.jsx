import React from "react";
import {
  X,
  DollarSign,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  BUDGET_CATEGORIES,
  BUDGET_STATUSES,
} from "../constants/budget.constants";

const BudgetDetailsModal = ({ isOpen, onClose, budget }) => {
  if (!isOpen || !budget) return null;

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
      BUDGET_CATEGORIES.find((c) => c.value === category) || {
        icon: "📦",
        label: category,
        color: "#6b7280",
      }
    );
  };

  const getStatusInfo = (status) => {
    return (
      BUDGET_STATUSES.find((s) => s.value === status) || {
        label: status,
        color: "#6b7280",
      }
    );
  };

  const categoryInfo = getCategoryInfo(budget.category);
  const statusInfo = getStatusInfo(budget.status);

  const allocated = budget.allocatedAmount || 0;
  const committed = budget.committedAmount || 0;
  const actual = budget.actualAmount || 0;
  const available = budget.availableAmount || allocated - committed - actual;
  const utilization =
    allocated > 0 ? ((actual + committed) / allocated) * 100 : 0;

  const getUtilizationColor = () => {
    if (utilization >= 100) return "#ef4444";
    if (utilization >= 80) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <DollarSign size={20} />
            Budget Details
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header Section */}
          <div className="budget-header">
            <div className="budget-code-large">{budget.budgetCode}</div>
            <h3 className="budget-title">{budget.category} Budget</h3>
            <div className="budget-meta">
              <span className="meta-item">
                <Calendar size={14} />
                {budget.fiscalYear}
              </span>
              {budget.department && (
                <span className="meta-item">
                  <Building size={14} />
                  {budget.department.name}
                </span>
              )}
            </div>
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
            <div className="info-card">
              <span className="info-label">Budget Type</span>
              <div className="info-value">{budget.budgetType}</div>
            </div>
            {budget.costCenter && (
              <div className="info-card">
                <span className="info-label">Cost Center</span>
                <div className="info-value">{budget.costCenter}</div>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="info-section">
            <h4>Financial Summary</h4>
            <div className="financial-grid">
              <div className="financial-item">
                <span className="financial-label">Allocated Amount</span>
                <span className="financial-value">
                  {formatCurrency(allocated)}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Committed Amount</span>
                <span className="financial-value">
                  {formatCurrency(committed)}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Actual Spent</span>
                <span className="financial-value">
                  {formatCurrency(actual)}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Available Balance</span>
                <span
                  className="financial-value"
                  style={{ color: available >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {formatCurrency(available)}
                </span>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="utilization-section">
              <div className="utilization-header">
                <span>Utilization Rate</span>
                <span
                  className="utilization-percentage"
                  style={{ color: getUtilizationColor() }}
                >
                  {utilization.toFixed(1)}%
                </span>
              </div>
              <div className="utilization-bar-large">
                <div
                  className="utilization-fill-large"
                  style={{
                    width: `${Math.min(utilization, 100)}%`,
                    backgroundColor: getUtilizationColor(),
                  }}
                />
              </div>
              <div className="threshold-labels">
                <span>Soft Stop: {budget.softStopPercent || 80}%</span>
                <span>Hard Stop: {budget.hardStopPercent || 100}%</span>
              </div>
            </div>
          </div>

          {/* Threshold Settings */}
          <div className="info-section">
            <h4>Threshold Settings</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Soft Stop Percentage</span>
                <span className="info-value">
                  {budget.softStopPercent || 80}%
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Hard Stop Percentage</span>
                <span className="info-value">
                  {budget.hardStopPercent || 100}%
                </span>
              </div>
              {budget.alertEmail && (
                <div className="info-item">
                  <span className="info-label">Alert Email</span>
                  <span className="info-value">{budget.alertEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rollover Settings */}
          {(budget.allowRollover || budget.rolloverToNextYear) && (
            <div className="info-section">
              <h4>Rollover Settings</h4>
              <div className="rollover-info">
                {budget.allowRollover && (
                  <div className="rollover-badge">
                    <CheckCircle size={14} />
                    Allow Rollover
                  </div>
                )}
                {budget.rolloverToNextYear && (
                  <div className="rollover-badge">
                    <CheckCircle size={14} />
                    Auto Rollover to Next Year
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="info-section">
            <h4>Timeline</h4>
            <div className="timeline-grid">
              {budget.createdAt && (
                <div className="timeline-item">
                  <Clock size={14} />
                  <div>
                    <div className="timeline-label">Created</div>
                    <div className="timeline-date">
                      {formatDate(budget.createdAt)}
                    </div>
                  </div>
                </div>
              )}
              {budget.submittedAt && (
                <div className="timeline-item">
                  <Clock size={14} />
                  <div>
                    <div className="timeline-label">Submitted</div>
                    <div className="timeline-date">
                      {formatDate(budget.submittedAt)}
                    </div>
                  </div>
                </div>
              )}
              {budget.approvedAt && (
                <div className="timeline-item">
                  <CheckCircle size={14} color="#10b981" />
                  <div>
                    <div className="timeline-label">Approved</div>
                    <div className="timeline-date">
                      {formatDate(budget.approvedAt)}
                    </div>
                  </div>
                </div>
              )}
              {budget.frozenAt && (
                <div className="timeline-item">
                  <AlertTriangle size={14} color="#f59e0b" />
                  <div>
                    <div className="timeline-label">Frozen</div>
                    <div className="timeline-date">
                      {formatDate(budget.frozenAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {budget.notes && (
            <div className="info-section">
              <h4>Notes</h4>
              <div className="notes-content">{budget.notes}</div>
            </div>
          )}

          {/* Commitments Section */}
          {budget.commitments && budget.commitments.length > 0 && (
            <div className="info-section">
              <h4>Active Commitments</h4>
              <div className="commitments-list">
                {budget.commitments.map((commitment) => (
                  <div key={commitment.id} className="commitment-item">
                    <div className="commitment-number">
                      {commitment.commitmentNumber}
                    </div>
                    <div className="commitment-amount">
                      {formatCurrency(commitment.amount)}
                    </div>
                    <div className="commitment-description">
                      {commitment.description}
                    </div>
                    <div className="commitment-date">
                      {formatDate(commitment.committedAt)}
                    </div>
                  </div>
                ))}
              </div>
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

export default BudgetDetailsModal;
