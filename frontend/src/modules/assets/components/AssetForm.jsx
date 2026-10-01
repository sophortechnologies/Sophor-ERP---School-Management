// src/modules/assets/components/AssetForm.jsx
import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Package, AlertCircle } from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import { assetsApi } from "../api/assets.api";
import {
  ASSET_CATEGORIES,
  DEPRECIATION_METHODS,
  DEFAULT_ASSET_FORM,
} from "../constants/assets.constants";
import "./AssetForm.css";

const AssetForm = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const { createAsset, updateAsset, loading } = useAssets();
  const [formData, setFormData] = useState(DEFAULT_ASSET_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serialNumberError, setSerialNumberError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        model: initialData.model || "",
        manufacturer: initialData.manufacturer || "",
        serialNumber: initialData.serialNumber || "",
        category: initialData.category || "IT",
        subCategory: initialData.subCategory || "",
        purchaseDate: initialData.purchaseDate
          ? initialData.purchaseDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        purchaseCost: initialData.purchaseCost || "",
        vendorName: initialData.vendorName || "",
        invoiceNumber: initialData.invoiceNumber || "",
        warrantyExpiry: initialData.warrantyExpiry
          ? initialData.warrantyExpiry.split("T")[0]
          : "",
        depreciationMethod: initialData.depreciationMethod || "STRAIGHT_LINE",
        usefulLifeYears: initialData.usefulLifeYears || 5,
        salvageValue: initialData.salvageValue || 0,
        currentLocation: initialData.currentLocation || "",
        maintenanceInterval: initialData.maintenanceInterval || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData(DEFAULT_ASSET_FORM);
    }
    setErrors({});
    setSerialNumberError("");
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serialNumberError) {
      setSerialNumberError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (!formData.purchaseCost)
      newErrors.purchaseCost = "Purchase cost is required";
    if (formData.purchaseCost && parseFloat(formData.purchaseCost) <= 0) {
      newErrors.purchaseCost = "Purchase cost must be greater than 0";
    }
    if (!formData.usefulLifeYears)
      newErrors.usefulLifeYears = "Useful life is required";
    if (
      formData.usefulLifeYears &&
      (formData.usefulLifeYears < 1 || formData.usefulLifeYears > 50)
    ) {
      newErrors.usefulLifeYears = "Useful life must be between 1 and 50 years";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if serial number already exists (only if provided)
    const serialNumber = formData.serialNumber?.trim();
    if (
      serialNumber &&
      (!initialData || initialData.serialNumber !== serialNumber)
    ) {
      const checkResult = await assetsApi.checkSerialNumber(
        serialNumber,
        initialData?.id,
      );
      if (checkResult.exists) {
        setSerialNumberError(
          `Serial number "${serialNumber}" already exists. Please use a different serial number.`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        model: formData.model?.trim() || undefined,
        manufacturer: formData.manufacturer?.trim() || undefined,
        serialNumber: serialNumber || undefined,
        category: formData.category,
        subCategory: formData.subCategory?.trim() || undefined,
        purchaseDate: formData.purchaseDate,
        purchaseCost: parseFloat(formData.purchaseCost),
        vendorName: formData.vendorName?.trim() || undefined,
        invoiceNumber: formData.invoiceNumber?.trim() || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        depreciationMethod: formData.depreciationMethod,
        usefulLifeYears: parseInt(formData.usefulLifeYears),
        salvageValue: parseFloat(formData.salvageValue) || 0,
        currentLocation: formData.currentLocation?.trim() || undefined,
        maintenanceInterval: formData.maintenanceInterval
          ? parseInt(formData.maintenanceInterval)
          : undefined,
        notes: formData.notes?.trim() || undefined,
      };

      let result;
      if (initialData) {
        result = await updateAsset(initialData.id, submitData);
      } else {
        result = await createAsset(submitData);
      }

      if (result.success) {
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        // Check if error is about duplicate serial number
        if (
          result.error?.toLowerCase().includes("serial") ||
          result.error?.toLowerCase().includes("unique")
        ) {
          setSerialNumberError(
            "This serial number already exists. Please use a different serial number.",
          );
        } else {
          alert(result.error || "Failed to save asset");
        }
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      if (
        error.message?.toLowerCase().includes("serial") ||
        error.message?.toLowerCase().includes("unique")
      ) {
        setSerialNumberError(
          "This serial number already exists. Please use a different serial number.",
        );
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assets-assetform-modal-overlay" onClick={onClose}>
      <div className="assets-assetform-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="assets-assetform-modal-header">
          <h2>
            <Package size={20} />
            {initialData ? "Edit Asset" : "Add New Asset"}
          </h2>
          <button className="assets-assetform-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="assets-assetform-asset-form">
          <div className="assets-assetform-modal-body">
            {/* Basic Information */}
            <div className="assets-assetform-form-section">
              <h3 className="assets-assetform-section-title">Basic Information</h3>
              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>
                    Asset Name <span className="assets-assetform-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Dell XPS 15"
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <span className="assets-assetform-error-text">{errors.name}</span>
                  )}
                </div>

                <div className="assets-assetform-form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., XPS-15-9520"
                  />
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g., Dell"
                  />
                </div>

                <div className="assets-assetform-form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g., CN-12345-67890"
                    className={serialNumberError ? "error" : ""}
                  />
                  {serialNumberError && (
                    <span className="assets-assetform-error-text">{serialNumberError}</span>
                  )}
                  <small className="assets-assetform-help-text">
                    Serial number must be unique. Leave empty if not applicable.
                  </small>
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>
                    Category <span className="assets-assetform-required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? "error" : ""}
                  >
                    {ASSET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="assets-assetform-error-text">{errors.category}</span>
                  )}
                </div>

                <div className="assets-assetform-form-group">
                  <label>Sub Category</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="e.g., Laptop, Desktop, Server"
                  />
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>Current Location</label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleChange}
                    placeholder="e.g., Computer Lab 1, Rack 3"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="assets-assetform-form-section">
              <h3 className="assets-assetform-section-title">Purchase Information</h3>
              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>
                    Purchase Date <span className="assets-assetform-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className={errors.purchaseDate ? "error" : ""}
                  />
                  {errors.purchaseDate && (
                    <span className="assets-assetform-error-text">{errors.purchaseDate}</span>
                  )}
                </div>

                <div className="assets-assetform-form-group">
                  <label>
                    Purchase Cost <span className="assets-assetform-required">*</span>
                  </label>
                  <div className="assets-assetform-input-with-icon">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      name="purchaseCost"
                      value={formData.purchaseCost}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className={errors.purchaseCost ? "error" : ""}
                    />
                  </div>
                  {errors.purchaseCost && (
                    <span className="assets-assetform-error-text">{errors.purchaseCost}</span>
                  )}
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>Vendor Name</label>
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    placeholder="e.g., Stationery Mart"
                  />
                </div>

                <div className="assets-assetform-form-group">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="e.g., INV-2024-001"
                  />
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>Warranty Expiry</label>
                  <div className="assets-assetform-input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      name="warrantyExpiry"
                      value={formData.warrantyExpiry}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="assets-assetform-form-group">
                  <label>Maintenance Interval (days)</label>
                  <input
                    type="number"
                    name="maintenanceInterval"
                    value={formData.maintenanceInterval}
                    onChange={handleChange}
                    placeholder="e.g., 90"
                  />
                </div>
              </div>
            </div>

            {/* Depreciation Information */}
            <div className="assets-assetform-form-section">
              <h3 className="assets-assetform-section-title">Depreciation Information</h3>
              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>
                    Depreciation Method <span className="assets-assetform-required">*</span>
                  </label>
                  <select
                    name="depreciationMethod"
                    value={formData.depreciationMethod}
                    onChange={handleChange}
                  >
                    {DEPRECIATION_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="assets-assetform-form-group">
                  <label>
                    Useful Life (years) <span className="assets-assetform-required">*</span>
                  </label>
                  <input
                    type="number"
                    name="usefulLifeYears"
                    value={formData.usefulLifeYears}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className={errors.usefulLifeYears ? "error" : ""}
                  />
                  {errors.usefulLifeYears && (
                    <span className="assets-assetform-error-text">{errors.usefulLifeYears}</span>
                  )}
                </div>
              </div>

              <div className="assets-assetform-form-row">
                <div className="assets-assetform-form-group">
                  <label>Salvage Value</label>
                  <div className="assets-assetform-input-with-icon">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      name="salvageValue"
                      value={formData.salvageValue}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="assets-assetform-form-section">
              <h3 className="assets-assetform-section-title">Additional Information</h3>
              <div className="assets-assetform-form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about this asset..."
                />
              </div>
            </div>
          </div>

          <div className="assets-assetform-modal-footer">
            <button
              type="button"
              className="btn assets-assetform-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : initialData
                  ? "Update Asset"
                  : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
