// src/modules/staff/components/StaffForm.jsx

import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Calendar, Briefcase } from "lucide-react";

import {
  DESIGNATIONS,
  EMPLOYMENT_TYPES,
  GENDER_OPTIONS,
  DEFAULT_STAFF_FORM,
  VALIDATION_MESSAGES,
  EMPLOYMENT_TYPE_MAP,
} from "../constants";
import "./StaffForm.css";

const StaffForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(DEFAULT_STAFF_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...DEFAULT_STAFF_FORM,
        ...initialData,
      });
    } else {
      setFormData(DEFAULT_STAFF_FORM);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Helper to transform frontend data to backend format
  const transformToBackendFormat = (data) => {
    console.log(" Transforming form data for backend...", data);

    // For edit mode, ONLY send designation (based on backend restriction)
    const backendPayload = {
      designation: data.designation,
    };

    console.log(
      " Backend payload for update (designation only):",
      backendPayload,
    );
    return backendPayload;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.firstName.trim())
      newErrors.firstName = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.lastName.trim())
      newErrors.lastName = VALIDATION_MESSAGES.REQUIRED;

    if (!formData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.REQUIRED;
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
    }

    if (!formData.designation)
      newErrors.designation = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.employmentType)
      newErrors.employmentType = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.joinDate) newErrors.joinDate = VALIDATION_MESSAGES.REQUIRED;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document
          .getElementById(firstError)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      // For updates, send only the data that backend allows
      let dataToSend = formData;

      if (initialData) {
        // For edit mode, only send updatable fields
        dataToSend = {
          designation: formData.designation,
          employmentType: formData.employmentType,
          joinDate: formData.joinDate,
          status: formData.status,
        };
      }

      await onSubmit(formData, dataToSend);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      alert(error.message || "Failed to save staff information");
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: <User size={16} /> },
    { id: "employment", label: "Employment", icon: <Briefcase size={16} /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="staff-staffform-modal-overlay" onClick={onClose}>
      <div className="staff-staffform-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="staff-staffform-modal-header">
          <h2>{initialData ? "Edit Staff Member" : "Register New Staff"}</h2>
          <button className="staff-staffform-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="staff-staffform-section-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`staff-staffform-section-btn ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="staff-staffform-staff-form">
          {/* Personal Information Section */}
          {activeSection === "personal" && (
            <div className="staff-staffform-form-section">
              <h3 className="staff-staffform-section-title">Personal Information</h3>

              {/* Edit mode warning */}
              {initialData && (
                <div className="staff-staffform-edit-note">
                  <p>
                    <strong>Read Only:</strong> Personal information cannot be
                    edited here.
                  </p>
                </div>
              )}

              <div className="staff-staffform-form-grid">
                <div className="staff-staffform-form-group">
                  <label htmlFor="firstName">
                    First Name <span className="staff-staffform-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={errors.firstName ? "error" : ""}
                    readOnly={!!initialData}
                  />
                  {errors.firstName && (
                    <span className="staff-staffform-error-text">{errors.firstName}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="lastName">
                    Last Name <span className="staff-staffform-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={errors.lastName ? "error" : ""}
                    readOnly={!!initialData}
                  />
                  {errors.lastName && (
                    <span className="staff-staffform-error-text">{errors.lastName}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="email">
                    Email <span className="staff-staffform-required">*</span>
                  </label>
                  <div className="staff-staffform-input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="staff@school.edu"
                      className={errors.email ? "error" : ""}
                      readOnly={!!initialData}
                    />
                  </div>
                  {errors.email && (
                    <span className="staff-staffform-error-text">{errors.email}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="phone">
                    Phone <span className="staff-staffform-required">*</span>
                  </label>
                  <div className="staff-staffform-input-with-icon">
                    <Phone size={16} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251911234567"
                      className={errors.phone ? "error" : ""}
                      readOnly={!!initialData}
                    />
                  </div>
                  {errors.phone && (
                    <span className="staff-staffform-error-text">{errors.phone}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <div className="staff-staffform-input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      readOnly={!!initialData}
                    />
                  </div>
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!initialData}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Employment Information Section */}
          {activeSection === "employment" && (
            <div className="staff-staffform-form-section">
              <h3 className="staff-staffform-section-title">Employment Information</h3>

              <div className="staff-staffform-form-grid">
                <div className="staff-staffform-form-group">
                  <label htmlFor="designation">
                    Designation <span className="staff-staffform-required">*</span>
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={errors.designation ? "error" : ""}
                  >
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((desg) => (
                      <option key={desg.value} value={desg.value}>
                        {desg.label}
                      </option>
                    ))}
                  </select>
                  {errors.designation && (
                    <span className="staff-staffform-error-text">{errors.designation}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="employmentType">
                    Employment Type <span className="staff-staffform-required">*</span>
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className={errors.employmentType ? "error" : ""}
                    disabled={!!initialData}
                  >
                    <option value="">Select type</option>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType && (
                    <span className="staff-staffform-error-text">{errors.employmentType}</span>
                  )}
                </div>

                <div className="staff-staffform-form-group">
                  <label htmlFor="joinDate">
                    Join Date <span className="staff-staffform-required">*</span>
                  </label>
                  <div className="staff-staffform-input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      id="joinDate"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleChange}
                      className={errors.joinDate ? "error" : ""}
                      readOnly={!!initialData}
                    />
                  </div>
                  {errors.joinDate && (
                    <span className="staff-staffform-error-text">{errors.joinDate}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          <div className="staff-staffform-form-navigation">
            <div className="staff-staffform-navigation-buttons">
              {activeSection !== "personal" && (
                <button
                  type="button"
                  className="btn staff-staffform-btn-secondary"
                  onClick={() => setActiveSection("personal")}
                >
                  Previous
                </button>
              )}

              {activeSection !== "employment" ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveSection("employment")}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : initialData
                      ? "Update Staff"
                      : "Register Staff"}
                </button>
              )}
            </div>

            <div className="staff-staffform-form-actions">
              <button
                type="button"
                className="btn staff-staffform-btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Note about auto-generated password (only for new staff) */}
          {!initialData && (
            <div className="form-note">
              <p className="text-muted small">
                <strong>Note:</strong> A username and secure password will be
                auto-generated for the staff member. The password will be sent
                to their email address.
              </p>
            </div>
          )}

          {/* Note for edit mode */}
          {initialData && (
            <div className="form-note">
              <p className="text-muted small">
                <strong>Note:</strong> Only designation can be updated. For
                other changes, contact administrator.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
