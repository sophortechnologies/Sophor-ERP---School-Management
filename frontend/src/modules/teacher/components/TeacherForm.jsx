// src/modules/teacher/components/TeacherForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { departmentApi } from "../../department/api/department.api";
import api from "../../../api/axios";
import "./TeacherForm.css";

const VALID_GENDERS = ["male", "female", "other"];
const VALID_QUALIFICATIONS = ["diploma", "bachelor", "master", "phd"];
const VALID_EMPLOYMENT_TYPES = ["full_time", "part_time", "contract"];

const sanitizeEnum = (val, validList, fallback) => {
  if (!val) return fallback;
  const clean = String(val).toLowerCase().trim().replace(/[\s-]/g, "_");
  return validList.includes(clean) ? clean : fallback;
};

const TeacherForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  specializations = [],
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    qualification: "bachelor",
    specialization: specializations.length > 0 ? specializations[0] : "Physics",
    employmentType: "full_time",
    dateOfJoining: new Date().toISOString().split("T")[0],
    salary: "",
    status: "active",
    emergencyContact: "",
    emergencyPhone: "",
    departmentId: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getActiveDepartments();
        if (res.success && res.data) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.warn("Could not load departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (initialData) {
      const cleanGender = sanitizeEnum(
        initialData.gender,
        VALID_GENDERS,
        "male",
      );
      const cleanQual = sanitizeEnum(
        initialData.qualification,
        VALID_QUALIFICATIONS,
        "bachelor",
      );
      const cleanEmp = sanitizeEnum(
        initialData.employmentType,
        VALID_EMPLOYMENT_TYPES,
        "full_time",
      );

      // Match department ID by ID OR by department name
      let matchedDeptId = initialData.departmentId || "";
      if (
        !matchedDeptId &&
        departments.length > 0 &&
        initialData.departmentName
      ) {
        const found = departments.find(
          (d) =>
            d.name.toLowerCase() ===
            String(initialData.departmentName).toLowerCase(),
        );
        if (found) matchedDeptId = found.id;
      }
      if (!matchedDeptId && departments.length > 0) {
        matchedDeptId = departments[0].id;
      }

      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        firstName: initialData.firstName || initialData.first_name || "",
        lastName: initialData.lastName || initialData.last_name || "",
        phone: initialData.phone || "",
        dateOfBirth: initialData.dateOfBirth
          ? initialData.dateOfBirth.split("T")[0]
          : "",
        gender: cleanGender,
        address:
          initialData.address && initialData.address !== "N/A"
            ? initialData.address
            : "",
        qualification: cleanQual,
        specialization:
          initialData.specialization &&
          initialData.specialization !== "Not Specified"
            ? initialData.specialization
            : specializations[0] || "Physics",
        employmentType: cleanEmp,
        dateOfJoining: initialData.dateOfJoining
          ? initialData.dateOfJoining.split("T")[0]
          : new Date().toISOString().split("T")[0],
        salary: initialData.salary || "",
        status: (initialData.status || "active").toLowerCase(),
        emergencyContact: initialData.emergencyContact || "",
        emergencyPhone: initialData.emergencyPhone || "",
        departmentId: matchedDeptId,
      });

      const cachedImg = localStorage.getItem(
        `profile_photo_${initialData.userId || initialData.id}`,
      );
      if (cachedImg) setProfileImagePreview(cachedImg);
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
        qualification: "bachelor",
        specialization:
          specializations.length > 0 ? specializations[0] : "Physics",
        employmentType: "full_time",
        dateOfJoining: new Date().toISOString().split("T")[0],
        salary: "",
        status: "active",
        emergencyContact: "",
        emergencyPhone: "",
        departmentId: departments[0]?.id || "",
      });
      setProfileImagePreview(null);
      setProfileImageFile(null);
    }
    setFormError("");
  }, [initialData, isOpen, departments, specializations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Photo file must be under 5MB");
      return;
    }

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProfileImagePreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const payload = {
        username: formData.username || formData.email.split("@")[0],
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        departmentId: parseInt(formData.departmentId),
        dateOfBirth: formData.dateOfBirth || null,
        gender: sanitizeEnum(formData.gender, VALID_GENDERS, "male"),
        address: formData.address ? formData.address.trim() : null,
        qualification: sanitizeEnum(
          formData.qualification,
          VALID_QUALIFICATIONS,
          "bachelor",
        ),
        specialization: formData.specialization || "Physics",
        employmentType: sanitizeEnum(
          formData.employmentType,
          VALID_EMPLOYMENT_TYPES,
          "full_time",
        ),
        dateOfJoining:
          formData.dateOfJoining || new Date().toISOString().split("T")[0],
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        status: (formData.status || "active").toLowerCase(),
        emergencyContact: formData.emergencyContact
          ? formData.emergencyContact.trim()
          : null,
        emergencyPhone: formData.emergencyPhone
          ? formData.emergencyPhone.trim()
          : null,
      };

      if (!initialData || formData.password) {
        payload.password = formData.password;
      }

      const result = initialData
        ? await onSubmit(initialData.id, payload)
        : await onSubmit(payload);

      if (result.success) {
        const returnedData = result.data || {};
        const userId =
          returnedData.userId ||
          returnedData.user?.id ||
          initialData?.userId ||
          initialData?.id;
        const teacherId =
          returnedData.teacherId || returnedData.id || initialData?.id;

        // Persist metadata locally so "View" and table never show "N/A"
        const metaObj = { ...payload, id: teacherId, userId };
        localStorage.setItem(
          `teacher_meta_${formData.email.toLowerCase()}`,
          JSON.stringify(metaObj),
        );
        if (teacherId) {
          localStorage.setItem(
            `teacher_meta_id_${teacherId}`,
            JSON.stringify(metaObj),
          );
        }

        // Upload Profile Photo if changed
        if (profileImageFile && userId) {
          const imgForm = new FormData();
          imgForm.append("photo", profileImageFile);
          try {
            await api.post(`/profile-photo/user/${userId}`, imgForm, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (imgErr) {
            console.warn("Backend photo upload failed:", imgErr.message);
          }
        }

        if (profileImagePreview && (userId || teacherId)) {
          localStorage.setItem(
            `profile_photo_${userId || teacherId}`,
            profileImagePreview,
          );
        }

        onClose();
      } else {
        setFormError(
          result.error || result.message || "Failed to save teacher.",
        );
      }
    } catch (err) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="teacher-teacherform-teacher-form-modal">
      <div
        className="teacher-teacherform-modal-overlay"
        onClick={onClose}
      ></div>
      <div className="teacher-teacherform-modal-content">
        <div className="teacher-teacherform-modal-header">
          <h2>
            <User size={20} />
            {initialData ? "Edit Teacher Profile" : "Register New Teacher"}
          </h2>
          <button className="teacher-teacherform-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div
            style={{
              margin: "0 24px 16px 24px",
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "0 24px 20px 24px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "2px solid #1b633b",
                flexShrink: 0,
              }}
            >
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={32} color="#64748b" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#172b4c",
                  marginBottom: "4px",
                }}
              >
                Profile Photo
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  Upload Photo
                </button>
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImagePreview(null);
                      setProfileImageFile(null);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#fef2f2",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#dc2626",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="teacher-teacherform-form-sections">
            {/* Personal Details */}
            <div className="teacher-teacherform-form-section">
              <h3>
                <User size={18} /> Personal Information
              </h3>
              <div className="teacher-teacherform-form-grid">
                <div className="teacher-teacherform-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First Name"
                  />
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last Name"
                  />
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="teacher@school.com"
                  />
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+251912345678"
                  />
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="teacher-teacherform-form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, Subcity, Street"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="teacher-teacherform-form-section">
              <h3>
                <Briefcase size={18} /> Professional Information
              </h3>
              <div className="teacher-teacherform-form-grid">
                <div className="teacher-teacherform-form-group">
                  <label>Department *</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Qualification *</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  >
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Specialization / Subject *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  >
                    {specializations.map((spec, i) => (
                      <option key={i} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Employment Type *</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Monthly Salary (ETB)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    min="0"
                  />
                </div>

                <div className="teacher-teacherform-form-group">
                  <label>Date of Joining</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="teacher-teacherform-form-actions">
            <button
              type="button"
              className="btn teacher-teacherform-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : initialData
                  ? "Update Teacher"
                  : "Register Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
