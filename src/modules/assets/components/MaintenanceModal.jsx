// src/modules/assets/components/MaintenanceModal.jsx
import React, { useState } from "react";
import { X, DollarSign, Calendar, Wrench } from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import { MAINTENANCE_TYPES } from "../constants/assets.constants";

const MaintenanceModal = ({ isOpen, onClose, asset, onSuccess }) => {
  const { scheduleMaintenance, loading } = useAssets();
  const [formData, setFormData] = useState({
    type: "PREVENTIVE",
    description: "",
    cost: "",
    vendorName: "",
    technicianName: "",
    nextDueDate: "",
    invoiceNumber: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.cost) newErrors.cost = "Cost is required";
    if (formData.cost && parseFloat(formData.cost) < 0)
      newErrors.cost = "Cost must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      cost: parseFloat(formData.cost),
      nextDueDate: formData.nextDueDate || undefined,
    };

    const result = await scheduleMaintenance(asset.id, submitData);
    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(result.error || "Failed to schedule maintenance");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Schedule Maintenance: {asset.name}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Maintenance Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the maintenance work performed..."
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Cost <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className={errors.cost ? "error" : ""}
                  />
                </div>
                {errors.cost && (
                  <span className="error-text">{errors.cost}</span>
                )}
              </div>

              <div className="form-group">
                <label>Next Due Date</label>
                <div className="input-with-icon">
                  <Calendar size={16} />
                  <input
                    type="date"
                    name="nextDueDate"
                    value={formData.nextDueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vendor Name</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="e.g., Tech Solutions"
                />
              </div>

              <div className="form-group">
                <label>Technician Name</label>
                <input
                  type="text"
                  name="technicianName"
                  value={formData.technicianName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="e.g., INV-M-2025-001"
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="2"
                placeholder="Any additional remarks..."
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Maintenance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
