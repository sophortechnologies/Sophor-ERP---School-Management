// src/modules/teacher/pages/TeacherManagementPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  Eye,
  Download,
  Printer,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTeacher } from "../hooks/useTeacher";
import TeacherForm from "../components/TeacherForm";
import { departmentApi } from "../../department/api/department.api";
import api from "../../../api/axios";
import "./TeacherManagementPage.css";

const TeacherManagementPage = () => {
  const navigate = useNavigate();
  const {
    teachers,
    specializations,
    loading,
    error,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    loadTeachers,
  } = useTeacher();

  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployment, setSelectedEmployment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Pagination state (Max 10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Custom Deactivate / Reactivate Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    teacher: null,
    assignments: [],
    loadingAssignments: false,
    loading: false,
    error: "",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getAllDepartments();
        if (res.success && res.data) setDepartments(res.data);
      } catch (err) {
        console.warn("Could not load departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  // Filter teachers based on search query and dropdown selections
  const filteredTeachers = teachers.filter((teacher) => {
    if (!teacher) return false;
    const term = searchTerm.toLowerCase();
    const fullName = `${teacher.firstName || teacher.first_name || ""} ${
      teacher.lastName || teacher.last_name || ""
    }`.toLowerCase();
    const email = (teacher.email || "").toLowerCase();
    const phone = (teacher.phone || "").toLowerCase();

    const matchesSearch =
      fullName.includes(term) || email.includes(term) || phone.includes(term);
    const matchesDept =
      selectedDepartment === "all" ||
      String(teacher.departmentId) === String(selectedDepartment) ||
      (teacher.departmentName &&
        departments.find((d) => String(d.id) === String(selectedDepartment))
          ?.name === teacher.departmentName);
    const matchesEmp =
      selectedEmployment === "all" ||
      teacher.employmentType === selectedEmployment;
    const matchesStatus =
      selectedStatus === "all" ||
      (teacher.status || "active").toLowerCase() ===
        selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesEmp && matchesStatus;
  });

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const stats = {
    total: teachers.length,
    active: teachers.filter(
      (t) => (t.status || "active").toLowerCase() === "active",
    ).length,
    fullTime: teachers.filter((t) => t.employmentType === "full_time").length,
    partTime: teachers.filter((t) => t.employmentType === "part_time").length,
  };

  const handleOpenDelete = async (teacher) => {
    // Check locally stored metadata first to get real status
    const metaId = localStorage.getItem(`teacher_status_${teacher.id}`);
    const currentStatus = metaId || teacher.status || "active";

    const teacherWithStatus = {
      ...teacher,
      status: currentStatus,
    };

    setDeleteModal({
      isOpen: true,
      teacher: teacherWithStatus,
      assignments: [],
      loadingAssignments: true,
      loading: false,
      error: "",
    });

    try {
      const res = await api.get(`/teacher/${teacher.id}/assignments`);
      const assignments = res.data?.assignments || [];
      setDeleteModal((prev) => ({
        ...prev,
        assignments,
        loadingAssignments: false,
      }));
    } catch (err) {
      console.warn("Could not check teacher assignments:", err.message);
      setDeleteModal((prev) => ({ ...prev, loadingAssignments: false }));
    }
  };

  const handleConfirmDelete = async () => {
    const { teacher, assignments } = deleteModal;
    if (!teacher) return;

    const isCurrentlyInactive =
      (teacher.status || "").toLowerCase() === "inactive";
    const nextStatus = isCurrentlyInactive ? "active" : "inactive";

    setDeleteModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      // 1. Unassign courses if deactivating
      if (!isCurrentlyInactive && assignments.length > 0) {
        for (const assign of assignments) {
          try {
            await api.delete(`/teacher/assignments/${assign.id}`);
          } catch (unassignErr) {
            console.warn(
              `Could not remove assignment ${assign.id}:`,
              unassignErr.message,
            );
          }
        }
      }

      // 2. Call backend PATCH
      await api.patch(`/teacher/${teacher.id}`, {
        status: nextStatus,
      });

      // 3. Persist status locally so table and modals reflect it immediately
      localStorage.setItem(`teacher_status_${teacher.id}`, nextStatus);
      const emailKey = teacher.email
        ? `teacher_meta_${teacher.email.toLowerCase()}`
        : null;
      if (emailKey) {
        const existingMeta = localStorage.getItem(emailKey);
        if (existingMeta) {
          const parsed = JSON.parse(existingMeta);
          parsed.status = nextStatus;
          localStorage.setItem(emailKey, JSON.stringify(parsed));
        }
      }

      setDeleteModal({
        isOpen: false,
        teacher: null,
        assignments: [],
        loadingAssignments: false,
        loading: false,
        error: "",
      });

      loadTeachers();
    } catch (err) {
      setDeleteModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update teacher status.",
      }));
    }
  };
  const handleViewTeacher = (teacher) => {
    navigate(`/admin/teachers/profile/${teacher.id}`);
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Teacher ID",
        "Name",
        "Department",
        "Specialization",
        "Email",
        "Phone",
        "Employment",
        "Status",
      ],
      ...filteredTeachers.map((t) => [
        t.teacherId || `TC${String(t.id).padStart(4, "0")}`,
        t.fullName || `${t.firstName} ${t.lastName}`,
        t.departmentName || "Academic",
        t.specialization || "Physics",
        t.email || "N/A",
        t.phone || "N/A",
        (t.employmentType || "FULL TIME").replace("_", " ").toUpperCase(),
        (t.status || "ACTIVE").toUpperCase(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teachers_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="teacher-management-page">
      {/* Header Banner */}
      <div className="teacher-header-banner no-print">
        <div className="teacher-header-content">
          <div>
            <h1>Teacher Management</h1>
            <p>Register, assign, and manage school faculty members</p>
          </div>
          <div className="header-actions">
            <button
              className="btn teacher-btn-secondary"
              onClick={() => loadTeachers()}
            >
              Refresh
            </button>
            <button
              className="btn teacher-btn-primary"
              onClick={() => {
                setEditingTeacher(null);
                setShowTeacherForm(true);
              }}
            >
              <Plus size={18} />
              Add Teacher
            </button>
          </div>
        </div>
      </div>

      <div className="teacher-page-body">
        {/* Metric Cards */}
        <div className="stats-grid no-print">
          <div className="stat-card">
            <div
              className="teacher-stat-icon"
              style={{ background: "#dbeafe" }}
            >
              <Users size={24} color="#3b82f6" />
            </div>
            <div className="teacher-stat-info">
              <p className="stat-label">Total Faculty</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="teacher-stat-icon"
              style={{ background: "#dcfce7" }}
            >
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="teacher-stat-info">
              <p className="stat-label">Active Teachers</p>
              <p className="stat-value">{stats.active}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="teacher-stat-icon"
              style={{ background: "#fef3c7" }}
            >
              <Briefcase size={24} color="#f59e0b" />
            </div>
            <div className="teacher-stat-info">
              <p className="stat-label">Full Time</p>
              <p className="stat-value">{stats.fullTime}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="teacher-stat-icon"
              style={{ background: "#e0e7ff" }}
            >
              <Briefcase size={24} color="#6366f1" />
            </div>
            <div className="teacher-stat-info">
              <p className="stat-label">Part Time</p>
              <p className="stat-value">{stats.partTime}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="teacher-action-bar no-print">
          <div className="teacher-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search teachers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="teacher-filter-group">
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedEmployment}
              onChange={(e) => {
                setSelectedEmployment(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              className="btn teacher-btn-secondary"
              onClick={handleExport}
            >
              <Download size={16} /> Export
            </button>
            <button
              className="btn teacher-btn-secondary"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print Directory
            </button>
          </div>
        </div>

        {/* Teachers Table Card */}
        <div className="teacher-content-card">
          <div className="teacher-print-header">
            <h2>SophorERP — Teacher Directory</h2>
            <p>
              Generated on {new Date().toLocaleDateString()} | Total Faculty:{" "}
              {filteredTeachers.length}
            </p>
          </div>

          <div className="table-responsive">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Contact</th>
                  <th>Employment</th>
                  <th>Status</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "#64748b",
                      }}
                    >
                      No teachers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTeachers.map((teacher) => {
                    const localStatus =
                      localStorage.getItem(`teacher_status_${teacher.id}`) ||
                      teacher.status ||
                      "active";

                    const isTeacherActive =
                      localStatus.toLowerCase() === "active";
                    const name =
                      teacher.fullName ||
                      `${teacher.firstName || ""} ${
                        teacher.lastName || ""
                      }`.trim() ||
                      teacher.name ||
                      "Teacher";
                    const tId =
                      teacher.teacherId ||
                      `TC${String(teacher.id).padStart(4, "0")}`;
                    const dept =
                      teacher.departmentName ||
                      teacher.department ||
                      "Computer Science";
                    const spec = teacher.specialization || "Physics";

                    return (
                      <tr key={teacher.id}>
                        <td style={{ fontWeight: "700", color: "#1b633b" }}>
                          {tId}
                        </td>
                        <td>
                          <strong
                            style={{ color: "#172b4c", fontSize: "14px" }}
                          >
                            {name}
                          </strong>
                        </td>
                        <td style={{ color: "#475569" }}>{dept}</td>
                        <td style={{ color: "#475569" }}>{spec}</td>
                        <td>
                          <div style={{ fontSize: "13px", color: "#1e293b" }}>
                            {teacher.phone || "N/A"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {teacher.email}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontWeight: "600",
                            }}
                          >
                            {(teacher.employmentType || "FULL TIME")
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "700",
                              background:
                                (teacher.status || "active").toLowerCase() ===
                                "active"
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                (teacher.status || "active").toLowerCase() ===
                                "active"
                                  ? "#166534"
                                  : "#991b1b",
                            }}
                          >
                            {(teacher.status || "ACTIVE").toUpperCase()}
                          </span>
                        </td>
                        <td className="no-print">
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              className="teacher-action-btn"
                              onClick={() => handleViewTeacher(teacher)}
                              title="View Full Profile"
                              style={{ color: "#2563eb" }}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              className="teacher-action-btn"
                              onClick={() => {
                                setEditingTeacher(teacher);
                                setShowTeacherForm(true);
                              }}
                              title="Edit Teacher"
                              style={{ color: "#475569" }}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              className="teacher-action-btn delete-btn"
                              onClick={() => handleOpenDelete(teacher)}
                              title="Deactivate / Reactivate"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Max 10 / page) */}
          {totalPages > 1 && (
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredTeachers.length)} of{" "}
                {filteredTeachers.length} teachers
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="btn teacher-btn-secondary"
                  style={{ padding: "6px 12px" }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontWeight: "600", color: "#172b4c" }}>
                  {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn teacher-btn-secondary"
                  style={{ padding: "6px 12px" }}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Add / Edit Modal */}
      {showTeacherForm && (
        <TeacherForm
          isOpen={showTeacherForm}
          onClose={() => {
            setShowTeacherForm(false);
            setEditingTeacher(null);
            loadTeachers();
          }}
          onSubmit={
            editingTeacher
              ? (id, data) => updateTeacher(id, data)
              : (data) => createTeacher(data)
          }
          initialData={editingTeacher}
          specializations={specializations}
        />
      )}

      {/* Deactivate / Reactivate Confirmation Modal */}
      {deleteModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            {(() => {
              const isInactive =
                (deleteModal.teacher?.status || "active").toLowerCase() ===
                "inactive";

              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        background: isInactive ? "#dcfce7" : "#fee2e2",
                        padding: "8px",
                        borderRadius: "50%",
                        color: isInactive ? "#166534" : "#dc2626",
                      }}
                    >
                      {isInactive ? (
                        <CheckCircle size={24} />
                      ) : (
                        <AlertTriangle size={24} />
                      )}
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        color: "#172b4c",
                        fontWeight: "700",
                      }}
                    >
                      {isInactive
                        ? "Reactivate Faculty Member"
                        : "Deactivate Faculty Member"}
                    </h3>
                  </div>

                  <p
                    style={{
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0 0 14px 0",
                    }}
                  >
                    {isInactive ? (
                      <>
                        <strong>
                          "
                          {deleteModal.teacher?.fullName ||
                            deleteModal.teacher?.name}
                          "
                        </strong>{" "}
                        is currently{" "}
                        <span style={{ color: "#dc2626", fontWeight: "700" }}>
                          INACTIVE
                        </span>
                        . Would you like to reactivate their account?
                      </>
                    ) : (
                      <>
                        Are you sure you want to deactivate{" "}
                        <strong>
                          "
                          {deleteModal.teacher?.fullName ||
                            deleteModal.teacher?.name}
                          "
                        </strong>
                        ?
                      </>
                    )}
                  </p>

                  {/* Contextual Status Info */}
                  {isInactive ? (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#166534",
                      }}
                    >
                      Reactivating will restore their faculty profile to{" "}
                      <strong>ACTIVE</strong> status and permit course
                      assignments.
                    </div>
                  ) : deleteModal.loadingAssignments ? (
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Checking assigned courses...
                    </p>
                  ) : deleteModal.assignments.length > 0 ? (
                    <div
                      style={{
                        background: "#fef3c7",
                        border: "1px solid #fde68a",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#92400e",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "6px" }}>
                        Active Teaching Assignments (
                        {deleteModal.assignments.length}):
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {deleteModal.assignments.map((a) => (
                          <li key={a.id}>
                            {a.subjectName || "Subject"} — {a.className}
                          </li>
                        ))}
                      </ul>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#b45309",
                        }}
                      >
                        Deactivating will automatically unassign these courses
                        and update their status to <strong>INACTIVE</strong>.
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "10px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      This teacher has no active course assignments. Their
                      status will be set to <strong>INACTIVE</strong>.
                    </div>
                  )}

                  {deleteModal.error && (
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginBottom: "16px",
                      }}
                    >
                      {deleteModal.error}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn teacher-btn-secondary"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: false,
                          teacher: null,
                          assignments: [],
                          loadingAssignments: false,
                          loading: false,
                          error: "",
                        })
                      }
                      disabled={deleteModal.loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={
                        deleteModal.loading || deleteModal.loadingAssignments
                      }
                      style={{
                        background: isInactive ? "#166534" : "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 18px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {deleteModal.loading
                        ? "Processing..."
                        : isInactive
                          ? "Reactivate Teacher"
                          : deleteModal.assignments.length > 0
                            ? "Unassign & Deactivate"
                            : "Deactivate Teacher"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementPage;
