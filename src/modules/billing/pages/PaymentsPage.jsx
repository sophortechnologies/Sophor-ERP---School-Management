import React from "react";
import { usePayments } from "../hooks/usePayments";
import "./PaymentsPage.css";

export const PaymentsPage = () => {
  const { payments, loading, error } = usePayments();

  // Self-contained hidden iframe receipt printer
  const printReceipt = (p) => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    const dateStr =
      p.createdAt || p.paymentDate
        ? new Date(p.createdAt || p.paymentDate).toLocaleDateString()
        : new Date().toLocaleDateString();

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - #${p.id}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 20px; }
            .receipt-box { border: 2px solid #047857; border-radius: 8px; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 10px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #047857; font-size: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 16px; }
            .amount-banner { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h2>OFFICIAL FEE RECEIPT</h2>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">Receipt #: REC-${String(p.id).padStart(6, "0")} | Date: ${dateStr}</p>
            </div>
            <div class="grid">
              <div>Invoice #: <strong>INV-${String(p.billId).padStart(5, "0")}</strong></div>
              <div>Payment Method: <strong>${p.paymentMethod || "CASH"}</strong></div>
              <div>Ref #: <strong>${p.transactionId || "—"}</strong></div>
              <div>Status: <strong style="color: #16a34a;">CLEARED / PAID</strong></div>
            </div>
            <div class="amount-banner">
              Amount Paid: ${Number(p.amount || 0).toLocaleString()} ETB
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 250);
  };

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1 className="payments-title">Fee Collection & Audit Transactions</h1>
        <p className="payments-subtitle">
          Review historical fee collections, transaction audit logs, and print
          official receipts.
        </p>
      </div>

      <div className="payments-card">
        <div className="payments-card-title">
          Transaction Records ({payments.length})
        </div>

        {error && <div className="payments-error-banner">{error}</div>}

        {loading ? (
          <div className="payments-empty-state">
            Loading payment transactions...
          </div>
        ) : payments.length === 0 ? (
          <div className="payments-empty-state">No payments collected yet.</div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Invoice #</th>
                <th>Amount (ETB)</th>
                <th>Method</th>
                <th>Reference #</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>REC-{String(p.id).padStart(6, "0")}</strong>
                  </td>
                  <td>INV-{String(p.billId).padStart(5, "0")}</td>
                  <td>
                    <strong style={{ color: "#16a34a" }}>
                      {Number(p.amount || 0).toLocaleString()} ETB
                    </strong>
                  </td>
                  <td>
                    <span className="payments-method-badge">
                      {p.paymentMethod || "CASH"}
                    </span>
                  </td>
                  <td>{p.transactionId || "—"}</td>
                  <td>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="payments-print-btn"
                      onClick={() => printReceipt(p)}
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
