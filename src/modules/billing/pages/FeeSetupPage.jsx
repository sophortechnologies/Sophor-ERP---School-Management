import React, { useState, useEffect } from "react";
import { useBillConfig } from "../hooks/useBillConfig";
import { billConfigApi } from "../api/billConfig.api";
import api from "@/api/axios";
import "./FeeSetupPage.css";

const FEE_TYPE_OPTIONS = [
  { value: "REGISTRATION", label: "Registration Fee" },
  { value: "TUITION", label: "Tuition Fee" },
  { value: "EXAM", label: "Examination Fee" },
  { value: "TRANSPORT", label: "Transportation Fee" },
  { value: "LIBRARY", label: "Library Fee" },
  { value: "LABORATORY", label: "Laboratory Fee" },
  { value: "SPORTS", label: "Sports Fee" },
  { value: "HOSTEL", label: "Hostel Fee" },
  { value: "DEVELOPMENT", label: "School Development Fee" },
  { value: "LATE_FEE", label: "Late Payment Fee" },
  { value: "OTHER", label: "Other Fee" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money (Telebirr/CBE)" },
  { value: "CARD", label: "Debit/Credit Card" },
  { value: "CHEQUE", label: "Cheque" },
];

export const FeeSetupPage = () => {
  const { configs, setConfigs, loading, error, refreshConfigs } =
    useBillConfig();

  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);

  const [formData, setFormData] = useState({
    feeType: "REGISTRATION",
    classId: "",
    amount: "",
    paymentMethodOptions: ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"],
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    api
      .get("/classes")
      .then((res) => {
        const classes = res.data?.data || res.data || [];
        setClassList(Array.isArray(classes) ? classes : []);
      })
      .catch(() => setClassList([]));
  }, []);

  const handleOpenAdd = () => {
    setEditingConfig(null);
    setFormData({
      feeType: "REGISTRATION",
      classId: classList[0]?.id ? String(classList[0].id) : "",
      amount: "",
      paymentMethodOptions: ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"],
      description: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cfg) => {
    setEditingConfig(cfg);
    setFormData({
      feeType: cfg.feeType || "REGISTRATION",
      classId: String(cfg.classId || ""),
      amount: String(cfg.amount || ""),
      paymentMethodOptions:
        Array.isArray(cfg.paymentMethodOptions) &&
        cfg.paymentMethodOptions.length > 0
          ? cfg.paymentMethodOptions
          : ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"],
      description: cfg.description || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleMethodToggle = (method) => {
    setFormData((prev) => {
      const exists = prev.paymentMethodOptions.includes(method);
      if (exists) {
        if (prev.paymentMethodOptions.length === 1) return prev;
        return {
          ...prev,
          paymentMethodOptions: prev.paymentMethodOptions.filter(
            (m) => m !== method,
          ),
        };
      } else {
        return {
          ...prev,
          paymentMethodOptions: [...prev.paymentMethodOptions, method],
        };
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    setPageMessage({ type: "", text: "" });

    try {
      await billConfigApi.delete(deleteTargetId);
      setConfigs((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null);
      setPageMessage({
        type: "success",
        text: "Fee structure removed successfully.",
      });
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const isFkError =
        err.response?.status === 500 ||
        (typeof serverMsg === "string" &&
          serverMsg.toLowerCase().includes("foreign key"));

      setDeleteTargetId(null);
      setPageMessage({
        type: "error",
        text: isFkError
          ? "Cannot delete this fee structure because active student invoices are linked to it. Please remove or settle the linked invoices first."
          : (Array.isArray(serverMsg) ? serverMsg.join(", ") : serverMsg) ||
            "Failed to delete fee configuration.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!editingConfig && !formData.classId) {
      setFormError("Please select a target class for this fee structure.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingConfig) {
        // Send only amount & paymentMethodOptions for update
        const updated = await billConfigApi.update(editingConfig.id, {
          amount: formData.amount,
          paymentMethodOptions: formData.paymentMethodOptions,
          description: formData.description,
        });
        setConfigs((prev) =>
          prev.map((c) =>
            c.id === editingConfig.id ? { ...c, ...updated } : c,
          ),
        );
        setPageMessage({
          type: "success",
          text: "Fee structure updated successfully.",
        });
      } else {
        const created = await billConfigApi.create(formData);
        if (created) {
          setConfigs((prev) => [created, ...prev]);
        }
        setPageMessage({
          type: "success",
          text: "New fee structure created successfully.",
        });
      }
      setIsModalOpen(false);
      refreshConfigs();
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Operation failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getClassName = (cid) => {
    const found = classList.find((c) => Number(c.id) === Number(cid));
    return found?.name || `Class #${cid}`;
  };

  return (
    <div className="fee-setup-page-container">
      <div className="fee-setup-hero-header">
        <h1 className="fee-setup-hero-title">Fee Setup & Structures</h1>
        <p className="fee-setup-hero-subtitle">
          Configure class tuition rates, examination fees, and allowed payment
          gateways.
        </p>
      </div>

      <div className="fee-setup-body-content">
        {pageMessage.text && (
          <div
            className={
              pageMessage.type === "success"
                ? "fee-setup-success-banner"
                : "fee-setup-error-banner"
            }
          >
            {pageMessage.text}
          </div>
        )}

        <div className="fee-setup-card">
          <div className="fee-setup-card-header">
            <span className="fee-setup-card-title">
              Configured Structures ({configs.length})
            </span>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="fee-setup-btn-primary"
            >
              + Add Structure
            </button>
          </div>

          {error && <div className="fee-setup-error-banner">{error}</div>}

          {loading ? (
            <div className="fee-setup-empty-state">
              Loading fee configurations...
            </div>
          ) : configs.length === 0 ? (
            <div className="fee-setup-empty-state">
              No fee structures configured yet. Click "+ Add Structure" to
              create one.
            </div>
          ) : (
            <table className="fee-setup-table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Applicable Class</th>
                  <th>Amount</th>
                  <th>Accepted Payment Methods</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((cfg) => (
                  <tr key={cfg.id}>
                    <td>
                      <span className="fee-setup-badge">{cfg.feeType}</span>
                    </td>
                    <td>
                      <strong>{getClassName(cfg.classId)}</strong>
                    </td>
                    <td>
                      <strong>
                        {Number(cfg.amount || 0).toLocaleString()} ETB
                      </strong>
                    </td>
                    <td>
                      {(cfg.paymentMethodOptions || []).map((m) => (
                        <span
                          key={m}
                          style={{
                            display: "inline-block",
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            marginRight: "4px",
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cfg)}
                        className="fee-setup-btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(cfg.id)}
                        className="fee-setup-btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fee-setup-modal-overlay">
          <div className="fee-setup-modal-card">
            <h3 className="fee-setup-modal-title">
              {editingConfig ? "Edit Fee Structure" : "New Fee Structure"}
            </h3>

            {formError && (
              <div className="fee-setup-error-banner">{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Fee Type: Locked in Edit Mode */}
              <div className="fee-setup-form-group">
                <label className="fee-setup-form-label">Fee Type *</label>
                {editingConfig ? (
                  <div
                    style={{
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {editingConfig.feeType}
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        marginLeft: "8px",
                        fontWeight: "400",
                      }}
                    >
                      (Structure type cannot be changed after creation)
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    className="fee-setup-form-select"
                    value={formData.feeType}
                    onChange={(e) =>
                      setFormData({ ...formData, feeType: e.target.value })
                    }
                  >
                    {FEE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Target Class: Locked in Edit Mode */}
              <div className="fee-setup-form-group">
                <label className="fee-setup-form-label">Target Class *</label>
                {editingConfig ? (
                  <div
                    style={{
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {getClassName(editingConfig.classId)}
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        marginLeft: "8px",
                        fontWeight: "400",
                      }}
                    >
                      (Target grade cannot be reassigned)
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    className="fee-setup-form-select"
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                  >
                    <option value="">-- Select Class --</option>
                    {classList.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name || `Class #${cls.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount: Editable */}
              <div className="fee-setup-form-group">
                <label className="fee-setup-form-label">Amount (ETB) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 700"
                  className="fee-setup-form-input"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              {/* Accepted Payment Methods: Editable */}
              <div className="fee-setup-form-group">
                <label className="fee-setup-form-label">
                  Accepted Payment Methods *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      style={{
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.paymentMethodOptions.includes(
                          pm.value,
                        )}
                        onChange={() => handleMethodToggle(pm.value)}
                      />
                      {pm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fee-setup-modal-actions">
                <button
                  type="button"
                  className="fee-setup-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="fee-setup-btn-confirm"
                >
                  {submitting
                    ? "Saving..."
                    : editingConfig
                      ? "Update Structure"
                      : "Create Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces browser popup) */}
      {deleteTargetId && (
        <div className="fee-setup-modal-overlay">
          <div className="fee-setup-modal-card" style={{ maxWidth: "420px" }}>
            <h3 className="fee-setup-modal-title" style={{ color: "#991b1b" }}>
              Delete Fee Structure
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.5",
                margin: "0 0 20px 0",
              }}
            >
              Are you sure you want to delete this fee configuration? This
              action cannot be undone.
            </p>
            <div className="fee-setup-modal-actions">
              <button
                type="button"
                className="fee-setup-btn-cancel"
                onClick={() => setDeleteTargetId(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="fee-setup-btn-delete"
                style={{ padding: "9px 18px", fontSize: "13.5px" }}
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeSetupPage;
