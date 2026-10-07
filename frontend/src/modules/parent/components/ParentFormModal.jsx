import React, { useState, useEffect } from "react";
import { RELATIONSHIP_TYPES } from "../constants";
import "./ParentFormModal.css";

export const ParentFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: "FATHER",
    occupation: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        relationship: initialData.relationship || "FATHER",
        occupation: initialData.occupation || "",
        address: initialData.address || "",
        password: "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        relationship: "FATHER",
        occupation: "",
        address: "",
        password: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="parent-modal-overlay">
      <div className="parent-modal-content">
        <div className="parent-modal-header">
          <h2 className="parent-modal-title">
            {initialData ? "Edit Parent Record" : "Register New Parent"}
          </h2>
          <button
            type="button"
            className="parent-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="parent-modal-body">
            <div className="parent-form-row">
              <div className="parent-form-group">
                <label className="parent-form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="parent-form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="parent-form-group">
                <label className="parent-form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="parent-form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="parent-form-row">
              <div className="parent-form-group">
                <label className="parent-form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="parent@example.com"
                  className="parent-form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="parent-form-group">
                <label className="parent-form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className="parent-form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {!initialData && (
              <div className="parent-form-group">
                <label className="parent-form-label">Initial Password *</label>
                <input
                  type="password"
                  name="password"
                  className="parent-form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required={!initialData}
                />
              </div>
            )}

            <div className="parent-form-row">
              <div className="parent-form-group">
                <label className="parent-form-label">Relationship Type</label>
                <select
                  name="relationship"
                  className="parent-form-select"
                  value={formData.relationship}
                  onChange={handleChange}
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="parent-form-group">
                <label className="parent-form-label">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  className="parent-form-input"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="parent-form-group">
              <label className="parent-form-label">Address</label>
              <input
                type="text"
                name="address"
                className="parent-form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="parent-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
