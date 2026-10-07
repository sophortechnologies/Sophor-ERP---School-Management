// src/modules/department/pages/DepartmentManagementPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Users,
  Download,
  Printer,
  Activity,
  X,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useDepartment } from "../hooks/useDepartment";
import { departmentApi } from "../api/department.api";
import DepartmentForm from "../components/DepartmentForm";
import DepartmentList from "../components/DepartmentList";
import "./DepartmentManagementPage.css";

const DepartmentManagementPage = () => {
  const {
    departments,
    statistics,
    loading,
    error,
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    loadStatistics,
  } = useDepartment();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  // View statistics modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    department: null,
    data: null,
    loading: false,
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    department: null,
    loading: false,
    error: "",
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const filteredDepartments = departments.filter((dept) => {
    if (!dept) return false;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (dept.name && dept.name.toLowerCase().includes(term)) ||
      (dept.code && dept.code.toLowerCase().includes(term)) ||
      (dept.description && dept.description.toLowerCase().includes(term));

    const matchesStatus =
      selectedStatus === "all" ||
      (dept.status &&
        dept.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDepartments: departments.length,
    activeDepartments: departments.filter((d) => d.isActive).length,
    inactiveDepartments: departments.filter((d) => !d.isActive).length,
    departmentsWithHead: departments.filter((d) => d.headId).length,
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowDepartmentForm(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowDepartmentForm(true);
  };

  const handleToggleStatus = async (department) => {
    if (!department || !department.id) return;
    const nextAction = department.isActive ? "deactivate" : "activate";

    const res = await departmentApi.updateDepartmentStatus(
      department.id,
      nextAction,
    );
    if (res.success) {
      refreshData();
    } else {
      alert(`Failed to ${nextAction} department: ${res.error || res.message}`);
    }
  };

  const handleOpenDelete = (department) => {
    setDeleteModal({ isOpen: true, department, loading: false, error: "" });
  };

  const handleConfirmDelete = async () => {
    const { department } = deleteModal;
    if (!department) return;

    setDeleteModal((prev) => ({ ...prev, loading: true, error: "" }));
    const result = await deleteDepartment(department.id);

    if (result.success) {
      setDeleteModal({
        isOpen: false,
        department: null,
        loading: false,
        error: "",
      });
      refreshData();
    } else {
      setDeleteModal((prev) => ({
        ...prev,
        loading: false,
        error:
          result.error ||
          "Cannot delete department with active subjects or assigned teachers. Deactivate it instead.",
      }));
    }
  };

  const handleViewStatistics = async (department) => {
    if (!department || !department.id) return;
    setViewModal({ isOpen: true, department, data: null, loading: true });

    try {
      const statsRes = await departmentApi.getDepartmentStatistics(
        department.id,
      );
      const detailRes = await departmentApi.getDepartmentById(department.id);
      setViewModal({
        isOpen: true,
        department: detailRes.data || department,
        data: statsRes.data,
        loading: false,
      });
    } catch (err) {
      setViewModal({ isOpen: true, department, data: null, loading: false });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Code", "Name", "Head ID", "Status", "Description", "Created"],
      ...filteredDepartments.map((dept) => [
        dept.code || "N/A",
        dept.name || "N/A",
        dept.headId || "N/A",
        dept.status || "N/A",
        dept.description || "N/A",
        dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `departments_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handlePrintTable = () => {
    window.print();
  };

  const refreshData = async () => {
    await loadDepartments();
    await loadStatistics();
  };

  if (loading && departments.length === 0) {
    return (
      <div className="department-departmentmanagementpage-loading-container">
        <div className="department-departmentmanagementpage-spinner"></div>
        <p>Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="department-departmentmanagementpage-department-management-page">
      {/* Header Matching Admin/Teacher Header Theme */}
      <div className="department-header-banner no-print">
        <div className="department-header-content">
          <div>
            <h1>Department Management</h1>
            <p>
              Manage academic departments, faculty assignments, and department
              heads
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn department-btn-secondary"
              onClick={refreshData}
            >
              Refresh
            </button>
            <button
              className="btn department-btn-primary"
              onClick={handleCreateDepartment}
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>
        </div>
      </div>

      <div className="department-page-body">
        {/* Stats Cards */}
        <div className="stats-grid no-print">
          <div className="stat-card">
            <div
              className="department-departmentmanagementpage-stat-icon"
              style={{ background: "#dbeafe" }}
            >
              <Building2 size={24} color="#3b82f6" />
            </div>
            <div className="department-departmentmanagementpage-stat-info">
              <p className="stat-label">Total Departments</p>
              <p className="stat-value">{stats.totalDepartments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="department-departmentmanagementpage-stat-icon"
              style={{ background: "#dcfce7" }}
            >
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="department-departmentmanagementpage-stat-info">
              <p className="stat-label">Active</p>
              <p className="stat-value">{stats.activeDepartments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="department-departmentmanagementpage-stat-icon"
              style={{ background: "#fef3c7" }}
            >
              <Users size={24} color="#f59e0b" />
            </div>
            <div className="department-departmentmanagementpage-stat-info">
              <p className="stat-label">With Head Teacher</p>
              <p className="stat-value">{stats.departmentsWithHead}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="department-departmentmanagementpage-stat-icon"
              style={{ background: "#fee2e2" }}
            >
              <XCircle size={24} color="#ef4444" />
            </div>
            <div className="department-departmentmanagementpage-stat-info">
              <p className="stat-label">Inactive</p>
              <p className="stat-value">{stats.inactiveDepartments}</p>
            </div>
          </div>
        </div>

        {/* Global Statistics Overview */}
        {statistics && (
          <div className="department-departmentmanagementpage-global-statistics no-print">
            <h3>
              <Activity size={20} />
              Faculty & Curriculum Overview
            </h3>
            <div className="department-departmentmanagementpage-statistics-grid">
              <div className="department-departmentmanagementpage-statistic-item">
                <div className="department-departmentmanagementpage-statistic-label">
                  Total Faculty Teachers
                </div>
                <div className="department-departmentmanagementpage-statistic-value">
                  {statistics.totalTeachers || 0}
                </div>
              </div>
              <div className="department-departmentmanagementpage-statistic-item">
                <div className="department-departmentmanagementpage-statistic-label">
                  Total Subjects
                </div>
                <div className="department-departmentmanagementpage-statistic-value">
                  {statistics.totalSubjects || 0}
                </div>
              </div>
              <div className="department-departmentmanagementpage-statistic-item">
                <div className="department-departmentmanagementpage-statistic-label">
                  Total Support Staff
                </div>
                <div className="department-departmentmanagementpage-statistic-value">
                  {statistics.totalStaff || 0}
                </div>
              </div>
              <div className="department-departmentmanagementpage-statistic-item">
                <div className="department-departmentmanagementpage-statistic-label">
                  Total Members
                </div>
                <div className="department-departmentmanagementpage-statistic-value">
                  {statistics.totalMembers || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter, Export and Print Bar */}
        <div className="department-departmentmanagementpage-action-bar no-print">
          <div className="department-departmentmanagementpage-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search departments by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="department-departmentmanagementpage-filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="department-departmentmanagementpage-filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              className="btn department-btn-secondary"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>

            <button
              className="btn department-btn-secondary"
              onClick={handlePrintTable}
            >
              <Printer size={16} />
              Print Table
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="department-departmentmanagementpage-content-card">
          <div className="card-header no-print">
            <h2>
              <Building2 size={20} />
              Departments
              <span className="department-departmentmanagementpage-count-badge">
                {filteredDepartments.length} of {departments.length}
              </span>
            </h2>
          </div>

          {filteredDepartments.length === 0 ? (
            <div className="department-departmentmanagementpage-empty-state">
              <Building2 size={48} />
              <h3>No Departments Found</h3>
              <p>Get started by adding your first department.</p>
              <button
                className="btn btn-primary"
                onClick={handleCreateDepartment}
              >
                <Plus size={18} />
                Add Department
              </button>
            </div>
          ) : (
            <DepartmentList
              departments={filteredDepartments}
              onEdit={handleEditDepartment}
              onDelete={handleOpenDelete}
              onViewStats={handleViewStatistics}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>

      {/* Department Edit/Create Modal */}
      {showDepartmentForm && (
        <DepartmentForm
          isOpen={showDepartmentForm}
          departments={departments}
          onClose={() => {
            setShowDepartmentForm(false);
            setEditingDepartment(null);
            refreshData();
          }}
          onSubmit={
            editingDepartment
              ? (id, data) => updateDepartment(id, data)
              : (data) => createDepartment(data)
          }
          initialData={editingDepartment}
        />
      )}

      {/* View Department Details Modal */}
      {viewModal.isOpen && (
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
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  color: "#172b4c",
                  fontWeight: "700",
                }}
              >
                {viewModal.department?.name} ({viewModal.department?.code})
              </h3>
              <button
                type="button"
                onClick={() =>
                  setViewModal({
                    isOpen: false,
                    department: null,
                    data: null,
                    loading: false,
                  })
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                margin: "0 0 16px 0",
              }}
            >
              {viewModal.department?.description || "No description provided."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #1b633b",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  Teachers
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#172b4c",
                  }}
                >
                  {viewModal.data?.totalTeachers ??
                    viewModal.department?.counts?.teachers ??
                    0}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #2563eb",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  Subjects
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#172b4c",
                  }}
                >
                  {viewModal.data?.totalSubjects ??
                    viewModal.department?.counts?.subjects ??
                    0}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  Staff Members
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#172b4c",
                  }}
                >
                  {viewModal.data?.totalStaff ??
                    viewModal.department?.counts?.staff ??
                    0}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: viewModal.department?.isActive
                      ? "#166534"
                      : "#991b1b",
                    marginTop: "2px",
                  }}
                >
                  {viewModal.department?.isActive ? "ACTIVE" : "INACTIVE"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setViewModal({
                    isOpen: false,
                    department: null,
                    data: null,
                    loading: false,
                  })
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              maxWidth: "440px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
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
                  background: "#fee2e2",
                  padding: "8px",
                  borderRadius: "50%",
                  color: "#dc2626",
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  color: "#172b4c",
                  fontWeight: "700",
                }}
              >
                Delete Department
              </h3>
            </div>

            <p
              style={{
                color: "#475569",
                fontSize: "14px",
                lineHeight: "1.5",
                margin: "0 0 16px 0",
              }}
            >
              Are you sure you want to permanently delete{" "}
              <strong>"{deleteModal.department?.name}"</strong> (
              {deleteModal.department?.code})?
            </p>

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
                className="btn department-btn-secondary"
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    department: null,
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
                disabled={deleteModal.loading}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {deleteModal.loading ? "Deleting..." : "Delete Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;
