import React, { useState } from "react";
import { useEmployee } from "../hooks/useEmployee";
import { employeeApi } from "../api/employee.api";
import "./EmployeeListPage.css";

const EMPLOYMENT_TYPES = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "CONTRACT", label: "Contract" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "PROBATION", label: "Probation" },
  { value: "INTERN", label: "Intern" },
];

const EMPLOYEE_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "RETIRED", label: "Retired" },
  { value: "TERMINATED", label: "Terminated" },
];

export const EmployeeListPage = () => {
  const { employees, setEmployees, users, loading, error, refreshEmployees } =
    useEmployee();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    employeeId: null,
    name: "",
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [userId, setUserId] = useState("");
  const [designation, setDesignation] = useState("TEACHER");
  const [employmentType, setEmploymentType] = useState("PERMANENT");
  const [status, setStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const getEmployeeName = (emp) => {
    if (!emp) return "Employee";
    const directFullName =
      emp.fullName ||
      (emp.firstName || emp.lastName
        ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim()
        : null);

    const userFullName =
      emp.user?.fullName ||
      (emp.user?.firstName || emp.user?.lastName
        ? `${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`.trim()
        : null);

    return (
      directFullName ||
      userFullName ||
      emp.user?.name ||
      emp.name ||
      emp.user?.email ||
      emp.email ||
      `User #${emp.userId || emp.id}`
    );
  };

  const renderDepartmentName = (dept) => {
    if (!dept) return "General";
    if (typeof dept === "object") {
      return dept.name || dept.code || "General";
    }
    return String(dept);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedEmp(null);
    setFormError("");
    setUserId(users[0] ? String(users[0].id) : "");
    setDesignation("TEACHER");
    setEmploymentType("PERMANENT");
    setStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setIsEditing(true);
    setSelectedEmp(emp);
    setFormError("");
    setUserId(String(emp.userId));
    setDesignation(emp.designation || "TEACHER");
    setEmploymentType(emp.employmentType || "PERMANENT");
    setStatus(emp.status || "ACTIVE");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (isEditing && selectedEmp) {
        const updated = await employeeApi.updateEmployee(selectedEmp.id, {
          designation,
          employmentType,
          status,
        });

        setEmployees((prev) =>
          prev.map((item) =>
            item.id === selectedEmp.id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const created = await employeeApi.createEmployee({
          userId: Number(userId),
          designation,
          employmentType,
          status,
        });

        setEmployees((prev) => [...prev, created]);
      }

      setIsModalOpen(false);
      refreshEmployees();
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to save employee record.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (emp) => {
    const name = getEmployeeName(emp);
    setConfirmDeleteModal({
      isOpen: true,
      employeeId: emp.id,
      name,
    });
  };

  const confirmDelete = async () => {
    const { employeeId } = confirmDeleteModal;
    setConfirmDeleteModal({ isOpen: false, employeeId: null, name: "" });

    try {
      await employeeApi.deleteEmployee(employeeId);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Delete Failed",
        message: err.response?.data?.message || "Failed to delete employee.",
      });
    }
  };

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case "ACTIVE":
        return "employee-badge-active";
      case "ON_LEAVE":
        return "employee-badge-pending";
      default:
        return "employee-badge-inactive";
    }
  };

  return (
    <div className="employee-page-container">
      <div className="employee-page-header">
        <h1 className="employee-page-title">Employee Directory</h1>
        <p className="employee-page-subtitle">
          Manage staff profiles, designations, and system employment records.
        </p>
      </div>

      <div className="employee-page-content">
        {error && (
          <div className="employee-modal-error-banner employee-banner-flush">
            {error}
          </div>
        )}

        <div className="employee-card">
          <div className="employee-card-title">
            <span>Staff Records ({employees.length})</span>
            <button
              type="button"
              onClick={openCreateModal}
              className="employee-action-btn"
            >
              + Add Employee
            </button>
          </div>

          {loading ? (
            <p className="employee-loading">Loading employee list...</p>
          ) : employees.length === 0 ? (
            <p className="employee-loading">
              No employee records registered yet.
            </p>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>User ID</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Employment Type</th>
                  <th>Status</th>
                  <th className="employee-table-actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const name = getEmployeeName(emp);

                  return (
                    <tr key={emp.id}>
                      <td>
                        <strong>{name}</strong>
                      </td>
                      <td>User #{emp.userId}</td>
                      <td>{emp.designation || "Staff"}</td>
                      <td>{renderDepartmentName(emp.department)}</td>
                      <td>{emp.employmentType || "PERMANENT"}</td>
                      <td>
                        <span
                          className={`employee-badge ${getStatusBadgeClass(emp.status)}`}
                        >
                          {emp.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="employee-table-actions-cell">
                        <div className="employee-btn-group">
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            className="employee-edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete(emp)}
                            className="employee-delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="employee-modal-overlay">
          <div className="employee-modal-card">
            <h3 className="employee-modal-title">
              {isEditing ? "Edit Employee Record" : "Register Employee"}
            </h3>

            {formError && (
              <div className="employee-modal-error-banner">{formError}</div>
            )}

            <form onSubmit={handleSave}>
              {!isEditing && (
                <div className="employee-form-group">
                  <label className="employee-form-label">
                    Link User Account *
                  </label>
                  <select
                    className="employee-form-select"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  >
                    <option value="">Select a user account...</option>
                    {users.map((u) => {
                      const label =
                        u.fullName ||
                        (u.firstName || u.lastName
                          ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                          : null) ||
                        u.name ||
                        u.email ||
                        `User #${u.id}`;
                      return (
                        <option key={u.id} value={u.id}>
                          {label} (User #{u.id} - {u.role || "STAFF"})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="employee-form-group">
                <label className="employee-form-label">
                  Designation / Role *
                </label>
                <input
                  className="employee-form-input"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. TEACHER, Principal, Accountant"
                  required
                />
              </div>

              <div className="employee-form-group">
                <label className="employee-form-label">Employment Type *</label>
                <select
                  className="employee-form-select"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  required
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form-group">
                <label className="employee-form-label">Status *</label>
                <select
                  className="employee-form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  {EMPLOYEE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="employee-modal-confirm-btn"
                >
                  {submitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Employee"
                      : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {confirmDeleteModal.isOpen && (
        <div className="employee-modal-overlay">
          <div className="employee-modal-card employee-modal-card-dialog">
            <h3 className="employee-modal-title">Delete Employee Record</h3>
            <p className="employee-dialog-message">
              Are you sure you want to delete the employee record for{" "}
              <strong>{confirmDeleteModal.name}</strong>?
            </p>
            <div className="employee-modal-actions employee-modal-actions-center">
              <button
                type="button"
                className="employee-modal-cancel-btn"
                onClick={() =>
                  setConfirmDeleteModal({
                    isOpen: false,
                    employeeId: null,
                    name: "",
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="employee-delete-btn"
                onClick={confirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Alert Modal */}
      {alertModal.isOpen && (
        <div className="employee-modal-overlay">
          <div className="employee-modal-card employee-modal-card-dialog">
            <h3 className="employee-modal-title employee-modal-title-danger">
              {alertModal.title}
            </h3>
            <p className="employee-dialog-message">{alertModal.message}</p>
            <div className="employee-modal-actions employee-modal-actions-center">
              <button
                type="button"
                className="employee-modal-confirm-btn"
                onClick={() =>
                  setAlertModal({ isOpen: false, title: "", message: "" })
                }
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;
