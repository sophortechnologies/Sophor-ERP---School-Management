import React, { useState, useEffect, useMemo, useCallback } from "react";
import communicationApi from "../api/communication.api";
import api from "@/api/axios";
import "./CommunicationPage.css";

const SENT_CACHE_KEY = "school_comm_sent_messages_v1";

export const CommunicationPage = () => {
  const currentUserId = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored)?.id || 1 : 1;
    } catch {
      return 1;
    }
  })();

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  // Directory state
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [composeData, setComposeData] = useState({
    message: "",
    messageType: "ANNOUNCEMENT",
    receiverId: "",
  });

  // Helper to read sent messages cache
  const getCachedSentMessages = () => {
    try {
      const raw = sessionStorage.getItem(SENT_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper to save sent messages cache
  const saveCachedSentMessages = (item) => {
    try {
      const current = getCachedSentMessages();
      const updated = [item, ...current.filter((m) => m.id !== item.id)];
      sessionStorage.setItem(SENT_CACHE_KEY, JSON.stringify(updated));
    } catch {
      // non-blocking
    }
  };

  const fetchAllMessages = useCallback(async () => {
    setLoading(true);
    try {
      const inboxRes = await communicationApi.getInbox(currentUserId);
      const inboxList = Array.isArray(inboxRes.data) ? inboxRes.data : [];
      const sentCached = getCachedSentMessages();

      // Combine inbox + sent items cleanly
      const map = new Map();
      [...inboxList, ...sentCached].forEach((m) => {
        if (m && m.id) {
          map.set(m.id, m);
        }
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setMessages(combined);

      setSelectedMessage((prev) => {
        if (prev) {
          const found = combined.find((m) => m.id === prev.id);
          return found || combined[0] || null;
        }
        return combined[0] || null;
      });
    } catch {
      setFeedback({ type: "error", text: "Failed to load messages." });
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAllMessages();

    Promise.allSettled([api.get("/users"), api.get("/students")]).then(
      ([usersRes, studentsRes]) => {
        if (usersRes.status === "fulfilled") {
          const d = usersRes.value.data?.data || usersRes.value.data || [];
          const arr = Array.isArray(d)
            ? d
            : Array.isArray(d?.users)
              ? d.users
              : [];
          setUsersList(arr);
        }
        if (studentsRes.status === "fulfilled") {
          const d =
            studentsRes.value.data?.data || studentsRes.value.data || [];
          const arr = Array.isArray(d)
            ? d
            : Array.isArray(d?.students)
              ? d.students
              : [];
          setStudentsList(arr);
        }
      },
    );
  }, [fetchAllMessages]);

  // Metric stats across all messages (including sent progress updates & homework)
  const stats = useMemo(() => {
    return {
      total: messages.length,
      unread: messages.filter(
        (m) => !m.isRead && Number(m.senderId) !== Number(currentUserId),
      ).length,
      announcements: messages.filter(
        (m) =>
          String(m.messageType || m.type || "").toUpperCase() ===
          "ANNOUNCEMENT",
      ).length,
      progressUpdates: messages.filter(
        (m) =>
          String(m.messageType || m.type || "").toUpperCase() ===
          "PROGRESS_UPDATE",
      ).length,
      homework: messages.filter(
        (m) =>
          String(m.messageType || m.type || "").toUpperCase() === "HOMEWORK",
      ).length,
      direct: messages.filter(
        (m) => String(m.messageType || m.type || "").toUpperCase() === "DIRECT",
      ).length,
    };
  }, [messages, currentUserId]);

  // Tab routing
  const filteredMessages = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return messages.filter(
          (m) => !m.isRead && Number(m.senderId) !== Number(currentUserId),
        );
      case "announcements":
        return messages.filter(
          (m) =>
            String(m.messageType || m.type || "").toUpperCase() ===
            "ANNOUNCEMENT",
        );
      case "progress":
        return messages.filter(
          (m) =>
            String(m.messageType || m.type || "").toUpperCase() ===
            "PROGRESS_UPDATE",
        );
      case "homework":
        return messages.filter(
          (m) =>
            String(m.messageType || m.type || "").toUpperCase() === "HOMEWORK",
        );
      case "direct":
        return messages.filter(
          (m) =>
            String(m.messageType || m.type || "").toUpperCase() === "DIRECT",
        );
      case "sent":
        return messages.filter(
          (m) => Number(m.senderId) === Number(currentUserId),
        );
      case "all":
      default:
        return messages;
    }
  }, [messages, activeTab, currentUserId]);

  // Unified directory pool
  const formattedRecipients = useMemo(() => {
    const list = [];

    studentsList.forEach((s) => {
      const targetId = s.userId || s.user?.id || s.id;
      const sName =
        [s.firstName, s.lastName].filter(Boolean).join(" ") ||
        s.name ||
        `Student #${s.id}`;
      const classInfo = s.class?.name ? ` • ${s.class.name}` : "";
      list.push({
        id: targetId,
        displayName: `${sName}${classInfo}`,
        name: sName,
        category: "Students",
        role: "STUDENT",
      });
    });

    usersList.forEach((u) => {
      const r = (
        typeof u?.role === "string" ? u.role : u?.role?.name || ""
      ).toUpperCase();
      const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ");
      const displayName =
        fullName || u?.username || u?.email || `User #${u?.id}`;

      let cat = "Staff & Teachers";
      if (r.includes("PARENT") || r.includes("GUARDIAN")) {
        cat = "Parents";
      } else if (r.includes("STUDENT")) {
        cat = "Students";
      }

      list.push({
        id: u.id,
        displayName: `${displayName} (${r || "USER"})`,
        name: displayName,
        category: cat,
        role: r,
      });
    });

    return list;
  }, [studentsList, usersList]);

  const targetRecipients = useMemo(() => {
    const type = composeData.messageType;
    if (type === "PROGRESS_UPDATE" || type === "HOMEWORK") {
      const relevant = formattedRecipients.filter(
        (r) => r.category === "Students" || r.category === "Parents",
      );
      return relevant.length > 0 ? relevant : formattedRecipients;
    }
    return formattedRecipients;
  }, [formattedRecipients, composeData.messageType]);

  const getSenderName = (msg) => {
    if (!msg) return "System";
    if (Number(msg.senderId) === Number(currentUserId)) return "You (Admin)";
    if (msg.sender?.firstName) {
      return `${msg.sender.firstName} ${msg.sender.lastName || ""}`.trim();
    }
    if (msg.sender?.profile?.firstName) {
      return `${msg.sender.profile.firstName} ${msg.sender.profile.lastName || ""}`.trim();
    }
    if (msg.sender?.email) return msg.sender.email;
    return "Administrator";
  };

  const getReceiverName = (msg) => {
    if (!msg || !msg.receiverId) return "All Users (Broadcast)";
    const found = formattedRecipients.find(
      (r) => Number(r.id) === Number(msg.receiverId),
    );
    if (found) return found.displayName;
    return `User #${msg.receiverId}`;
  };

  const handleSelect = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead && Number(msg.senderId) !== Number(currentUserId)) {
      try {
        await communicationApi.markAsRead(msg.id, currentUserId);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)),
        );
      } catch {
        // non-blocking
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await communicationApi.deleteMessage(deleteTargetId);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== deleteTargetId));
        // Also remove from cache
        try {
          const cached = getCachedSentMessages().filter(
            (m) => m.id !== deleteTargetId,
          );
          sessionStorage.setItem(SENT_CACHE_KEY, JSON.stringify(cached));
        } catch {
          // continue
        }

        if (selectedMessage?.id === deleteTargetId) {
          const rest = messages.filter((m) => m.id !== deleteTargetId);
          setSelectedMessage(rest[0] || null);
        }
        setFeedback({ type: "success", text: "Message deleted successfully." });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to delete message.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Error deleting message." });
    } finally {
      setDeleteTargetId(null);
      setDeleting(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.message.trim()) return;

    setSending(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = {
        message: composeData.message.trim(),
        messageType: composeData.messageType,
        senderId: currentUserId,
        ...(composeData.receiverId
          ? { receiverId: Number(composeData.receiverId) }
          : {}),
      };

      const res = await communicationApi.sendMessage(payload);
      if (res.success) {
        const targetObj = composeData.receiverId
          ? formattedRecipients.find(
              (r) => Number(r.id) === Number(composeData.receiverId),
            )
          : null;

        let successText = "Message sent successfully!";
        const recipientName = targetObj ? targetObj.name : "";

        if (composeData.messageType === "PROGRESS_UPDATE") {
          if (!targetObj) {
            successText =
              "Progress update broadcasted to all parents and students!";
          } else if (targetObj.category === "Parents") {
            successText = `Progress update sent directly to parent (${recipientName})!`;
          } else if (targetObj.category === "Students") {
            successText = `Progress update sent directly to student (${recipientName})!`;
          } else {
            successText = `Progress update delivered to ${recipientName}!`;
          }
        } else if (composeData.messageType === "HOMEWORK") {
          if (!targetObj) {
            successText = "Homework assignment broadcasted to class!";
          } else if (targetObj.category === "Students") {
            successText = `Homework assignment assigned directly to student (${recipientName})!`;
          } else if (targetObj.category === "Parents") {
            successText = `Homework assignment sent to parent (${recipientName})!`;
          } else {
            successText = `Homework assignment delivered to ${recipientName}!`;
          }
        } else if (composeData.messageType === "DIRECT") {
          successText = `Direct message delivered to ${recipientName || "user"}!`;
        } else {
          successText = "Announcement published successfully to all users!";
        }

        setFeedback({
          type: "success",
          text: successText,
        });

        // Add to active state and cache immediately so the counter updates right away
        const createdMessage = res.data?.id
          ? res.data
          : {
              id: Date.now(),
              message: payload.message,
              messageType: payload.messageType,
              senderId: currentUserId,
              receiverId: payload.receiverId || null,
              createdAt: new Date().toISOString(),
              isRead: true,
            };

        saveCachedSentMessages(createdMessage);

        setMessages((prev) => {
          const without = prev.filter((m) => m.id !== createdMessage.id);
          return [createdMessage, ...without];
        });
        setSelectedMessage(createdMessage);

        setIsComposeOpen(false);
        setComposeData({
          message: "",
          messageType: "ANNOUNCEMENT",
          receiverId: "",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to send message.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to send message." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comm-container">
      {/* Top Banner Header */}
      <div className="comm-header">
        <div className="comm-header-title">
          <h1>💬 Communication Center</h1>
          <p>Send messages, announcements, and progress updates</p>
        </div>
        <button
          type="button"
          className="comm-btn-new-msg"
          onClick={() => setIsComposeOpen(true)}
        >
          ✉️ New Message
        </button>
      </div>

      {feedback.text && (
        <div
          className={
            feedback.type === "success"
              ? "comm-banner-success"
              : "comm-banner-error"
          }
        >
          {feedback.text}
        </div>
      )}

      {/* Metric Cards (Updated dynamically) */}
      <div className="comm-stats-grid">
        <div className="comm-stat-card">
          <div className="comm-stat-icon icon-blue">✉</div>
          <div>
            <span className="comm-stat-label">TOTAL MESSAGES</span>
            <div className="comm-stat-val">{stats.total}</div>
          </div>
        </div>
        <div className="comm-stat-card">
          <div className="comm-stat-icon icon-green">👁️</div>
          <div>
            <span className="comm-stat-label">UNREAD</span>
            <div className="comm-stat-val">{stats.unread}</div>
          </div>
        </div>
        <div className="comm-stat-card">
          <div className="comm-stat-icon icon-amber">📢</div>
          <div>
            <span className="comm-stat-label">ANNOUNCEMENTS</span>
            <div className="comm-stat-val">{stats.announcements}</div>
          </div>
        </div>
        <div className="comm-stat-card">
          <div className="comm-stat-icon icon-purple">📈</div>
          <div>
            <span className="comm-stat-label">PROGRESS UPDATES</span>
            <div className="comm-stat-val">{stats.progressUpdates}</div>
          </div>
        </div>
      </div>

      {/* Complete Category Tab Navigation */}
      <div className="comm-tab-bar">
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          📁 All ({stats.total})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "unread" ? "active" : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          ✉️ Unread ({stats.unread})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          📢 Announcements ({stats.announcements})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "progress" ? "active" : ""}`}
          onClick={() => setActiveTab("progress")}
        >
          📈 Progress Updates ({stats.progressUpdates})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "homework" ? "active" : ""}`}
          onClick={() => setActiveTab("homework")}
        >
          📚 Homework ({stats.homework})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "direct" ? "active" : ""}`}
          onClick={() => setActiveTab("direct")}
        >
          💬 Direct Messages ({stats.direct})
        </button>
        <button
          type="button"
          className={`comm-tab-btn ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          📤 Sent by Me
        </button>
      </div>

      {/* Split Panels */}
      <div className="comm-panels-layout">
        {/* Left Message List */}
        <div className="comm-list-card">
          <div className="comm-list-header">
            <span>Messages</span>
            <span className="comm-count-badge">
              {filteredMessages.length} messages
            </span>
          </div>

          <div className="comm-list-body">
            {loading ? (
              <div className="comm-empty-state">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="comm-empty-state">
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
                <strong>No Messages</strong>
                <p>No messages found in this category.</p>
                <button
                  type="button"
                  className="comm-btn-new-msg"
                  style={{ marginTop: "12px" }}
                  onClick={() => setIsComposeOpen(true)}
                >
                  ✉️ Compose
                </button>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const mType = String(
                  msg.messageType || msg.type || "",
                ).toUpperCase();
                const isAnnouncement = mType === "ANNOUNCEMENT";

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`comm-message-item ${isSelected ? "selected" : ""} ${!msg.isRead && Number(msg.senderId) !== Number(currentUserId) ? "unread" : ""}`}
                  >
                    <div className="comm-item-icon">
                      {isAnnouncement
                        ? "📢"
                        : mType === "PROGRESS_UPDATE"
                          ? "📈"
                          : mType === "HOMEWORK"
                            ? "📚"
                            : "💬"}
                    </div>
                    <div className="comm-item-content">
                      <div className="comm-item-top">
                        <span className="comm-item-preview">
                          {msg.message || msg.content || "Message..."}
                        </span>
                        <span className="comm-item-date">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleDateString()
                            : "Just now"}
                        </span>
                      </div>
                      <span className="comm-type-pill">
                        {mType || "ANNOUNCEMENT"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Message Details */}
        <div className="comm-detail-card">
          {!selectedMessage ? (
            <div className="comm-empty-state" style={{ margin: "auto" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
              <strong>No Message Selected</strong>
              <p>Select a message from the list to read it</p>
            </div>
          ) : (
            <div>
              <div className="comm-detail-header">
                <div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedMessage.messageType ||
                      selectedMessage.type ||
                      "Message"}
                  </h3>
                  <div className="comm-sender-info">
                    From: <strong>{getSenderName(selectedMessage)}</strong> |
                    To: <strong>{getReceiverName(selectedMessage)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(selectedMessage.id)}
                  className="comm-btn-trash"
                  title="Delete message"
                >
                  🗑️
                </button>
              </div>

              <div className="comm-detail-meta-bar">
                <span>
                  Type:{" "}
                  <strong style={{ color: "#d97706" }}>
                    {selectedMessage.messageType ||
                      selectedMessage.type ||
                      "Announcement"}
                  </strong>
                </span>
                <span>
                  Date:{" "}
                  <strong>
                    {new Date(
                      selectedMessage.createdAt || Date.now(),
                    ).toLocaleString()}
                  </strong>
                </span>
                <span>
                  Status:{" "}
                  <strong>{selectedMessage.isRead ? "Read" : "Sent"}</strong>
                </span>
              </div>

              <div className="comm-detail-content">
                {selectedMessage.message || selectedMessage.content}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="comm-modal-overlay">
          <div className="comm-modal-card" style={{ maxWidth: "420px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                color: "#991b1b",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Delete Message
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "14px",
                color: "#475569",
              }}
            >
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="comm-modal-actions">
              <button
                type="button"
                className="comm-btn-cancel"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="comm-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {isComposeOpen && (
        <div className="comm-modal-overlay">
          <div className="comm-modal-card" style={{ maxWidth: "560px" }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Compose New Message
            </h3>

            <form onSubmit={handleSend}>
              <div className="comm-form-group">
                <label>Message Type *</label>
                <select
                  required
                  value={composeData.messageType}
                  onChange={(e) => {
                    setComposeData({
                      ...composeData,
                      messageType: e.target.value,
                      receiverId: "",
                    });
                  }}
                >
                  <option value="ANNOUNCEMENT">
                    Announcement (Broadcast / Notices)
                  </option>
                  <option value="PROGRESS_UPDATE">
                    Progress Update (Academic Performance / Feedback)
                  </option>
                  <option value="HOMEWORK">
                    Homework (Class Assignment / Tasks)
                  </option>
                  <option value="DIRECT">
                    Direct Message (Private 1-to-1)
                  </option>
                </select>
              </div>

              {composeData.messageType === "DIRECT" ? (
                <div className="comm-form-group">
                  <label>Recipient *</label>
                  <select
                    required
                    value={composeData.receiverId}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        receiverId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Recipient --</option>
                    {["Students", "Parents", "Staff & Teachers"].map((cat) => {
                      const group = formattedRecipients.filter(
                        (r) => r.category === cat,
                      );
                      if (group.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {group.map((r) => (
                            <option key={`${cat}-${r.id}`} value={r.id}>
                              {r.displayName}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              ) : composeData.messageType === "PROGRESS_UPDATE" ? (
                <div className="comm-form-group">
                  <label>Target Student / Parent (Optional)</label>
                  <select
                    value={composeData.receiverId}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        receiverId: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      -- General Broadcast (All Parents / Students) --
                    </option>
                    {["Students", "Parents"].map((cat) => {
                      const group = targetRecipients.filter(
                        (r) => r.category === cat,
                      );
                      if (group.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {group.map((r) => (
                            <option key={`${cat}-${r.id}`} value={r.id}>
                              {r.displayName}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "11.5px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Select a student or parent for direct performance feedback,
                    or leave on broadcast for all.
                  </small>
                </div>
              ) : composeData.messageType === "HOMEWORK" ? (
                <div className="comm-form-group">
                  <label>Target Student / Parent (Optional)</label>
                  <select
                    value={composeData.receiverId}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        receiverId: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      -- Class Broadcast (All Students) --
                    </option>
                    {["Students", "Parents"].map((cat) => {
                      const group = targetRecipients.filter(
                        (r) => r.category === cat,
                      );
                      if (group.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {group.map((r) => (
                            <option key={`${cat}-${r.id}`} value={r.id}>
                              {r.displayName}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "11.5px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Choose a specific student or parent, or leave as Class
                    Broadcast for everyone.
                  </small>
                </div>
              ) : (
                <div className="comm-form-group">
                  <label>Target Audience</label>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#475569",
                      fontWeight: "500",
                    }}
                  >
                    📢 Broadcast to All School Users
                  </div>
                </div>
              )}

              <div className="comm-form-group">
                <label>Message Content *</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Type your message, homework assignment, or progress update..."
                  value={composeData.message}
                  onChange={(e) =>
                    setComposeData({ ...composeData, message: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="comm-modal-actions">
                <button
                  type="button"
                  className="comm-btn-cancel"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="comm-modal-submit-btn"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPage;
