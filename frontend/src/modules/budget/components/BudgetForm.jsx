import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Building, AlertCircle } from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import {
  BUDGET_CATEGORIES,
  BUDGET_TYPES,
  FISCAL_YEARS,
  DEFAULT_BUDGET_FORM,
} from "../constants/budget.constants";
import "./BudgetForm.css";

const BudgetForm = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const { createBudget, updateBudget, loading } = useBudget();
  const [formData, setFormData] = useState(DEFAULT_BUDGET_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);
      let deptData = [];
      if (response.data?.data) deptData = response.data.data;
      else if (Array.isArray(response.data)) deptData = response.data;
      setDepartments(deptData);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        budgetCode: initialData.budgetCode || "",
        fiscalYear: initialData.fiscalYear || DEFAULT_BUDGET_FORM.fiscalYear,
        departmentId: initialData.departmentId || "",
        costCenter: initialData.costCenter || "",
        category: initialData.category || "OPERATIONAL",
        subCategory: initialData.subCategory || "",
        budgetType: initialData.budgetType || "ANNUAL",
        allocatedAmount: initialData.allocatedAmount || "",
        softStopPercent: initialData.softStopPercent || 80,
        hardStopPercent: initialData.hardStopPercent || 100,
        alertEmail: initialData.alertEmail || "",
        allowRollover: initialData.allowRollover || false,
        rolloverToNextYear: initialData.rolloverToNextYear || false,
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        ...DEFAULT_BUDGET_FORM,
        fiscalYear:
          new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.budgetCode.trim())
      newErrors.budgetCode = "Budget code is required";
    if (!formData.fiscalYear) newErrors.fiscalYear = "Fiscal year is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.budgetType) newErrors.budgetType = "Budget type is required";
    if (!formData.allocatedAmount)
      newErrors.allocatedAmount = "Allocated amount is required";
    if (formData.allocatedAmount && parseFloat(formData.allocatedAmount) <= 0) {
      newErrors.allocatedAmount = "Allocated amount must be greater than 0";
    }
    if (
      formData.softStopPercent &&
      (formData.softStopPercent < 0 || formData.softStopPercent > 100)
    ) {
      newErrors.softStopPercent = "Soft stop must be between 0 and 100";
    }
    if (
      formData.hardStopPercent &&
      (formData.hardStopPercent < 0 || formData.hardStopPercent > 100)
    ) {
      newErrors.hardStopPercent = "Hard stop must be between 0 and 100";
    }
    if (
      formData.alertEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alertEmail)
    ) {
      newErrors.alertEmail = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        allocatedAmount: parseFloat(formData.allocatedAmount),
        departmentId: formData.departmentId
          ? parseInt(formData.departmentId)
          : undefined,
        softStopPercent: parseFloat(formData.softStopPercent),
        hardStopPercent: parseFloat(formData.hardStopPercent),
      };

      let result;
      if (initialData) {
        result = await updateBudget(initialData.id, submitData);
      } else {
        result = await createBudget(submitData);
      }

      if (result.success) {
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        alert(result.error || "Failed to save budget");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content budget-budgetform-budget-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <DollarSign size={20} />
            {initialData ? "Edit Budget" : "Create New Budget"}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="budget-budgetform-budget-form">
          <div className="modal-body">
            {/* Basic Information */}
            <div className="budget-budgetform-form-section">
              <h3 className="budget-budgetform-section-title">Basic Information</h3>
              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>
                    Budget Code <span className="budget-budgetform-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="budgetCode"
                    value={formData.budgetCode}
                    onChange={handleChange}
                    placeholder="e.g., BUD-2025-ACADEMICS-001"
                    className={errors.budgetCode ? "error" : ""}
                  />
                  {errors.budgetCode && (
                    <span className="budget-budgetform-error-text">{errors.budgetCode}</span>
                  )}
                </div>

                <div className="budget-budgetform-form-group">
                  <label>
                    Fiscal Year <span className="budget-budgetform-required">*</span>
                  </label>
                  <select
                    name="fiscalYear"
                    value={formData.fiscalYear}
                    onChange={handleChange}
                    className={errors.fiscalYear ? "error" : ""}
                  >
                    <option value="">Select Fiscal Year</option>
                    {FISCAL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.fiscalYear && (
                    <span className="budget-budgetform-error-text">{errors.fiscalYear}</span>
                  )}
                </div>
              </div>

              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    disabled={loadingDepts}
                  >
                    <option value="">Select Department (Optional)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="budget-budgetform-form-group">
                  <label>Cost Center</label>
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    placeholder="e.g., ACAD-001"
                  />
                </div>
              </div>

              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>
                    Category <span className="budget-budgetform-required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? "error" : ""}
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="budget-budgetform-error-text">{errors.category}</span>
                  )}
                </div>

                <div className="budget-budgetform-form-group">
                  <label>Sub Category</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="e.g., Teaching Materials"
                  />
                </div>
              </div>

              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>
                    Budget Type <span className="budget-budgetform-required">*</span>
                  </label>
                  <select
                    name="budgetType"
                    value={formData.budgetType}
                    onChange={handleChange}
                    className={errors.budgetType ? "error" : ""}
                  >
                    {BUDGET_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.budgetType && (
                    <span className="budget-budgetform-error-text">{errors.budgetType}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Amounts */}
            <div className="budget-budgetform-form-section">
              <h3 className="budget-budgetform-section-title">Budget Amounts</h3>
              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>
                    Allocated Amount <span className="budget-budgetform-required">*</span>
                  </label>
                  <div className="budget-budgetform-input-with-icon">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      name="allocatedAmount"
                      value={formData.allocatedAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className={errors.allocatedAmount ? "error" : ""}
                    />
                  </div>
                  {errors.allocatedAmount && (
                    <span className="budget-budgetform-error-text">{errors.allocatedAmount}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="budget-budgetform-form-section">
              <h3 className="budget-budgetform-section-title">Threshold Settings</h3>
              <div className="budget-budgetform-form-row">
                <div className="budget-budgetform-form-group">
                  <label>Soft Stop Percentage (%)</label>
                  <input
                    type="number"
                    name="softStopPercent"
                    value={formData.softStopPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="5"
                  />
                  <small className="budget-budgetform-help-text">
                    Alert when usage exceeds this percentage
                  </small>
                  {errors.softStopPercent && (
                    <span className="budget-budgetform-error-text">{errors.softStopPercent}</span>
                  )}
                </div>

                <div className="budget-budgetform-form-group">
                  <label>Hard Stop Percentage (%)</label>
                  <input
                    type="number"
                    name="hardStopPercent"
                    value={formData.hardStopPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="5"
                  />
                  <small className="budget-budgetform-help-text">
                    Block expenses when usage exceeds this percentage
                  </small>
                  {errors.hardStopPercent && (
                    <span className="budget-budgetform-error-text">{errors.hardStopPercent}</span>
                  )}
                </div>
              </div>

              <div className="budget-budgetform-form-group">
                <label>Alert Email</label>
                <input
                  type="email"
                  name="alertEmail"
                  value={formData.alertEmail}
                  onChange={handleChange}
                  placeholder="finance@school.com"
                  className={errors.alertEmail ? "error" : ""}
                />
                {errors.alertEmail && (
                  <span className="budget-budgetform-error-text">{errors.alertEmail}</span>
                )}
              </div>
            </div>

            {/* Rollover Settings */}
            <div className="budget-budgetform-form-section">
              <h3 className="budget-budgetform-section-title">Rollover Settings</h3>
              <div className="budget-budgetform-checkbox-group">
                <label className="budget-budgetform-checkbox-label">
                  <input
                    type="checkbox"
                    name="allowRollover"
                    checked={formData.allowRollover}
                    onChange={handleChange}
                  />
                  <span>Allow unused budget to roll over to next year</span>
                </label>
              </div>

              {formData.allowRollover && (
                <div className="budget-budgetform-checkbox-group">
                  <label className="budget-budgetform-checkbox-label">
                    <input
                      type="checkbox"
                      name="rolloverToNextYear"
                      checked={formData.rolloverToNextYear}
                      onChange={handleChange}
                    />
                    <span>Automatically roll over to next fiscal year</span>
                  </label>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="budget-budgetform-form-section">
              <h3 className="budget-budgetform-section-title">Additional Information</h3>
              <div className="budget-budgetform-form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about this budget..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
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
                  ? "Update Budget"
                  : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
