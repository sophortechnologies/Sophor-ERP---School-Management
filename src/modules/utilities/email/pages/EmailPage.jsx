import React, { useState } from "react";
import { useEmail } from "../hooks/useEmail";
import { emailApi } from "../api/email.api";
import "./EmailPage.css";

export const EmailPage = () => {
  const { emails, loading, error, sendNewEmail, refreshEmails } = useEmail();

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Custom Modal States (Professional modal replacing browser window.confirm popups)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient || !subject || !message) return;

    setSending(true);
    const result = await sendNewEmail({
      recipient: recipient.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setSending(false);

    if (result.success !== false) {
      // Replaced browser alert with a clean inline notice or direct reset
      setRecipient("");
      setSubject("");
      setMessage("");
      refreshEmails();
    } else {
      alert(result.error || "Failed to dispatch email");
    }
  };

  const promptDeleteOne = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Email Log",
      message:
        "Are you sure you want to permanently delete this email dispatch log from the database?",
      onConfirm: async () => {
        try {
          await emailApi.deleteEmail(id);
          refreshEmails();
        } catch (err) {
          alert("Failed to delete email record.");
        }
        setModalConfig({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  const promptClearAll = () => {
    if (emails.length === 0) return;
    setModalConfig({
      isOpen: true,
      title: "Clear All Email History",
      message:
        "Are you sure you want to permanently clear all dispatch history records from the database?",
      onConfirm: async () => {
        try {
          const ids = emails.map((m) => m.id || m._id).filter(Boolean);
          await emailApi.clearAllEmails(ids);
          refreshEmails();
        } catch (err) {
          alert("Failed to clear history logs.");
        }
        setModalConfig({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  return (
    <div className="email-page-container">
      {/* Flush Banner Header matching Subject Module */}
      <div className="email-page-header">
        <h1 className="email-page-title">Email Notifications & Dispatch</h1>
        <p className="email-page-subtitle">
          Send direct messages via backend email service and manage dispatch
          records.
        </p>
      </div>

      {/* Content Area */}
      <div className="email-page-content">
        {error && <div className="email-error-banner">{error}</div>}

        <div className="email-page-grid">
          {/* Compose Form */}
          <div className="email-card">
            <h2 className="email-card-title">Compose Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="email-form-group">
                <label className="email-form-label">Recipient Email *</label>
                <input
                  type="email"
                  className="email-form-input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. user@example.com"
                  required
                />
              </div>

              <div className="email-form-group">
                <label className="email-form-label">Subject *</label>
                <input
                  className="email-form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  required
                />
              </div>

              <div className="email-form-group">
                <label className="email-form-label">Message Body *</label>
                <textarea
                  className="email-form-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message content here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="email-submit-btn"
              >
                {sending ? "Sending Email..." : "Send Email"}
              </button>
            </form>
          </div>

          {/* Dispatch History Card */}
          <div className="email-card">
            <div className="email-card-title">
              <span>Dispatch History</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "normal",
                  }}
                >
                  {emails.length} stored
                </span>
                {emails.length > 0 && (
                  <button
                    type="button"
                    onClick={promptClearAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading history logs...
              </p>
            ) : emails.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                No emails sent yet.
              </p>
            ) : (
              <ul className="email-history-list">
                {emails.map((mail, index) => {
                  const itemId = mail.id || mail._id || index;
                  const displayTo = String(
                    mail.recipient || mail.to || "Unknown",
                  );
                  const displaySubject = String(
                    mail.subject || mail.title || "",
                  );
                  const displayMsg = String(mail.message || mail.body || "");
                  const displayDate = mail.createdAt
                    ? String(mail.createdAt).split("T")[0]
                    : "Active";

                  return (
                    <li key={itemId} className="email-history-item">
                      <div className="email-history-content">
                        <div className="email-history-subject">
                          To: {displayTo}{" "}
                          {displaySubject ? `- ${displaySubject}` : ""}
                        </div>
                        <div className="email-history-msg">{displayMsg}</div>
                        <span className="email-history-meta">
                          Dispatched: {displayDate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => promptDeleteOne(itemId)}
                        className="email-delete-btn"
                        title="Permanently Delete Record"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Professional Enterprise Confirmation Modal */}
      {modalConfig.isOpen && (
        <div className="email-modal-overlay">
          <div className="email-modal-card">
            <h3 className="email-modal-title">{modalConfig.title}</h3>
            <p className="email-modal-text">{modalConfig.message}</p>
            <div className="email-modal-actions">
              <button
                type="button"
                className="email-modal-cancel-btn"
                onClick={() =>
                  setModalConfig({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="email-modal-confirm-btn"
                onClick={modalConfig.onConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPage;
