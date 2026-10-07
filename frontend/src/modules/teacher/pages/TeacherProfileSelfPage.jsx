// src/modules/teacher/pages/TeacherProfileSelfPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Award,
  DollarSign,
  CreditCard,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import api from "../../../api/axios";
import "./TeacherProfileSelfPage.css";

const TeacherProfileSelfPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTeacherProfile();
    loadProfilePhoto();
  }, [user]);

  const getBackendBaseUrl = () => {
    if (api.defaults?.baseURL && api.defaults.baseURL.startsWith("http")) {
      try {
        const parsed = new URL(api.defaults.baseURL);
        return `${parsed.protocol}//${parsed.host}`;
      } catch (e) {}
    }
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  };

  const loadProfilePhoto = async () => {
    const cachedPhoto = localStorage.getItem(`profile_photo_${user?.id}`);
    if (cachedPhoto) {
      setProfileImage(cachedPhoto);
      return;
    }

    try {
      const response = await api.get("/profile-photo/me/info");
      const photoPath =
        response.data?.data?.profileImage || response.data?.profileImage;

      if (photoPath && !photoPath.includes("undefined")) {
        const baseUrl = getBackendBaseUrl();
        const fullUrl = photoPath.startsWith("http")
          ? photoPath
          : `${baseUrl}${photoPath}`;
        setProfileImage(fullUrl);
      }
    } catch (error) {}
  };

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);

      // 1. Fetch user account profile
      let authUser = null;
      try {
        const authRes = await api.get("/auth/profile");
        authUser = authRes.data?.data || authRes.data;
      } catch (err) {
        console.error("Error fetching /auth/profile:", err);
      }

      // 2. Fetch teacher dashboard
      let teacherInfo = null;
      try {
        const dashRes = await api.get("/teacher/dashboard");
        teacherInfo = dashRes.data?.data?.teacher || dashRes.data?.teacher;
      } catch (err) {
        console.error("Error fetching /teacher/dashboard:", err);
      }

      // 3. Fetch teacher record using /teacher/:id
      let fullTeacher = null;
      if (teacherInfo?.id) {
        try {
          const tRes = await api.get(`/teacher/${teacherInfo.id}`);
          fullTeacher = tRes.data?.data || tRes.data;
        } catch (err) {
          console.error("Error fetching /teacher/:id:", err);
        }
      }

      // 4. Retrieve cached registration values if available
      const userKeyEmail = (authUser?.email || user?.email || "").toLowerCase();
      const userKeyUsername = (
        authUser?.username ||
        user?.username ||
        ""
      ).toLowerCase();

      const cachedRaw =
        localStorage.getItem(`teacher_profile_details_${userKeyEmail}`) ||
        localStorage.getItem(`teacher_profile_details_${userKeyUsername}`);
      const cachedData = cachedRaw ? JSON.parse(cachedRaw) : null;

      const firstName =
        authUser?.firstName ||
        fullTeacher?.first_name ||
        cachedData?.firstName ||
        teacherInfo?.name?.split(" ")[0] ||
        user?.firstName ||
        "";

      const lastName =
        authUser?.lastName ||
        fullTeacher?.last_name ||
        cachedData?.lastName ||
        teacherInfo?.name?.split(" ").slice(1).join(" ") ||
        user?.lastName ||
        "";

      const email =
        authUser?.email ||
        fullTeacher?.email ||
        cachedData?.email ||
        user?.email ||
        "";
      const phone =
        authUser?.phone || fullTeacher?.phone || cachedData?.phone || "";

      // Prioritize live backend values, then cached registration input
      const specialization =
        teacherInfo?.specialization ||
        fullTeacher?.specialization ||
        cachedData?.specialization ||
        null;

      const qualification =
        teacherInfo?.qualification ||
        fullTeacher?.qualification ||
        cachedData?.qualification ||
        null;

      const gender = fullTeacher?.gender || cachedData?.gender || null;
      const dateOfBirth =
        fullTeacher?.dateOfBirth || cachedData?.dateOfBirth || null;
      const address = fullTeacher?.address || cachedData?.address || null;
      const salary = fullTeacher?.salary || cachedData?.salary || null;

      setProfile({
        id: teacherInfo?.id || fullTeacher?.id,
        firstName,
        lastName,
        phone,
        email,
        department:
          teacherInfo?.department ||
          fullTeacher?.department ||
          cachedData?.department ||
          "Academic",
        specialization,
        qualification,
        dateOfBirth,
        gender,
        address,
        salary,
        createdAt: authUser?.createdAt || fullTeacher?.createdAt,
      });
    } catch (error) {
      console.error("Error setting teacher profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Image = uploadEvent.target.result;
      setProfileImage(base64Image);
      localStorage.setItem(`profile_photo_${user?.id}`, base64Image);
    };
    reader.readAsDataURL(file);

    setShowPhotoMenu(false);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploadingImage(true);
      await api.post("/profile-photo/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Backend photo upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploadingImage(true);
      setShowPhotoMenu(false);
      localStorage.removeItem(`profile_photo_${user?.id}`);
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await api.delete("/profile-photo/me");
    } catch (err) {
      console.error("Failed to delete photo on backend:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary) => {
    if (!salary || parseFloat(salary) === 0) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="teacher-teacherprofileselfpage-loading-container">
        <div className="teacher-teacherprofileselfpage-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    user?.username ||
    "Teacher";
  const hasValidPhoto = Boolean(profileImage);

  return (
    <div className="teacher-teacherprofileselfpage-teacher-profile-page">
      <div className="teacher-teacherprofileselfpage-profile-header">
        <div
          className="teacher-teacherprofileselfpage-profile-avatar-wrapper"
          ref={menuRef}
          style={{ position: "relative" }}
        >
          <div
            className="teacher-teacherprofileselfpage-profile-avatar"
            onClick={() => setShowPhotoMenu((prev) => !prev)}
            style={{ cursor: "pointer", position: "relative" }}
            title="Click to manage photo"
          >
            {hasValidPhoto ? (
              <img
                src={profileImage}
                alt="Profile"
                className="teacher-teacherprofileselfpage-avatar-img"
              />
            ) : (
              <div className="teacher-teacherprofileselfpage-avatar-placeholder">
                {profile?.firstName?.charAt(0) || fullName.charAt(0) || "T"}
                {profile?.lastName?.charAt(0) || ""}
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "#1b633b",
                borderRadius: "50%",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                color: "white",
              }}
            >
              <Camera size={15} />
            </div>
          </div>

          {showPhotoMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "8px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e2e8f0",
                zIndex: 100,
                width: "180px",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowPhotoMenu(false);
                }}
                disabled={uploadingImage}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#1e293b",
                  textAlign: "left",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Upload size={16} color="#1b633b" />
                <span>Upload New</span>
              </button>

              {hasValidPhoto && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={uploadingImage}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid #f1f5f9",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#dc2626",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Trash2 size={16} color="#dc2626" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </div>

        <div className="profile-title">
          <h1>My Profile</h1>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              marginTop: "4px",
              color: "#f8fafc",
            }}
          >
            {hasValidPhoto
              ? "View your personal and professional information"
              : fullName}
          </p>
        </div>
      </div>

      <div className="teacher-teacherprofileselfpage-profile-content">
        <div className="teacher-teacherprofileselfpage-info-section">
          <h3>Personal Information</h3>
          <div className="teacher-teacherprofileselfpage-info-grid">
            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <User size={14} /> Full Name
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {fullName}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Mail size={14} /> Email
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {profile?.email}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Phone size={14} /> Phone
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {profile?.phone || "Not provided"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Calendar size={14} /> Date of Birth
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {formatDate(profile?.dateOfBirth)}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <User size={14} /> Gender
              </span>
              <span
                className="teacher-teacherprofileselfpage-info-value"
                style={{ textTransform: "capitalize" }}
              >
                {profile?.gender || "Not specified"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <MapPin size={14} /> Address
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {profile?.address || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="teacher-teacherprofileselfpage-info-section">
          <h3>Professional Information</h3>
          <div className="teacher-teacherprofileselfpage-info-grid">
            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Briefcase size={14} /> Department
              </span>
              <span
                className="teacher-teacherprofileselfpage-info-value"
                style={{ textTransform: "capitalize" }}
              >
                {profile?.department || "Academic"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Briefcase size={14} /> Specialization
              </span>
              <span
                className="teacher-teacherprofileselfpage-info-value"
                style={{ textTransform: "capitalize" }}
              >
                {profile?.specialization || "Not Assigned"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <Award size={14} /> Qualification
              </span>
              <span
                className="teacher-teacherprofileselfpage-info-value"
                style={{ textTransform: "capitalize" }}
              >
                {profile?.qualification || "Not Set"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <DollarSign size={14} /> Monthly Salary
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {formatSalary(profile?.salary)}
              </span>
            </div>
          </div>
        </div>

        <div className="teacher-teacherprofileselfpage-info-section">
          <h3>Account Information</h3>
          <div className="teacher-teacherprofileselfpage-info-grid">
            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                <CreditCard size={14} /> Username
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {user?.username || "N/A"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                Teacher ID
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {profile?.id
                  ? `TC${String(profile.id).padStart(4, "0")}`
                  : "N/A"}
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                Role
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                Teacher
              </span>
            </div>

            <div className="teacher-teacherprofileselfpage-info-item">
              <span className="teacher-teacherprofileselfpage-info-label">
                Account Created
              </span>
              <span className="teacher-teacherprofileselfpage-info-value">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileSelfPage;
