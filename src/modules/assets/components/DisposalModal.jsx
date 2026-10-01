// src/modules/assets/components/DisposalModal.jsx
import React, { useState } from "react";
import { X, DollarSign, AlertTriangle } from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import { DISPOSAL_TYPES } from "../constants/assets.constants";

const DisposalModal = ({ isOpen, onClose, asset, onSuccess }) => {
  const { disposeAsset, loading } = useAssets();
  const [formData, setFormData] = useState({
    disposalType: "SOLD",
    saleAmount: "",
    disposalCost: "",
    buyerName: "",
    reason: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.reason.trim())
      newErrors.reason = "Reason for disposal is required";
    if (formData.saleAmount && parseFloat(formData.saleAmount) < 0) {
      newErrors.saleAmount = "Sale amount cannot be negative";
    }
    if (formData.disposalCost && parseFloat(formData.disposalCost) < 0) {
      newErrors.disposalCost = "Disposal cost cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      disposalType: formData.disposalType,
      reason: formData.reason,
      saleAmount: formData.saleAmount
        ? parseFloat(formData.saleAmount)
        : undefined,
      disposalCost: formData.disposalCost
        ? parseFloat(formData.disposalCost)
        : undefined,
      buyerName: formData.buyerName || undefined,
      notes: formData.notes || undefined,
    };

    const result = await disposeAsset(asset.id, submitData);
    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(result.error || "Failed to dispose asset");
    }
  };

  if (!isOpen) return null;

  const selectedDisposalType = DISPOSAL_TYPES.find(
    (t) => t.value === formData.disposalType,
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dispose Asset: {asset.name}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="warning-message">
              <AlertTriangle size={20} />
              <div>
                <strong>Warning:</strong> This action will mark the asset as
                disposed. Current value:{" "}
                <strong>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "ETB",
                  }).format(asset.currentValue || 0)}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label>Disposal Type</label>
              <select
                name="disposalType"
                value={formData.disposalType}
                onChange={handleChange}
              >
                {DISPOSAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDisposalType?.value === "SOLD" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sale Amount</label>
                    <div className="input-with-icon">
                      <DollarSign size={16} />
                      <input
                        type="number"
                        name="saleAmount"
                        value={formData.saleAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        className={errors.saleAmount ? "error" : ""}
                      />
                    </div>
                    {errors.saleAmount && (
                      <span className="error-text">{errors.saleAmount}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Disposal Cost</label>
                    <div className="input-with-icon">
                      <DollarSign size={16} />
                      <input
                        type="number"
                        name="disposalCost"
                        value={formData.disposalCost}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        className={errors.disposalCost ? "error" : ""}
                      />
                    </div>
                    {errors.disposalCost && (
                      <span className="error-text">{errors.disposalCost}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Buyer Name</label>
                  <input
                    type="text"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Corp"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>
                Reason for Disposal <span className="required">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                placeholder="Why is this asset being disposed?"
                className={errors.reason ? "error" : ""}
              />
              {errors.reason && (
                <span className="error-text">{errors.reason}</span>
              )}
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Any additional notes about the disposal..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading
                ? "Processing..."
                : `Confirm Disposal (${selectedDisposalType?.label})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisposalModal;
