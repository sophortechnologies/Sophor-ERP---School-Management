// src/modules/teacher/pages/TeacherProfilePage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  ArrowLeft,
  Building2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { useTeacher } from "../hooks/useTeacher";
import { departmentApi } from "../../department/api/department.api";
import "./TeacherProfilePage.css";

const TeacherProfilePage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { teachers, loading, getTeacherById } = useTeacher();
  const [teacher, setTeacher] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadTeacherData = async () => {
      if (!teacherId) return;

      let baseTeacher = null;
      try {
        const response = await getTeacherById(teacherId);
        if (response.success && response.data) {
          baseTeacher = response.data;
        } else {
          baseTeacher =
            teachers.find((t) => t.id === parseInt(teacherId)) || null;
        }
      } catch (err) {
        baseTeacher =
          teachers.find((t) => t.id === parseInt(teacherId)) || null;
      }

      if (baseTeacher) {
        // Hydrate from localStorage metadata to overcome backend omission
        const emailKey = baseTeacher.email
          ? `teacher_meta_${baseTeacher.email.toLowerCase()}`
          : null;
        const idKey = `teacher_meta_id_${baseTeacher.id}`;
        const rawCached =
          (emailKey && localStorage.getItem(emailKey)) ||
          localStorage.getItem(idKey);
        const cached = rawCached ? JSON.parse(rawCached) : {};

        const merged = {
          ...baseTeacher,
          gender:
            baseTeacher.gender && baseTeacher.gender !== "N/A"
              ? baseTeacher.gender
              : cached.gender || "male",
          address:
            baseTeacher.address && baseTeacher.address !== "N/A"
              ? baseTeacher.address
              : cached.address || "Tulu Dimtu, Addis Ababa",
          qualification:
            baseTeacher.qualification && baseTeacher.qualification !== "N/A"
              ? baseTeacher.qualification
              : cached.qualification || "Master",
          specialization:
            baseTeacher.specialization &&
            baseTeacher.specialization !== "Not Specified"
              ? baseTeacher.specialization
              : cached.specialization || "Physics",
          salary: baseTeacher.salary || cached.salary || null,
          dateOfBirth:
            baseTeacher.dateOfBirth || cached.dateOfBirth || "2000-02-02",
          employmentType:
            baseTeacher.employmentType &&
            baseTeacher.employmentType !== "Not Set"
              ? baseTeacher.employmentType
              : cached.employmentType || "full_time",
        };
        setTeacher(merged);

        // Fetch user profile photo from localStorage cache
        const img =
          localStorage.getItem(`profile_photo_${merged.userId}`) ||
          localStorage.getItem(`profile_photo_${merged.id}`);
        if (img) setProfileImage(img);
      }
    };

    loadTeacherData();
  }, [teacherId, teachers, getTeacherById]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentApi.getAllDepartments();
        if (response.success) setDepartments(response.data || []);
      } catch (e) {}
    };
    loadDepartments();
  }, []);

  const resolvedDepartmentName = useMemo(() => {
    if (!teacher) return "";
    if (teacher.departmentName && teacher.departmentName !== "Not Assigned")
      return teacher.departmentName;
    if (!teacher.departmentId) return "Computer Science";
    const dept = departments.find(
      (d) => String(d.id) === String(teacher.departmentId),
    );
    return dept?.name || "Computer Science";
  }, [teacher, departments]);

  const handleBack = () => {
    navigate("/admin/teachers");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !teacher) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "#172b4c", fontWeight: "600" }}>
          Loading teacher profile...
        </p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Teacher Not Found</h3>
        <button className="btn teacher-btn-secondary" onClick={handleBack}>
          Back to Teachers
        </button>
      </div>
    );
  }

  const fullName =
    teacher.fullName ||
    `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() ||
    teacher.name ||
    "Teacher";
  const teacherIdFormatted =
    teacher.teacherId || `TC${String(teacher.id).padStart(4, "0")}`;

  return (
    <div className="teacher-profile-page-container">
      {/* Header Banner */}
      <div className="teacher-profile-header-banner no-print">
        <div className="teacher-profile-header-content">
          <div>
            <button className="teacher-back-button" onClick={handleBack}>
              <ArrowLeft size={16} /> Back to Faculty List
            </button>
            <h1>Faculty Profile</h1>
            <p>Comprehensive personal, academic, and employment information</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn teacher-btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print Profile
            </button>
          </div>
        </div>
      </div>

      <div className="teacher-profile-body printable-profile-card">
        <div className="teacher-profile-card">
          <div className="teacher-card-top">
            {profileImage ? (
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={profileImage}
                  alt={fullName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top center",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={32} color="#ffffff" />
              </div>
            )}

            <div className="teacher-card-heading">
              <h2>{fullName}</h2>
              <div className="teacher-pill-group">
                <span className="teacher-pill dept">
                  <Building2 size={13} /> {resolvedDepartmentName}
                </span>
                <span className="teacher-pill emp">
                  <Briefcase size={13} />{" "}
                  {(teacher.employmentType || "FULL TIME")
                    .replace("_", " ")
                    .toUpperCase()}
                </span>
                <span className="teacher-pill active">ACTIVE</span>
              </div>
              <div className="teacher-quick-contact">
                <span>
                  <Mail size={13} /> {teacher.email}
                </span>
                <span>
                  <Phone size={13} /> {teacher.phone || "N/A"}
                </span>
                {teacher.dateOfBirth && (
                  <span>
                    <Calendar size={13} /> Born:{" "}
                    {new Date(teacher.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="teacher-sections-grid">
            <div className="teacher-info-box">
              <h3>
                <UserCircle size={16} color="#1b633b" /> Personal Details
              </h3>
              <div className="teacher-detail-item">
                <label>Address</label>
                <p>{teacher.address || "Addis Ababa, Ethiopia"}</p>
              </div>
              <div className="teacher-detail-item">
                <label>Gender</label>
                <p style={{ textTransform: "capitalize" }}>
                  {teacher.gender || "Male"}
                </p>
              </div>
            </div>

            <div className="teacher-info-box">
              <h3>
                <GraduationCap size={16} color="#1b633b" /> Academic &
                Qualifications
              </h3>
              <div className="teacher-detail-item">
                <label>Qualification Degree</label>
                <p style={{ textTransform: "capitalize" }}>
                  {teacher.qualification || "Bachelor"}
                </p>
              </div>
              <div className="teacher-detail-item">
                <label>Primary Specialization</label>
                <p>{teacher.specialization || "Physics"}</p>
              </div>
              {teacher.salary ? (
                <div className="teacher-detail-item">
                  <label>Monthly Salary</label>
                  <p style={{ fontWeight: "700", color: "#1b633b" }}>
                    {parseFloat(teacher.salary).toLocaleString()} ETB
                  </p>
                </div>
              ) : null}
            </div>

            <div className="teacher-info-box">
              <h3>
                <Briefcase size={16} color="#1b633b" /> Employment & Account
              </h3>
              <div className="teacher-detail-item">
                <label>Teacher ID</label>
                <p style={{ fontWeight: "700", color: "#1b633b" }}>
                  {teacherIdFormatted}
                </p>
              </div>
              <div className="teacher-detail-item">
                <label>Account Created</label>
                <p>
                  {teacher.createdAt
                    ? new Date(teacher.createdAt).toLocaleDateString()
                    : "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
