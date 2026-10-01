// src/modules/budget/components/TransferModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  AlertCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import { budgetApi } from "../api/budget.api";

const TransferModal = ({ isOpen, onClose, budgets = [], onSuccess }) => {
  const { requestTransfer, loading } = useBudget();
  const [formData, setFormData] = useState({
    fromBudgetId: "",
    toBudgetId: "",
    amount: "",
    reason: "",
    justification: "",
  });
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Filter only APPROVED budgets for transfer (can't transfer from/to DRAFT or REJECTED budgets)
  const approvedBudgets = budgets.filter((b) => b.status === "APPROVED");

  useEffect(() => {
    if (formData.fromBudgetId && formData.amount) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [formData.fromBudgetId, formData.amount]);

  const checkAvailability = async () => {
    if (!formData.fromBudgetId || !formData.amount) return;

    setCheckingAvailability(true);
    try {
      const result = await budgetApi.checkAvailability(
        formData.fromBudgetId,
        parseFloat(formData.amount),
      );
      setAvailability(result.data);
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fromBudgetId)
      newErrors.fromBudgetId = "Please select source budget";
    if (!formData.toBudgetId)
      newErrors.toBudgetId = "Please select destination budget";
    if (formData.fromBudgetId === formData.toBudgetId) {
      newErrors.toBudgetId =
        "Source and destination budgets cannot be the same";
    }
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (formData.amount && parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.reason)
      newErrors.reason = "Please provide a reason for transfer";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await requestTransfer({
      fromBudgetId: parseInt(formData.fromBudgetId),
      toBudgetId: parseInt(formData.toBudgetId),
      amount: parseFloat(formData.amount),
      reason: formData.reason,
      justification: formData.justification,
    });

    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(result.error || "Failed to request transfer");
    }
  };

  const selectedFromBudget = approvedBudgets.find(
    (b) => b.id === parseInt(formData.fromBudgetId),
  );
  const selectedToBudget = approvedBudgets.find(
    (b) => b.id === parseInt(formData.toBudgetId),
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content transfer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <ArrowRight size={20} />
            Request Budget Transfer
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>
                  From Budget (Source) <span className="required">*</span>
                </label>
                <select
                  name="fromBudgetId"
                  value={formData.fromBudgetId}
                  onChange={handleChange}
                  className={errors.fromBudgetId ? "error" : ""}
                >
                  <option value="">Select source budget</option>
                  {approvedBudgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.budgetCode} - {budget.category} (
                      {formatCurrency(budget.availableAmount || 0)} available)
                    </option>
                  ))}
                </select>
                {errors.fromBudgetId && (
                  <span className="error-text">{errors.fromBudgetId}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  To Budget (Destination) <span className="required">*</span>
                </label>
                <select
                  name="toBudgetId"
                  value={formData.toBudgetId}
                  onChange={handleChange}
                  className={errors.toBudgetId ? "error" : ""}
                >
                  <option value="">Select destination budget</option>
                  {approvedBudgets
                    .filter((b) => b.id !== parseInt(formData.fromBudgetId))
                    .map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.budgetCode} - {budget.category}
                      </option>
                    ))}
                </select>
                {errors.toBudgetId && (
                  <span className="error-text">{errors.toBudgetId}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Transfer Amount <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className={errors.amount ? "error" : ""}
                  />
                </div>
                {errors.amount && (
                  <span className="error-text">{errors.amount}</span>
                )}

                {checkingAvailability && (
                  <div className="availability-checking">
                    Checking availability...
                  </div>
                )}

                {availability && !availability.available && (
                  <div className="availability-error">
                    <AlertCircle size={14} />
                    {availability.message}
                  </div>
                )}

                {availability && availability.available && (
                  <div className="availability-success">
                    <CheckCircle size={14} />
                    Available: {formatCurrency(availability.availableAmount)}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Reason for Transfer <span className="required">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="2"
                placeholder="Why is this transfer needed?"
                className={errors.reason ? "error" : ""}
              />
              {errors.reason && (
                <span className="error-text">{errors.reason}</span>
              )}
            </div>

            <div className="form-group">
              <label>Justification (Optional)</label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                rows="2"
                placeholder="Additional justification for the transfer..."
              />
            </div>

            {selectedFromBudget && (
              <div className="transfer-summary">
                <div className="summary-title">Transfer Summary</div>
                <div className="summary-details">
                  <div className="summary-item">
                    <span>Source Budget:</span>
                    <strong>{selectedFromBudget.budgetCode}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Destination Budget:</span>
                    <strong>
                      {selectedToBudget?.budgetCode || "Not selected"}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Transfer Amount:</span>
                    <strong>
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Available in Source:</span>
                    <strong>
                      {formatCurrency(selectedFromBudget.availableAmount || 0)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (availability && !availability.available)}
            >
              {loading ? "Requesting..." : "Request Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
