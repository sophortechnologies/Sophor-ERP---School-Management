import React, { useState, useEffect, useMemo, useCallback } from "react";
import notificationApi from "../api/notification.api";
import { NOTIFICATION_TYPE_CONFIG } from "../constants/notificationTypes";
import api from "@/api/axios";
import "./NotificationsPage.css";

export const NotificationsPage = () => {
  const currentUserId = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored)?.id || 1 : 1;
    } catch {
      return 1;
    }
  })();

  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  // Broadcast modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Broadcast alert form state
  const [usersList, setUsersList] = useState([]);
  const [composeData, setComposeData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    userId: "",
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Clean fetch call without extra query parameters
      const res = await notificationApi.getNotifications();
      const list = res.items || [];
      setNotifications(list);

      setSelectedNotif((prev) => {
        if (prev) {
          const found = list.find((n) => n.id === prev.id);
          return found || list[0] || null;
        }
        return list[0] || null;
      });
    } catch {
      setFeedback({ type: "error", text: "Failed to load notifications." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    api
      .get("/users")
      .then((res) => {
        const d = res.data?.data || res.data || [];
        const arr = Array.isArray(d)
          ? d
          : Array.isArray(d?.users)
            ? d.users
            : [];
        setUsersList(arr);
      })
      .catch(() => setUsersList([]));
  }, [fetchNotifications]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      system: notifications.filter((n) => {
        const t = String(n.type || "").toUpperCase();
        return t === "SYSTEM" || t === "ANNOUNCEMENT" || t === "EVENT";
      }).length,
      academic: notifications.filter((n) => {
        const t = String(n.type || "").toUpperCase();
        return (
          t === "EXAM" || t === "ATTENDANCE" || t === "FEE" || t === "PAYROLL"
        );
      }).length,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "academic":
        return notifications.filter(
          (n) => String(n.type || "").toUpperCase() === "EXAM",
        );
      case "attendance":
        return notifications.filter(
          (n) => String(n.type || "").toUpperCase() === "ATTENDANCE",
        );
      case "system":
        return notifications.filter((n) => {
          const t = String(n.type || "").toUpperCase();
          return t === "SYSTEM" || t === "ANNOUNCEMENT" || t === "EVENT";
        });
      case "all":
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleSelect = async (item) => {
    setSelectedNotif(item);
    if (!item.isRead) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
      } catch {
        // non-blocking
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) return;
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setFeedback({
        type: "success",
        text: "All notifications marked as read.",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Failed to mark notifications as read.",
      });
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!composeData.title.trim() || !composeData.message.trim()) return;

    setSending(true);
    setFeedback({ type: "", text: "" });

    try {
      // Build recipient list ensuring the Admin (currentUserId) receives a copy
      // so the record is retained in the database for this panel upon refresh.
      let targetIds = [];
      if (composeData.userId) {
        const selectedId = Number(composeData.userId);
        targetIds =
          selectedId === Number(currentUserId)
            ? [selectedId]
            : [selectedId, Number(currentUserId)];
      } else if (usersList.length > 0) {
        const allIds = new Set(usersList.map((u) => Number(u.id)));
        allIds.add(Number(currentUserId));
        targetIds = Array.from(allIds);
      } else {
        targetIds = [Number(currentUserId)];
      }

      await notificationApi.createNotification({
        title: composeData.title.trim(),
        message: composeData.message.trim(),
        type: composeData.type,
        userIds: targetIds,
      });

      setFeedback({
        type: "success",
        text: composeData.userId
          ? "System notification delivered to selected user and recorded!"
          : "System notification broadcasted to all users!",
      });

      setIsComposeOpen(false);
      setComposeData({
        title: "",
        message: "",
        type: "SYSTEM",
        userId: "",
      });

      // Refetch from database to ensure persistence
      await fetchNotifications();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setFeedback({
        type: "error",
        text: Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to broadcast notification.",
      });
    } finally {
      setSending(false);
    }
  };

  const getTypeConfig = (type) => {
    const key = String(type || "SYSTEM").toUpperCase();
    return NOTIFICATION_TYPE_CONFIG[key] || NOTIFICATION_TYPE_CONFIG.SYSTEM;
  };

  return (
    <div className="notif-container">
      {/* Top Banner Header */}
      <div className="notif-header">
        <div className="notif-header-title">
          <h1>🔔 System Notifications</h1>
          <p>Real-time system events, academic alerts, and operational logs</p>
        </div>
        <div className="notif-header-actions">
          <button
            type="button"
            className="notif-btn-mark-all"
            onClick={handleMarkAllRead}
            disabled={stats.unread === 0}
            title={stats.unread === 0 ? "No unread alerts" : "Mark all as read"}
          >
            ✓ Mark All Read ({stats.unread})
          </button>
          <button
            type="button"
            className="notif-btn-broadcast"
            onClick={() => setIsComposeOpen(true)}
          >
            📢 Broadcast Alert
          </button>
        </div>
      </div>

      {feedback.text && (
        <div
          className={
            feedback.type === "success"
              ? "notif-banner-success"
              : "notif-banner-error"
          }
        >
          {feedback.text}
        </div>
      )}

      {/* Metric Cards */}
      <div className="notif-stats-grid">
        <div className="notif-stat-card">
          <div className="notif-stat-icon icon-blue">🔔</div>
          <div>
            <span className="notif-stat-label">TOTAL ALERTS</span>
            <div className="notif-stat-val">{stats.total}</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon icon-amber">📬</div>
          <div>
            <span className="notif-stat-label">UNREAD</span>
            <div className="notif-stat-val">{stats.unread}</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon icon-purple">🎓</div>
          <div>
            <span className="notif-stat-label">ACADEMIC & ATTENDANCE</span>
            <div className="notif-stat-val">{stats.academic}</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon icon-slate">⚙️</div>
          <div>
            <span className="notif-stat-label">SYSTEM & LOGS</span>
            <div className="notif-stat-val">{stats.system}</div>
          </div>
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="notif-tab-bar">
        <button
          type="button"
          className={`notif-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          📁 All ({stats.total})
        </button>
        <button
          type="button"
          className={`notif-tab-btn ${activeTab === "unread" ? "active" : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          ✉️ Unread ({stats.unread})
        </button>
        <button
          type="button"
          className={`notif-tab-btn ${activeTab === "academic" ? "active" : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          🎓 Academic
        </button>
        <button
          type="button"
          className={`notif-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          📅 Attendance
        </button>
        <button
          type="button"
          className={`notif-tab-btn ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          ⚙️ System ({stats.system})
        </button>
      </div>

      {/* Split Panels */}
      <div className="notif-panels-layout">
        {/* Left Notification List */}
        <div className="notif-list-card">
          <div className="notif-list-header">
            <span>Notifications</span>
            <span className="notif-count-badge">
              {filteredNotifications.length} alerts
            </span>
          </div>

          <div className="notif-list-body">
            {loading ? (
              <div className="notif-empty-state">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notif-empty-state">
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                <strong>No Notifications</strong>
                <p>You have no alerts in this category.</p>
                <button
                  type="button"
                  className="notif-btn-broadcast"
                  style={{ marginTop: "12px" }}
                  onClick={() => setIsComposeOpen(true)}
                >
                  📢 Create Alert
                </button>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isSelected = selectedNotif?.id === n.id;
                const cfg = getTypeConfig(n.type);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    className={`notif-item ${isSelected ? "selected" : ""} ${!n.isRead ? "unread" : ""}`}
                  >
                    <div
                      className="notif-item-icon"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="notif-item-content">
                      <div className="notif-item-top">
                        <span className="notif-item-title">
                          {n.title || "Notification"}
                        </span>
                        <span className="notif-item-date">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleDateString()
                            : "Today"}
                        </span>
                      </div>
                      <p className="notif-item-snippet">{n.message}</p>
                      <span
                        className="notif-pill"
                        style={{
                          color: cfg.badgeColor,
                          backgroundColor: cfg.bg,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="notif-detail-card">
          {!selectedNotif ? (
            <div className="notif-empty-state" style={{ margin: "auto" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔔</div>
              <strong>No Notification Selected</strong>
              <p>Select an alert from the list to view its complete details</p>
            </div>
          ) : (
            <div>
              <div className="notif-detail-header">
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "19px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedNotif.title || "Notification"}
                  </h3>
                  <div className="notif-detail-meta">
                    Category:{" "}
                    <strong
                      style={{
                        color: getTypeConfig(selectedNotif.type).badgeColor,
                      }}
                    >
                      {getTypeConfig(selectedNotif.type).label}
                    </strong>{" "}
                    | Received:{" "}
                    <strong>
                      {new Date(
                        selectedNotif.createdAt || Date.now(),
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="notif-detail-body">
                <p className="notif-detail-text">{selectedNotif.message}</p>

                {selectedNotif.metadata && (
                  <div className="notif-metadata-card">
                    <span className="notif-metadata-title">
                      Event Metadata:
                    </span>
                    <pre className="notif-metadata-code">
                      {typeof selectedNotif.metadata === "object"
                        ? JSON.stringify(selectedNotif.metadata, null, 2)
                        : String(selectedNotif.metadata)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {isComposeOpen && (
        <div className="notif-modal-overlay">
          <div className="notif-modal-card" style={{ maxWidth: "540px" }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              📢 Broadcast System Notification
            </h3>

            <form onSubmit={handleCreateBroadcast}>
              <div className="notif-form-group">
                <label>Alert Category / Type *</label>
                <select
                  required
                  value={composeData.type}
                  onChange={(e) =>
                    setComposeData({ ...composeData, type: e.target.value })
                  }
                >
                  <option value="SYSTEM">
                    ⚙️ System (Maintenance, Logs, General)
                  </option>
                  <option value="ANNOUNCEMENT">📢 Announcement</option>
                  <option value="EVENT">🎉 School Event</option>
                  <option value="EXAM">🎓 Exam & Grading Notice</option>
                  <option value="ATTENDANCE">📅 Attendance Alert</option>
                  <option value="FEE">💰 Fee & Billing Alert</option>
                  <option value="PAYROLL">💳 Payroll Notice</option>
                  <option value="LEAVE">🏖️ Leave Request Alert</option>
                  <option value="MESSAGE">💬 Direct Message Alert</option>
                </select>
              </div>

              <div className="notif-form-group">
                <label>Target User (Optional)</label>
                <select
                  value={composeData.userId}
                  onChange={(e) =>
                    setComposeData({ ...composeData, userId: e.target.value })
                  }
                >
                  <option value="">
                    -- Broadcast to All Users ({usersList.length} Users) --
                  </option>
                  {usersList.map((u) => {
                    const fullName = [u?.firstName, u?.lastName]
                      .filter(Boolean)
                      .join(" ");
                    const displayName =
                      fullName || u?.username || u?.email || `User #${u?.id}`;
                    const roleName =
                      typeof u?.role === "string"
                        ? u.role
                        : u?.role?.name || "";
                    return (
                      <option key={u.id} value={u.id}>
                        {displayName} {roleName ? `(${roleName})` : ""}
                      </option>
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
                  Select a specific user or leave empty to broadcast to
                  everyone.
                </small>
              </div>

              <div className="notif-form-group">
                <label>Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Scheduled System Maintenance"
                  value={composeData.title}
                  onChange={(e) =>
                    setComposeData({ ...composeData, title: e.target.value })
                  }
                />
              </div>

              <div className="notif-form-group">
                <label>Alert Message *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the alert or operational event in detail..."
                  value={composeData.message}
                  onChange={(e) =>
                    setComposeData({ ...composeData, message: e.target.value })
                  }
                />
              </div>

              <div className="notif-modal-actions">
                <button
                  type="button"
                  className="notif-btn-cancel"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="notif-btn-submit"
                >
                  {sending ? "Broadcasting..." : "📢 Broadcast Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
