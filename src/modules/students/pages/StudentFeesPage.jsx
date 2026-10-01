// src/modules/students/pages/StudentFeesPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DollarSign, FileText, CheckCircle } from "lucide-react";
import api from "../../../api/axios";

const StudentFeesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        let sId = user?.student_id;
        if (!sId) {
          const searchRes = await api.get("/students/search", {
            params: { q: user?.email || user?.username },
          });
          if (searchRes.data?.length > 0) {
            sId = searchRes.data[0].id;
          }
        }

        if (sId) {
          const res = await api.get(`/billing/bills/student/${sId}`);
          setBills(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error("Failed to load student fees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{ color: "#172b4c", fontSize: "1.8rem", margin: "0 0 8px 0" }}
        >
          Fee Invoices & Payments
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          View your current tuition fee balance, statements, and receipts.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading fee statements...
        </div>
      ) : bills.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "48px 24px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <CheckCircle
            size={48}
            color="#10b981"
            style={{ margin: "0 auto 12px auto" }}
          />
          <h3 style={{ color: "#172b4c", margin: "0 0 6px 0" }}>
            No Outstanding Bills
          </h3>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            You have no pending fee payments or invoices for the current
            academic session.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                color: "#475569",
              }}
            >
              <tr>
                <th style={{ padding: "14px 18px" }}>Invoice #</th>
                <th style={{ padding: "14px 18px" }}>Fee Type</th>
                <th style={{ padding: "14px 18px" }}>Amount</th>
                <th style={{ padding: "14px 18px" }}>Due Date</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td
                    style={{
                      padding: "14px 18px",
                      fontWeight: "600",
                      color: "#1b633b",
                    }}
                  >
                    {b.invoiceNumber || `INV-${b.id}`}
                  </td>
                  <td style={{ padding: "14px 18px", color: "#172b4c" }}>
                    {b.title || "Tuition Fee"}
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: "700" }}>
                    {b.amount} ETB
                  </td>
                  <td style={{ padding: "14px 18px", color: "#64748b" }}>
                    {b.dueDate
                      ? new Date(b.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: b.status === "PAID" ? "#f0fdf4" : "#fef2f2",
                        color: b.status === "PAID" ? "#166534" : "#b91c1c",
                      }}
                    >
                      {b.status || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentFeesPage;
