import React, { useState, useEffect } from "react";
import { salaryStructureApi } from "../api/salaryStructure.api";
import "./SalaryStructurePage.css";

export const SalaryStructurePage = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeStaff, setActiveStaff] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    staff: null,
    targetState: false,
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [selectedUserId, setSelectedUserId] = useState("");
  const [basePay, setBasePay] = useState("");
  const [componentName, setComponentName] = useState("Basic Salary");
  const [componentType, setComponentType] = useState("EARNING");
  const [calculationType, setCalculationType] = useState("FIXED");
  const [componentValue, setComponentValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getStaffDisplayName = (staff) => {
    if (!staff) return "Employee";
    const directFullName =
      staff.fullName ||
      (staff.firstName || staff.lastName
        ? `${staff.firstName || ""} ${staff.lastName || ""}`.trim()
        : null);

    const userFullName =
      staff.user?.fullName ||
      (staff.user?.firstName || staff.user?.lastName
        ? `${staff.user?.firstName || ""} ${staff.user?.lastName || ""}`.trim()
        : null);

    return (
      directFullName ||
      userFullName ||
      staff.user?.name ||
      staff.name ||
      staff.user?.email ||
      staff.email ||
      `User #${staff.userId || staff.id}`
    );
  };
  const loadData = async () => {
    setLoading(true);
    try {
      const employees = await salaryStructureApi.getStaffMembers();
      const cachedMap = salaryStructureApi.getCachedStructures();

      const mapped = employees.map((emp) => {
        const uid = Number(emp.userId || emp.user?.id || emp.id);
        const struct =
          emp.salaryStructure ||
          emp.user?.salaryStructure ||
          cachedMap[String(uid)] ||
          null;

        return {
          ...emp,
          resolvedUserId: uid,
          salaryStructure:
            struct && (struct.id || struct.basePay !== undefined)
              ? struct
              : null,
        };
      });

      setStaffData(mapped);
    } catch (err) {
      console.error("Failed to load staff structures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openGeneralCreateModal = () => {
    setErrorMessage("");
    setIsEditing(false);
    setActiveStaff(null);

    const unconfigured = staffData.find((s) => !s.salaryStructure);
    const defaultStaff = unconfigured || staffData[0];

    setSelectedUserId(defaultStaff ? String(defaultStaff.resolvedUserId) : "");
    setBasePay("");
    setComponentName("Basic Salary");
    setComponentType("EARNING");
    setCalculationType("FIXED");
    setComponentValue("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openSpecificCreateModal = (staffItem) => {
    setErrorMessage("");
    setIsEditing(false);
    setActiveStaff(staffItem);
    setSelectedUserId(String(staffItem.resolvedUserId));

    setBasePay("");
    setComponentName("Basic Salary");
    setComponentType("EARNING");
    setCalculationType("FIXED");
    setComponentValue("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (staffItem) => {
    const struct = staffItem.salaryStructure;
    if (!struct) return;

    setErrorMessage("");
    setIsEditing(true);
    setActiveStaff(staffItem);
    setSelectedUserId(String(staffItem.resolvedUserId));
    setBasePay(String(struct.basePay ?? ""));
    setIsActive(Boolean(struct.isActive ?? true));

    const firstComp = struct.components?.[0] || {};
    setComponentName(firstComp.name || "Basic Salary");
    setComponentType(firstComp.type || "EARNING");
    setCalculationType(firstComp.calculationType || "FIXED");
    setComponentValue(String(firstComp.value ?? struct.basePay ?? ""));

    setIsModalOpen(true);
  };

  const promptToggleActive = (staffItem) => {
    const struct = staffItem.salaryStructure;
    if (!struct) return;

    setConfirmModal({
      isOpen: true,
      staff: staffItem,
      targetState: !struct.isActive,
    });
  };

  const confirmToggleActive = async () => {
    const { staff, targetState } = confirmModal;
    const struct = staff?.salaryStructure;
    if (!struct) return;

    setConfirmModal({ isOpen: false, staff: null, targetState: false });

    try {
      const updated = await salaryStructureApi.toggleStructureActive(
        struct.id || 1,
        targetState,
        struct.basePay,
        staff.resolvedUserId,
      );

      setStaffData((prev) =>
        prev.map((s) =>
          s.id === staff.id
            ? {
                ...s,
                salaryStructure: {
                  ...s.salaryStructure,
                  isActive: targetState,
                  ...(updated || {}),
                },
              }
            : s,
        ),
      );
    } catch (err) {
      const msg = err.response?.data?.message;
      setAlertModal({
        isOpen: true,
        title: "Status Update Failed",
        message: Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to update salary status.",
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedUserId || !basePay || !componentValue) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      let savedRecord = null;
      const targetUserId = Number(selectedUserId);

      if (isEditing && activeStaff?.salaryStructure) {
        savedRecord = await salaryStructureApi.updateSalaryStructure(
          activeStaff.salaryStructure.id || 1,
          {
            basePay: Number(basePay),
            isActive,
            componentName,
            componentType,
            calculationType,
            componentValue: Number(componentValue),
          },
          targetUserId,
        );

        setStaffData((prev) =>
          prev.map((s) =>
            s.id === activeStaff.id
              ? {
                  ...s,
                  salaryStructure: {
                    ...s.salaryStructure,
                    basePay: Number(basePay),
                    isActive,
                    ...(savedRecord || {}),
                  },
                }
              : s,
          ),
        );
      } else {
        savedRecord = await salaryStructureApi.createSalaryStructure({
          userId: targetUserId,
          basePay: Number(basePay),
          isActive,
          componentName,
          componentType,
          calculationType,
          componentValue: Number(componentValue),
        });

        // Update state immediately without running loadData()
        setStaffData((prev) =>
          prev.map((s) =>
            Number(s.resolvedUserId) === targetUserId
              ? {
                  ...s,
                  salaryStructure: savedRecord,
                }
              : s,
          ),
        );
      }

      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message;
      setErrorMessage(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to save salary structure to database.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="payroll-page-container">
      <div className="payroll-page-header">
        <h1 className="payroll-page-title">Salary Structures & Components</h1>
        <p className="payroll-page-subtitle">
          Configure earnings, deductions, and tax components for staff.
        </p>
      </div>

      <div className="payroll-page-content">
        <div className="payroll-card">
          <div className="payroll-card-title">
            <span>Staff Salary Configuration ({staffData.length})</span>
            <button
              type="button"
              onClick={openGeneralCreateModal}
              className="payroll-action-btn"
            >
              + Add Structure
            </button>
          </div>

          {loading ? (
            <p className="payroll-loading">
              Loading employees and salary records...
            </p>
          ) : staffData.length === 0 ? (
            <p className="payroll-loading">
              No employee records found in the database.
            </p>
          ) : (
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Designation / Role</th>
                  <th>User ID</th>
                  <th>Base Pay</th>
                  <th>Status</th>
                  <th className="payroll-table-actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => {
                  const name = getStaffDisplayName(staff);
                  const struct = staff.salaryStructure;
                  const isConfigured = Boolean(
                    struct && (struct.id || struct.basePay !== undefined),
                  );
                  const isCurrentlyActive = Boolean(struct?.isActive);

                  return (
                    <tr key={staff.id}>
                      <td>
                        <strong>{name}</strong>
                      </td>
                      <td>{staff.designation || staff.role || "Staff"}</td>
                      <td>User #{staff.resolvedUserId}</td>
                      <td>{isConfigured ? `${struct.basePay} ETB` : "—"}</td>
                      <td>
                        {!isConfigured ? (
                          <span className="payroll-badge payroll-badge-pending">
                            PENDING
                          </span>
                        ) : isCurrentlyActive ? (
                          <span className="payroll-badge payroll-badge-active">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="payroll-badge payroll-badge-deactivated">
                            DEACTIVATED
                          </span>
                        )}
                      </td>
                      <td className="payroll-table-actions-cell">
                        {isConfigured ? (
                          <div className="payroll-table-btn-group">
                            <button
                              type="button"
                              onClick={() => openEditModal(staff)}
                              className="payroll-edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => promptToggleActive(staff)}
                              className={
                                isCurrentlyActive
                                  ? "payroll-deactivate-btn"
                                  : "payroll-activate-btn"
                              }
                            >
                              {isCurrentlyActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openSpecificCreateModal(staff)}
                            className="payroll-action-btn payroll-action-btn-sm"
                          >
                            Set Salary
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal-card">
            <h3 className="payroll-modal-title">
              {isEditing
                ? `Edit Salary: ${getStaffDisplayName(activeStaff)}`
                : activeStaff
                  ? `Set Salary: ${getStaffDisplayName(activeStaff)}`
                  : "Create Salary Structure"}
            </h3>

            {errorMessage && (
              <div className="payroll-modal-error-banner">{errorMessage}</div>
            )}

            <form onSubmit={handleSave}>
              <div className="payroll-form-group">
                <label className="payroll-form-label">Employee</label>
                {activeStaff ? (
                  <div className="payroll-locked-employee">
                    {getStaffDisplayName(activeStaff)} (User ID:{" "}
                    {activeStaff.resolvedUserId})
                  </div>
                ) : (
                  <select
                    className="payroll-form-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    {staffData.map((staff) => (
                      <option key={staff.id} value={staff.resolvedUserId}>
                        {getStaffDisplayName(staff)} (User ID:{" "}
                        {staff.resolvedUserId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Base Pay (ETB) *</label>
                <input
                  type="number"
                  className="payroll-form-input"
                  value={basePay}
                  onChange={(e) => setBasePay(e.target.value)}
                  placeholder="e.g. 6000"
                  required
                />
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Component Name *</label>
                <input
                  className="payroll-form-input"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g. Basic Salary"
                  required
                />
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Component Type *</label>
                <select
                  className="payroll-form-select"
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                >
                  <option value="EARNING">EARNING</option>
                  <option value="DEDUCTION">DEDUCTION</option>
                </select>
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Calculation Type *</label>
                <input
                  className="payroll-form-input"
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value)}
                  placeholder="e.g. FIXED"
                  required
                />
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Component Value *</label>
                <input
                  type="number"
                  className="payroll-form-input"
                  value={componentValue}
                  onChange={(e) => setComponentValue(e.target.value)}
                  placeholder="e.g. 6000"
                  required
                />
              </div>

              <div className="payroll-checkbox-group">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  className="payroll-checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label
                  htmlFor="isActiveCheck"
                  className="payroll-checkbox-label"
                >
                  Is Active
                </label>
              </div>

              <div className="payroll-modal-actions">
                <button
                  type="button"
                  className="payroll-modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="payroll-modal-confirm-btn"
                >
                  {submitting
                    ? "Saving to DB..."
                    : isEditing
                      ? "Update Structure"
                      : "Save Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal-card payroll-modal-card-confirm">
            <h3 className="payroll-modal-title payroll-modal-title-confirm">
              {confirmModal.targetState
                ? "Activate Salary Structure"
                : "Deactivate Salary Structure"}
            </h3>
            <p className="payroll-modal-description">
              Are you sure you want to{" "}
              {confirmModal.targetState ? "activate" : "deactivate"} the salary
              structure for{" "}
              <strong>{getStaffDisplayName(confirmModal.staff)}</strong>?
            </p>
            <div className="payroll-modal-actions payroll-modal-actions-center">
              <button
                type="button"
                className="payroll-modal-cancel-btn"
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    staff: null,
                    targetState: false,
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className={`payroll-modal-confirm-btn ${confirmModal.targetState ? "payroll-btn-success" : "payroll-btn-danger"}`}
                onClick={confirmToggleActive}
              >
                {confirmModal.targetState
                  ? "Confirm Activation"
                  : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal-card payroll-modal-card-alert">
            <h3 className="payroll-modal-title payroll-modal-title-alert">
              {alertModal.title}
            </h3>
            <p className="payroll-modal-description">{alertModal.message}</p>
            <div className="payroll-modal-actions payroll-modal-actions-center">
              <button
                type="button"
                className="payroll-modal-confirm-btn"
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

export default SalaryStructurePage;
