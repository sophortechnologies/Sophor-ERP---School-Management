import React, { useState, useEffect, useCallback } from "react";
import { useBills } from "../hooks/useBills";
import { billsApi } from "../api/bills.api";
import { billConfigApi } from "../api/billConfig.api";
import { paymentsApi } from "../api/payments.api";
import api from "@/api/axios";
import "./InvoicesPage.css";

export const InvoicesPage = () => {
  const { bills, setBills, loading, error, refreshBills } = useBills();

  const [configs, setConfigs] = useState([]);
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Cascading Selection State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [genData, setGenData] = useState({
    studentId: "",
    billConfigId: "",
    dueDate: "",
  });

  // Payment Recording State
  const [payData, setPayData] = useState({
    amount: "",
    paymentMethod: "CASH",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPrerequisites = useCallback(async () => {
    try {
      const [configsRes, classesRes, studentsRes, paymentsRes, sessionsRes] =
        await Promise.allSettled([
          billConfigApi.getAll(),
          api.get("/classes"),
          api.get("/students"),
          paymentsApi.getAll(),
          api.get("/academic-sessions"),
        ]);

      if (configsRes.status === "fulfilled") {
        setConfigs(Array.isArray(configsRes.value) ? configsRes.value : []);
      }
      if (classesRes.status === "fulfilled") {
        const data = classesRes.value.data?.data || classesRes.value.data || [];
        setClassList(Array.isArray(data) ? data : []);
      }
      if (studentsRes.status === "fulfilled") {
        const data =
          studentsRes.value.data?.data || studentsRes.value.data || [];
        setStudents(Array.isArray(data) ? data : []);
      }
      if (paymentsRes.status === "fulfilled") {
        setAllPayments(
          Array.isArray(paymentsRes.value) ? paymentsRes.value : [],
        );
      }
      if (sessionsRes.status === "fulfilled") {
        const data =
          sessionsRes.value.data?.data || sessionsRes.value.data || [];
        setAcademicSessions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Error fetching prerequisite data:", e);
    }
  }, []);

  useEffect(() => {
    fetchPrerequisites();
  }, [fetchPrerequisites]);

  // Extract all numeric IDs associated with a student record
  const getStudentIdSet = useCallback((s) => {
    if (!s) return new Set();
    const ids = [
      s.id,
      s.studentId,
      s.userId,
      s.studentProfileId,
      s.studentProfile?.id,
      s.user?.id,
    ]
      .filter((v) => v !== undefined && v !== null && !isNaN(Number(v)))
      .map((v) => Number(v));

    return new Set(ids);
  }, []);

  // Match bill's studentId with loaded student list
  const findStudentForBill = useCallback(
    (b) => {
      if (b.student && typeof b.student === "object") return b.student;
      return students.find((s) => getStudentIdSet(s).has(Number(b.studentId)));
    },
    [students, getStudentIdSet],
  );

  const getStudentDisplayName = (studentOrId) => {
    if (!studentOrId) return "—";
    let s = typeof studentOrId === "object" ? studentOrId : null;
    if (!s) {
      s = students.find((st) => getStudentIdSet(st).has(Number(studentOrId)));
    }
    if (!s) return `Student #${studentOrId}`;

    return (
      s.fullName ||
      (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : null) ||
      s.user?.fullName ||
      (s.user?.firstName
        ? `${s.user.firstName} ${s.user.lastName || ""}`.trim()
        : null) ||
      s.name ||
      `Student #${s.id}`
    );
  };

  const getClassName = (cid) => {
    const found = classList.find((c) => Number(c.id) === Number(cid));
    return found?.name || `Class #${cid}`;
  };

  // 1. Resolve Bill Fee Rate by student's class and fee type
  const getBillDisplayTotal = useCallback(
    (b) => {
      const studentObj = findStudentForBill(b);
      const studentClassId = Number(
        studentObj?.classId ||
          studentObj?.currentClassId ||
          studentObj?.class?.id ||
          studentObj?.enrollment?.classId ||
          0,
      );

      if (studentClassId > 0) {
        const classSpecificConfig = configs.find(
          (c) => Number(c.classId) === studentClassId,
        );
        if (classSpecificConfig && Number(classSpecificConfig.amount) > 0) {
          return Number(classSpecificConfig.amount);
        }
      }

      const directConfig = configs.find(
        (c) => Number(c.id) === Number(b.billConfigId || b.feeConfigId),
      );
      if (directConfig && Number(directConfig.amount) > 0) {
        return Number(directConfig.amount);
      }

      return Number(b.totalAmount || b.amount || 0);
    },
    [configs, findStudentForBill],
  );

  // 2. Resolve Actual Paid Amount
  const getBillPaid = useCallback(
    (b) => {
      const billPayments = allPayments.filter(
        (p) => Number(p.billId) === Number(b.id),
      );

      if (billPayments.length > 0) {
        return billPayments.reduce(
          (sum, p) => sum + Number(p.amountPaid || p.amount || 0),
          0,
        );
      }

      if (b.status === "PAID") return getBillDisplayTotal(b);
      return Number(b.paidAmount || 0);
    },
    [allPayments, getBillDisplayTotal],
  );

  // 3. Resolve Remaining Balance
  const getBillDisplayBalance = useCallback(
    (b) => {
      if (b.status === "PAID") return 0;
      const total = getBillDisplayTotal(b);
      const paid = getBillPaid(b);
      return Math.max(0, total - paid);
    },
    [getBillDisplayTotal, getBillPaid],
  );

  // Filter structures by selected class
  const availableConfigs = selectedClassId
    ? configs.filter(
        (c) => !c.classId || Number(c.classId) === Number(selectedClassId),
      )
    : configs;

  const selectedFeeConfig = configs.find(
    (c) => Number(c.id) === Number(genData.billConfigId),
  );

  // STRICT ID-ONLY FILTER: Eliminates duplicate bills while preserving distinct students
  const eligibleStudents = students.filter((s) => {
    const sClassId = Number(
      s.classId || s.currentClassId || s.class?.id || s.enrollment?.classId,
    );
    const sClassName = String(s.class?.name || s.className || "").trim();
    const selClass = String(selectedClassId).trim();

    if (selectedClassId) {
      const matchesById = sClassId === Number(selectedClassId);
      const matchesByName =
        selClass && sClassName.toLowerCase() === selClass.toLowerCase();
      if (!matchesById && !matchesByName) {
        return false;
      }
    }

    if (genData.billConfigId) {
      const studentIds = getStudentIdSet(s);

      const alreadyHasInvoice = bills.some((b) => {
        if (b.status === "CANCELLED") return false;
        const billStudentId = Number(
          b.studentId || b.student?.id || b.student?.userId,
        );
        return studentIds.has(billStudentId);
      });

      if (alreadyHasInvoice) return false;
    }

    return true;
  });

  // Calculate Due Date Boundaries
  const todayStr = new Date().toISOString().split("T")[0];
  const getSessionMaxDate = () => {
    if (!selectedFeeConfig) return "";
    if (selectedFeeConfig.dueDate) {
      return selectedFeeConfig.dueDate.split("T")[0];
    }
    const sessionMatch = academicSessions.find(
      (s) =>
        s.name === selectedFeeConfig.academicYear ||
        s.year === selectedFeeConfig.academicYear ||
        s.isCurrent ||
        s.status === "ACTIVE",
    );
    if (sessionMatch?.endDate) {
      return sessionMatch.endDate.split("T")[0];
    }
    return "";
  };

  const minDueDate = todayStr;
  const maxDueDate = getSessionMaxDate();

  const handleOpenGenerate = () => {
    setSelectedClassId("");
    setGenData({ studentId: "", billConfigId: "", dueDate: "" });
    setFormError("");
    setIsGenerateOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError("");

    const targetStudentId = Number(genData.studentId);
    if (!targetStudentId) {
      setFormError("Please select an eligible student.");
      return;
    }
    if (!genData.billConfigId) {
      setFormError("Please select a fee structure.");
      return;
    }

    // Enforce valid due date boundaries
    if (genData.dueDate) {
      if (genData.dueDate < minDueDate) {
        setFormError(
          "Due date cannot be in the past. Please select a valid future date.",
        );
        return;
      }
      if (maxDueDate && genData.dueDate > maxDueDate) {
        setFormError(
          `Due date cannot be outside the academic session window (maximum allowable date: ${maxDueDate}).`,
        );
        return;
      }
    }

    const chosenStudent = students.find((s) =>
      getStudentIdSet(s).has(targetStudentId),
    );
    const chosenStudentIds = getStudentIdSet(chosenStudent);

    const isDuplicate = bills.some((b) => {
      if (b.status === "CANCELLED") return false;
      const billStudentId = Number(
        b.studentId || b.student?.id || b.student?.userId,
      );
      return chosenStudentIds.has(billStudentId);
    });

    if (isDuplicate) {
      setFormError(
        "This student already has an active invoice. A student cannot be billed twice.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const newBill = await billsApi.create(genData);
      if (newBill) {
        setBills((prev) => [newBill, ...prev]);
      }
      setIsGenerateOpen(false);
      await Promise.all([refreshBills(), fetchPrerequisites()]);
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to generate invoice.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    const balance = getBillDisplayBalance(bill);

    setPayData({
      amount: String(balance),
      paymentMethod: "CASH",
    });
    setFormError("");
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    setFormError("");

    const balance = getBillDisplayBalance(selectedBill);
    const enteredAmount = Number(payData.amount);

    if (enteredAmount <= 0) {
      setFormError("Payment amount must be greater than 0 ETB.");
      return;
    }

    if (enteredAmount > balance) {
      setFormError(
        `Overpayment blocked: The payment amount cannot exceed the remaining balance of ${balance.toLocaleString()} ETB.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const resolvedStudentId = Number(
        selectedBill.studentId || selectedBill.student?.id,
      );

      await paymentsApi.recordPayment({
        studentId: resolvedStudentId,
        billId: selectedBill.id,
        amountPaid: enteredAmount,
        paymentMethod: payData.paymentMethod,
        paymentDate: new Date().toISOString(),
      });

      setIsPayModalOpen(false);
      await Promise.all([refreshBills(), fetchPrerequisites()]);
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to record payment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalBilled = bills.reduce((acc, b) => acc + getBillDisplayTotal(b), 0);
  const totalCollected = bills.reduce((acc, b) => acc + getBillPaid(b), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  return (
    <div className="billing-module-container">
      <div className="billing-hero-header">
        <h1 className="billing-hero-title">Student Invoices & Fee Billing</h1>
        <p className="billing-hero-subtitle">
          Track student invoices, view unpaid balances, and record tuition fee
          collections.
        </p>
      </div>

      <div className="billing-body-content">
        <div className="billing-metrics-row">
          <div className="billing-metric-card">
            <span className="billing-metric-label">Total Invoiced Amount</span>
            <span className="billing-metric-value">
              {totalBilled.toLocaleString()} ETB
            </span>
          </div>
          <div className="billing-metric-card">
            <span className="billing-metric-label">Total Collected Fees</span>
            <span className="billing-metric-value text-success">
              {totalCollected.toLocaleString()} ETB
            </span>
          </div>
          <div className="billing-metric-card">
            <span className="billing-metric-label">Outstanding Balance</span>
            <span className="billing-metric-value text-danger">
              {totalOutstanding.toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="billing-card">
          <div className="billing-card-header">
            <span className="billing-card-title">
              Invoices ({bills.length})
            </span>
            <button
              type="button"
              onClick={handleOpenGenerate}
              className="billing-btn-primary"
            >
              + Generate Invoice
            </button>
          </div>

          {error && <div className="billing-error-banner">{error}</div>}

          {loading ? (
            <div className="billing-empty-state">
              Loading student invoices...
            </div>
          ) : bills.length === 0 ? (
            <div className="billing-empty-state">
              No invoices generated yet. Click "+ Generate Invoice" to issue a
              student fee bill.
            </div>
          ) : (
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Fee Type / Head</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const displayTotal = getBillDisplayTotal(b);
                  const paid = getBillPaid(b);
                  const displayBal = getBillDisplayBalance(b);
                  const isSettled = b.status === "PAID" || displayBal === 0;

                  const statusClass = isSettled
                    ? "badge-paid"
                    : b.status === "PARTIAL"
                      ? "badge-partial"
                      : "badge-pending";

                  const displayStatus = isSettled
                    ? "PAID"
                    : b.status || "UNPAID";

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>
                          {b.billCode || `INV-${String(b.id).padStart(5, "0")}`}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {getStudentDisplayName(b.student || b.studentId)}
                        </strong>
                      </td>
                      <td>
                        <span className="billing-badge badge-type">
                          REGISTRATION
                        </span>
                      </td>
                      <td>
                        <strong>{displayTotal.toLocaleString()} ETB</strong>
                      </td>
                      <td className="text-success">
                        <strong>{paid.toLocaleString()} ETB</strong>
                      </td>
                      <td className={displayBal > 0 ? "text-danger" : ""}>
                        <strong>{displayBal.toLocaleString()} ETB</strong>
                      </td>
                      <td>
                        <span className={`billing-badge ${statusClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="billing-action-group">
                          {!isSettled ? (
                            <button
                              type="button"
                              className="billing-btn-collect"
                              onClick={() => openPaymentModal(b)}
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="billing-settled-text">
                              Settled
                            </span>
                          )}
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

      {/* Invoice Generation Modal */}
      {isGenerateOpen && (
        <div className="billing-modal-overlay">
          <div className="billing-modal-card">
            <h3 className="billing-modal-title">Generate Student Bill</h3>
            {formError && (
              <div className="billing-error-banner">{formError}</div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="billing-form-group">
                <label className="billing-form-label">
                  Step 1: Applicable Class / Grade *
                </label>
                <select
                  className="billing-form-select"
                  value={selectedClassId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setSelectedClassId(cid);
                    setGenData((prev) => ({
                      ...prev,
                      billConfigId: "",
                      studentId: "",
                    }));
                  }}
                >
                  <option value="">-- All Classes / Select to Filter --</option>
                  {classList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name || `Class #${cls.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="billing-form-group">
                <label className="billing-form-label">
                  Step 2: Fee Structure *
                </label>
                <select
                  required
                  className="billing-form-select"
                  value={genData.billConfigId}
                  onChange={(e) =>
                    setGenData({
                      ...genData,
                      billConfigId: e.target.value,
                      studentId: "",
                    })
                  }
                >
                  <option value="">
                    -- Select Configured Fee Structure --
                  </option>
                  {availableConfigs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.feeType} — {Number(c.amount).toLocaleString()} ETB (
                      {getClassName(c.classId)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedFeeConfig && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#166534",
                    marginBottom: "14px",
                  }}
                >
                  Selected Fee Rate:{" "}
                  <strong>
                    {Number(selectedFeeConfig.amount || 0).toLocaleString()} ETB
                  </strong>{" "}
                  ({selectedFeeConfig.feeType})
                </div>
              )}

              <div className="billing-form-group">
                <label className="billing-form-label">
                  Step 3: Select Student *{" "}
                  {genData.billConfigId &&
                    `(${eligibleStudents.length} eligible students)`}
                </label>
                {eligibleStudents.length > 0 ? (
                  <select
                    required
                    className="billing-form-select"
                    value={genData.studentId}
                    onChange={(e) =>
                      setGenData({ ...genData, studentId: e.target.value })
                    }
                  >
                    <option value="">-- Select Eligible Student --</option>
                    {eligibleStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getStudentDisplayName(s)} (Roll #{s.rollNumber || s.id}
                        )
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      padding: "12px",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#92400e",
                    }}
                  >
                    {genData.billConfigId
                      ? "All students in this class already have an active invoice."
                      : "Please select a fee structure first to view eligible students."}
                  </div>
                )}
              </div>

              {/* Due Date Input with Session Bounds */}
              <div className="billing-form-group">
                <label className="billing-form-label">
                  Due Date (Optional)
                  {maxDueDate && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginLeft: "6px",
                      }}
                    >
                      (Valid between today and {maxDueDate})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  min={minDueDate}
                  max={maxDueDate || undefined}
                  className="billing-form-input"
                  value={genData.dueDate}
                  onChange={(e) =>
                    setGenData({ ...genData, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="billing-modal-actions">
                <button
                  type="button"
                  className="billing-btn-cancel"
                  onClick={() => setIsGenerateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligibleStudents.length === 0}
                  className="billing-btn-confirm"
                >
                  {submitting ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      {isPayModalOpen && selectedBill && (
        <div className="billing-modal-overlay">
          <div className="billing-modal-card">
            <h3 className="billing-modal-title">
              Record Fee Payment:{" "}
              {selectedBill.billCode ||
                `INV-${String(selectedBill.id).padStart(5, "0")}`}
            </h3>
            {formError && (
              <div className="billing-error-banner">{formError}</div>
            )}

            <form onSubmit={handleRecordPayment}>
              <div className="billing-form-group">
                <label className="billing-form-label">
                  Payment Amount (ETB) * — Remaining Balance:{" "}
                  <strong>
                    {getBillDisplayBalance(selectedBill).toLocaleString()} ETB
                  </strong>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={getBillDisplayBalance(selectedBill)}
                  step="0.01"
                  className="billing-form-input"
                  value={payData.amount}
                  onChange={(e) =>
                    setPayData({ ...payData, amount: e.target.value })
                  }
                />
              </div>

              <div className="billing-form-group">
                <label className="billing-form-label">Payment Method *</label>
                <select
                  className="billing-form-select"
                  value={payData.paymentMethod}
                  onChange={(e) =>
                    setPayData({ ...payData, paymentMethod: e.target.value })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="billing-modal-actions">
                <button
                  type="button"
                  className="billing-btn-cancel"
                  onClick={() => setIsPayModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="billing-btn-confirm"
                >
                  {submitting ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
