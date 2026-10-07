import React, { useState, useEffect } from "react";
import { usePayroll } from "../hooks/usePayroll";
import { payrollApi } from "../api/payroll.api";
import { salaryStructureApi } from "../api/salaryStructure.api";
import { calculateEthiopianPayroll } from "../utils/taxCalculator";
import "./PayrollPage.css";

const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const PayrollPage = () => {
  const { payrolls, setPayrolls, loading, error, refreshPayroll } =
    usePayroll();

  const [staffData, setStaffData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [individualSlip, setIndividualSlip] = useState(null);
  const [approvedPeriods, setApprovedPeriods] = useState([]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    run: null,
  });

  const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setApprovedPeriods(payrollApi.getApprovedPeriods());

    const fetchStaff = async () => {
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
        console.error("Failed to fetch staff members:", err);
      }
    };

    fetchStaff();
  }, []);

  const getStaffName = (userId) => {
    const match = staffData.find(
      (s) => Number(s.resolvedUserId) === Number(userId),
    );
    if (!match) return `User #${userId}`;
    return (
      match.fullName ||
      (match.firstName || match.lastName
        ? `${match.firstName || ""} ${match.lastName || ""}`.trim()
        : null) ||
      match.user?.fullName ||
      match.user?.name ||
      `User #${userId}`
    );
  };

  const getStaffRole = (userId) => {
    const match = staffData.find(
      (s) => Number(s.resolvedUserId) === Number(userId),
    );
    return match?.designation || match?.role || "Staff";
  };

  // Only consider staff with an active configured salary structure
  const activeConfiguredStaff = staffData.filter(
    (s) => s.salaryStructure && Boolean(s.salaryStructure.isActive),
  );

  const handleOpenModal = () => {
    setFormError("");
    setSelectedMonth(String(new Date().getMonth() + 1).padStart(2, "0"));
    setSelectedYear(String(new Date().getFullYear()));
    setIsModalOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (activeConfiguredStaff.length === 0) {
      setFormError(
        "Cannot generate payroll: 0 employees have an active salary configuration. Configure salaries in the Salary Structure module first.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const salaryMonthString = `${selectedYear}-${selectedMonth}`;
      const payload = { salaryMonth: salaryMonthString };

      await payrollApi.generatePayroll(payload);
      await refreshPayroll();
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to generate payroll run.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const promptApprove = (run) => {
    setConfirmModal({
      isOpen: true,
      run,
    });
  };

  const confirmApprove = async () => {
    const run = confirmModal.run;
    if (!run) return;

    setConfirmModal({ isOpen: false, run: null });

    try {
      await payrollApi.approvePayrollRun(run);
      setApprovedPeriods((prev) => [...prev, run.salaryMonth]);

      setPayrolls((prev) =>
        prev.map((p) =>
          p.salaryMonth === run.salaryMonth ? { ...p, status: "APPROVED" } : p,
        ),
      );

      if (selectedRun && selectedRun.salaryMonth === run.salaryMonth) {
        setSelectedRun((prev) => ({ ...prev, status: "APPROVED" }));
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const getRunDetails = (run) => {
    if (run.items && run.items.length > 0) {
      return run.items.map((item) => {
        const gross = Number(
          item.basicSalary || item.grossPay || item.amount || 0,
        );
        const { tax, pension, totalDeductions, netSalary } =
          calculateEthiopianPayroll(gross);
        return {
          userId: item.userId || item.staffId,
          name: getStaffName(item.userId || item.staffId),
          role: getStaffRole(item.userId || item.staffId),
          gross,
          tax,
          pension,
          deductions: totalDeductions,
          netSalary,
        };
      });
    }

    return activeConfiguredStaff.map((staff) => {
      const gross = Number(staff.salaryStructure.basePay) || 0;
      const { tax, pension, totalDeductions, netSalary } =
        calculateEthiopianPayroll(gross);
      return {
        userId: staff.resolvedUserId,
        name: getStaffName(staff.resolvedUserId),
        role: staff.designation || staff.role || "Staff",
        gross,
        tax,
        pension,
        deductions: totalDeductions,
        netSalary,
      };
    });
  };

  // Export payroll bank transfer file (CSV)
  const exportBankCSV = (run) => {
    const period = run.salaryMonth || "Payroll";
    const items = getRunDetails(run);

    const headers = [
      "Period",
      "Employee Name",
      "Designation / Role",
      "Gross Pay (ETB)",
      "Pension 7% (ETB)",
      "Income Tax (ETB)",
      "Total Deductions (ETB)",
      "Net Payable (ETB)",
    ];

    const rows = items.map((item) => [
      `"${period}"`,
      `"${item.name}"`,
      `"${item.role}"`,
      item.gross,
      item.pension,
      item.tax,
      item.deductions,
      item.netSalary,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Bank_Sheet_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean single-page print frame utility
  const printPayslip = (slip) => {
    if (!slip) return;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Payslip - ${slip.name} (${slip.period})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
              background: #ffffff;
            }
            .payslip-container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
            }
            .header {
              border-bottom: 2px solid #047857;
              padding-bottom: 12px;
              margin-bottom: 20px;
              text-align: center;
            }
            .header h2 {
              margin: 0 0 6px 0;
              color: #047857;
              font-size: 22px;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 0;
              color: #64748b;
              font-size: 13px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .meta-item span {
              color: #64748b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 14px;
            }
            th {
              text-align: left;
              padding: 10px 12px;
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              color: #475569;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #edf2f7;
            }
            .text-right {
              text-align: right;
            }
            .deduction {
              color: #dc2626;
            }
            .total-row {
              background-color: #f8fafc;
              font-weight: bold;
              font-size: 15px;
            }
            .total-amount {
              color: #16a34a;
              font-size: 17px;
            }
            .footer-notes {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px dashed #cbd5e1;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <div class="header">
              <h2>OFFICIAL SALARY PAYSLIP</h2>
              <p>Disbursement Period: ${slip.period}</p>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span>Employee Name:</span> <br/>
                <strong>${slip.name}</strong>
              </div>
              <div class="meta-item">
                <span>Designation / Role:</span> <br/>
                <strong>${slip.role}</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Gross Salary</td>
                  <td class="text-right">${slip.gross.toLocaleString()} ETB</td>
                </tr>
                <tr>
                  <td class="deduction">Employee Pension Contribution (7%)</td>
                  <td class="text-right deduction">- ${slip.pension.toLocaleString()} ETB</td>
                </tr>
                <tr>
                  <td class="deduction">Employment Income Tax</td>
                  <td class="text-right deduction">- ${slip.tax.toLocaleString()} ETB</td>
                </tr>
                <tr class="total-row">
                  <td>Net Payable Payout</td>
                  <td class="text-right total-amount">${slip.netSalary.toLocaleString()} ETB</td>
                </tr>
              </tbody>
            </table>

            <div class="footer-notes">
              <div>Status: <strong>PROCESSED & APPROVED</strong></div>
              <div>Generated electronically by School ERP</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 250);
  };

  return (
    <div className="payroll-page-container">
      <div className="payroll-page-header">
        <h1 className="payroll-page-title">HR & Payroll Management</h1>
        <p className="payroll-page-subtitle">
          Generate employee salary runs, review statutory taxes, and export bank
          payment sheets.
        </p>
      </div>

      <div className="payroll-page-content">
        {error && (
          <div className="payroll-modal-error-banner" style={{ margin: 0 }}>
            {error}
          </div>
        )}

        <div className="payroll-card">
          <div className="payroll-card-title">
            <span>Payroll Runs & History ({payrolls.length})</span>
            <button
              type="button"
              onClick={handleOpenModal}
              className="payroll-action-btn"
            >
              + Generate Payroll
            </button>
          </div>

          {loading ? (
            <p className="payroll-loading">Loading payroll records...</p>
          ) : payrolls.length === 0 ? (
            <p className="payroll-loading">No payroll records generated yet.</p>
          ) : (
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Eligible Staff</th>
                  <th>Total Gross</th>
                  <th>Total Deductions</th>
                  <th>Total Net Pay</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((run) => {
                  const period =
                    run.salaryMonth ||
                    (run.month && run.year ? `${run.year}-${run.month}` : "—");
                  const items = getRunDetails(run);

                  const totalGross = items.reduce(
                    (acc, curr) => acc + curr.gross,
                    0,
                  );
                  const totalDeductions = items.reduce(
                    (acc, curr) => acc + curr.deductions,
                    0,
                  );
                  const totalNet = items.reduce(
                    (acc, curr) => acc + curr.netSalary,
                    0,
                  );

                  const isApproved =
                    run.status === "APPROVED" ||
                    run.status === "PAID" ||
                    approvedPeriods.includes(run.salaryMonth);

                  return (
                    <tr key={run.id}>
                      <td>
                        <strong>{period}</strong>
                      </td>
                      <td>{items.length} active staff</td>
                      <td>{totalGross.toLocaleString()} ETB</td>
                      <td>{totalDeductions.toLocaleString()} ETB</td>
                      <td>
                        <strong>{totalNet.toLocaleString()} ETB</strong>
                      </td>
                      <td>
                        <span
                          className={`payroll-badge ${
                            isApproved
                              ? "payroll-badge-active"
                              : "payroll-badge-pending"
                          }`}
                        >
                          {isApproved ? "APPROVED" : "PENDING"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="payroll-edit-btn"
                            onClick={() =>
                              setSelectedRun({
                                ...run,
                                items,
                                totalGross,
                                totalDeductions,
                                totalNet,
                                isApproved,
                              })
                            }
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="payroll-action-btn"
                            style={{
                              padding: "5px 10px",
                              fontSize: "12px",
                              backgroundColor: "#0284c7",
                            }}
                            onClick={() => exportBankCSV(run)}
                            title="Download CSV bank sheet"
                          >
                            Export CSV
                          </button>
                          {!isApproved && (
                            <button
                              type="button"
                              className="payroll-action-btn"
                              style={{ padding: "5px 10px", fontSize: "12px" }}
                              onClick={() => promptApprove(run)}
                            >
                              Approve
                            </button>
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal-card" style={{ maxWidth: "450px" }}>
            <h3 className="payroll-modal-title">Approve Payroll Run</h3>
            <p
              style={{ margin: "16px 0", color: "#475569", lineHeight: "1.5" }}
            >
              Are you sure you want to approve payroll for period{" "}
              <strong>{confirmModal.run?.salaryMonth}</strong>? Once approved,
              records will be locked and ready for bank disbursement.
            </p>
            <div
              className="payroll-modal-actions"
              style={{ justifyContent: "flex-end", gap: "10px" }}
            >
              <button
                type="button"
                className="payroll-modal-cancel-btn"
                onClick={() => setConfirmModal({ isOpen: false, run: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="payroll-modal-confirm-btn"
                onClick={confirmApprove}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Payroll Breakdown Modal */}
      {selectedRun && (
        <div className="payroll-modal-overlay">
          <div
            className="payroll-modal-card"
            style={{ maxWidth: "900px", width: "95%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3 className="payroll-modal-title" style={{ margin: 0 }}>
                Payroll Breakdown: {selectedRun.salaryMonth}
              </h3>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="payroll-action-btn"
                  style={{
                    backgroundColor: "#0284c7",
                    padding: "5px 12px",
                    fontSize: "12px",
                  }}
                  onClick={() => exportBankCSV(selectedRun)}
                >
                  Export CSV
                </button>
                <span
                  className={`payroll-badge ${
                    approvedPeriods.includes(selectedRun.salaryMonth) ||
                    selectedRun.status === "APPROVED"
                      ? "payroll-badge-active"
                      : "payroll-badge-pending"
                  }`}
                >
                  {approvedPeriods.includes(selectedRun.salaryMonth) ||
                  selectedRun.status === "APPROVED"
                    ? "APPROVED"
                    : "PENDING"}
                </span>
              </div>
            </div>

            <p
              style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}
            >
              {selectedRun.items.length} active employee records with statutory
              tax and pension calculations.
            </p>

            <div
              style={{
                maxHeight: "360px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              <table className="payroll-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Basic Pay</th>
                    <th style={{ textAlign: "right" }}>Pension (7%)</th>
                    <th style={{ textAlign: "right" }}>Tax</th>
                    <th style={{ textAlign: "right" }}>Total Deductions</th>
                    <th style={{ textAlign: "right" }}>Net Pay</th>
                    <th style={{ textAlign: "center" }}>Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRun.items.map((emp) => (
                    <tr key={emp.userId}>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>{emp.role}</td>
                      <td style={{ textAlign: "right" }}>
                        {emp.gross.toLocaleString()} ETB
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {emp.pension.toLocaleString()} ETB
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {emp.tax.toLocaleString()} ETB
                      </td>
                      <td style={{ textAlign: "right", color: "#dc2626" }}>
                        {emp.deductions.toLocaleString()} ETB
                      </td>
                      <td style={{ textAlign: "right", color: "#16a34a" }}>
                        <strong>{emp.netSalary.toLocaleString()} ETB</strong>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="payroll-edit-btn"
                          style={{ padding: "3px 8px", fontSize: "11px" }}
                          onClick={() =>
                            setIndividualSlip({
                              ...emp,
                              period: selectedRun.salaryMonth,
                            })
                          }
                        >
                          Print Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
                padding: "12px 18px",
                background: "#f8fafc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <div>
                Total Gross:{" "}
                <strong>{selectedRun.totalGross.toLocaleString()} ETB</strong>
              </div>
              <div>
                Total Deductions:{" "}
                <strong style={{ color: "#dc2626" }}>
                  {selectedRun.totalDeductions.toLocaleString()} ETB
                </strong>
              </div>
              <div>
                Total Net Pay:{" "}
                <strong style={{ color: "#16a34a" }}>
                  {selectedRun.totalNet.toLocaleString()} ETB
                </strong>
              </div>
            </div>

            <div
              className="payroll-modal-actions"
              style={{ marginTop: "16px", justifyContent: "space-between" }}
            >
              <div>
                {!approvedPeriods.includes(selectedRun.salaryMonth) &&
                  selectedRun.status !== "APPROVED" && (
                    <button
                      type="button"
                      className="payroll-action-btn"
                      onClick={() => promptApprove(selectedRun)}
                    >
                      Approve This Run
                    </button>
                  )}
              </div>
              <button
                type="button"
                className="payroll-modal-cancel-btn"
                onClick={() => setSelectedRun(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Payslip Modal */}
      {individualSlip && (
        <div className="payroll-modal-overlay">
          <div
            className="payroll-modal-card"
            style={{ maxWidth: "550px", width: "90%" }}
          >
            <div
              style={{
                borderBottom: "2px solid #047857",
                paddingBottom: "12px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  margin: "0 0 4px 0",
                  color: "#047857",
                  fontSize: "20px",
                }}
              >
                OFFICIAL SALARY PAYSLIP
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                Payment Period: {individualSlip.period}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                Employee Name: <strong>{individualSlip.name}</strong>
              </div>
              <div>
                Designation: <strong>{individualSlip.role}</strong>
              </div>
            </div>

            <table className="payroll-table" style={{ margin: "0 0 16px 0" }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Gross Salary</td>
                  <td style={{ textAlign: "right" }}>
                    {individualSlip.gross.toLocaleString()} ETB
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#dc2626" }}>
                    Employee Pension Contribution (7%)
                  </td>
                  <td style={{ textAlign: "right", color: "#dc2626" }}>
                    - {individualSlip.pension.toLocaleString()} ETB
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#dc2626" }}>Employment Income Tax</td>
                  <td style={{ textAlign: "right", color: "#dc2626" }}>
                    - {individualSlip.tax.toLocaleString()} ETB
                  </td>
                </tr>
                <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                  <td>Net Payable Payout</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "#16a34a",
                      fontSize: "16px",
                    }}
                  >
                    {individualSlip.netSalary.toLocaleString()} ETB
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              className="payroll-modal-actions"
              style={{ justifyContent: "space-between" }}
            >
              <button
                type="button"
                className="payroll-action-btn"
                style={{ backgroundColor: "#047857" }}
                onClick={() => printPayslip(individualSlip)}
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                className="payroll-modal-cancel-btn"
                onClick={() => setIndividualSlip(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {isModalOpen && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal-card">
            <h3 className="payroll-modal-title">Generate Salary Run</h3>

            {formError && (
              <div className="payroll-modal-error-banner">{formError}</div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="payroll-form-group">
                <label className="payroll-form-label">Month *</label>
                <select
                  className="payroll-form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="payroll-form-group">
                <label className="payroll-form-label">Year *</label>
                <input
                  type="number"
                  className="payroll-form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="2020"
                  max="2035"
                  required
                />
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
                  {submitting ? "Processing..." : "Generate Run"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
