// src/modules/communication/pages/CommunicationPage.jsx
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Inbox,
  Mail,
  CheckCircle,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  Users,
  Bell,
  BookOpen,
  TrendingUp,
  Search,
  X,
} from "lucide-react";
import { useCommunication } from "../hooks/useCommunication";
import communicationApi from "../api/communication.api"; // ← ADD THIS IMPORT
import {
  MESSAGE_TYPES,
  MESSAGE_STATUS,
} from "../constants/communication.constants";
import "./CommunicationPage.css";
import api from "../../../api/axios";

const CommunicationPage = () => {
  const {
    messages,
    loading,
    error,
    unreadCount,
    pagination,
    loadInbox,
    loadUnreadCount,
    sendMessage,
    markAsRead,
    deleteMessage,
  } = useCommunication();

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formData, setFormData] = useState({
    receiverId: "",
    message: "",
    messageType: "DIRECT",
  });
  const [formErrors, setFormErrors] = useState({});
  const [sending, setSending] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  // Add this state
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Add this function to load all users
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      // Fetch all users from your backend
      const response = await api.get("/users", {
        params: { page: 1, page_size: 100 },
      });
      if (response.data?.data) {
        setAllUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };
  // In CommunicationPage.jsx, add role-based restrictions

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    setUserRole(user?.role?.toLowerCase() || user?.role);
  }, []);

  // In the Compose Modal, restrict message types based on role
  <div className="communication-communicationpage-form-group">
    <label>Message Type</label>
    <select
      name="messageType"
      value={formData.messageType}
      onChange={(e) =>
        setFormData({ ...formData, messageType: e.target.value })
      }
      disabled={userRole === "teacher"} // Teachers can't create announcements
    >
      <option value="DIRECT">Direct Message</option>
      {userRole !== "teacher" && (
        <option value="ANNOUNCEMENT">Announcement (All Users)</option>
      )}
      <option value="PROGRESS_UPDATE">Progress Update</option>
    </select>
    {userRole === "teacher" && (
      <small className="communication-communicationpage-help-text">
        Teachers can only send direct messages to students/parents
      </small>
    )}
  </div>;

  // For recipient selection, only show students/parents for teachers
  {
    formData.messageType !== "ANNOUNCEMENT" && (
      <div className="communication-communicationpage-form-group">
        <label>Recipient</label>
        <select
          value={formData.receiverId}
          onChange={(e) => {
            const userId = e.target.value;
            setFormData((prev) => ({ ...prev, receiverId: userId }));
          }}
          className={formErrors.receiverId ? "error" : ""}
        >
          <option value="">-- Select a recipient --</option>
          {allUsers
            .filter((user) => {
              if (userRole === "teacher") {
                // Teachers can only message students and parents
                return (
                  user.role?.name === "STUDENT" || user.role?.name === "PARENT"
                );
              }
              return user.id !== currentUser?.id;
            })
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} - {user.role?.name || "User"}
              </option>
            ))}
        </select>
      </div>
    );
  }
  // Call this when the compose modal opens
  useEffect(() => {
    if (showCompose) {
      loadAllUsers();
    }
  }, [showCompose]);
  // Get current user from localStorage or context
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    if (user?.id) {
      loadInbox(user.id, { page: currentPage });
      loadUnreadCount(user.id);
    }
  }, [currentPage, loadInbox, loadUnreadCount]);

  // Search users function
  const searchUsers = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await communicationApi.searchUsers(term);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Select recipient
  const selectRecipient = (user) => {
    setSelectedRecipient(user);
    setFormData((prev) => ({ ...prev, receiverId: user.id }));
    setSearchTerm("");
    setSearchResults([]);
  };

  // Clear recipient
  const clearRecipient = () => {
    setSelectedRecipient(null);
    setFormData((prev) => ({ ...prev, receiverId: "" }));
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const status = filter === "unread" ? "SENT" : undefined;
    loadInbox(currentUser?.id, { page: 1, status });
    setCurrentPage(1);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status === "SENT" && currentUser?.id === message.receiverId) {
      await markAsRead(message.id, currentUser.id);
      loadInbox(currentUser.id, {
        page: currentPage,
        status: activeFilter === "unread" ? "SENT" : undefined,
      });
      loadUnreadCount(currentUser.id);
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!confirm("Delete this message?")) return;
    const result = await deleteMessage(message.id, currentUser?.id);
    if (result.success) {
      setSuccessMessage("Message deleted!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setSelectedMessage(null);
    } else {
      alert(result.error || "Failed to delete message");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    console.log("=== SEND MESSAGE DEBUG ===");
    console.log("Form data:", formData);
    console.log("Current user:", currentUser);
    console.log("Selected recipient:", selectedRecipient);

    const newErrors = {};

    if (formData.messageType !== "ANNOUNCEMENT") {
      if (!formData.receiverId) {
        newErrors.receiverId = "Please select a recipient";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
      return;
    }

    setSending(true);

    // Prepare payload
    const payload = {
      senderId: currentUser?.id,
      message: formData.message,
      messageType: formData.messageType,
    };

    // Only add receiverId if not an announcement
    if (formData.messageType !== "ANNOUNCEMENT") {
      payload.receiverId = parseInt(formData.receiverId);
    }

    console.log("Sending payload:", payload);

    const result = await sendMessage(payload);

    console.log("Send message result:", result);

    if (result.success) {
      setSuccessMessage("Message sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowCompose(false);
      setFormData({ receiverId: "", message: "", messageType: "DIRECT" });
      setSelectedRecipient(null);
      setSearchTerm("");
      setSearchResults([]);
      loadInbox(currentUser?.id, { page: currentPage });
      loadUnreadCount(currentUser?.id);
    } else {
      console.error("Failed to send message:", result.error);
      alert(result.error || "Failed to send message");
    }
    setSending(false);
  };

  const getMessageTypeIcon = (type) => {
    const typeConfig = MESSAGE_TYPES.find((t) => t.value === type);
    return typeConfig?.icon || "💬";
  };

  const getMessageTypeColor = (type) => {
    const typeConfig = MESSAGE_TYPES.find((t) => t.value === type);
    return typeConfig?.color || "#6b7280";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="communication-communicationpage-loading-container">
        <div className="communication-communicationpage-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="communication-communicationpage-communication-page">
      {/* Header */}
      <div className="communication-communicationpage-page-header">
        <div className="communication-communicationpage-header-content">
          <div>
            <h1>
              <MessageSquare size={24} />
              Communication Center
            </h1>
            <p>Send messages, announcements, and progress updates</p>
            {successMessage && (
              <div className="communication-communicationpage-success-message">
                <CheckCircle size={14} /> {successMessage}
              </div>
            )}
          </div>
          <div className="communication-communicationpage-header-buttons">
            <button
              className="btn btn-primary"
              onClick={() => setShowCompose(true)}
            >
              <Send size={18} />
              New Message
            </button>
            <button
              className="btn communication-communicationpage-btn-secondary"
              onClick={() => {
                loadInbox(currentUser?.id, { page: currentPage });
                loadUnreadCount(currentUser?.id);
              }}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="communication-communicationpage-stat-icon" style={{ background: "#dbeafe" }}>
            <Mail size={24} color="#3b82f6" />
          </div>
          <div className="communication-communicationpage-stat-info">
            <p className="stat-label">Total Messages</p>
            <p className="stat-value">{pagination.totalItems}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="communication-communicationpage-stat-icon" style={{ background: "#dcfce7" }}>
            <Eye size={24} color="#10b981" />
          </div>
          <div className="communication-communicationpage-stat-info">
            <p className="stat-label">Unread</p>
            <p className="stat-value">{unreadCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="communication-communicationpage-stat-icon" style={{ background: "#fef3c7" }}>
            <Users size={24} color="#f59e0b" />
          </div>
          <div className="communication-communicationpage-stat-info">
            <p className="stat-label">Announcements</p>
            <p className="stat-value">
              {messages.filter((m) => m.messageType === "ANNOUNCEMENT").length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="communication-communicationpage-stat-icon" style={{ background: "#f3e8ff" }}>
            <TrendingUp size={24} color="#8b5cf6" />
          </div>
          <div className="communication-communicationpage-stat-info">
            <p className="stat-label">Progress Updates</p>
            <p className="stat-value">
              {
                messages.filter((m) => m.messageType === "PROGRESS_UPDATE")
                  .length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="communication-communicationpage-filter-tabs">
        <button
          className={`communication-communicationpage-filter-tab ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          <Inbox size={16} />
          All Messages
        </button>
        <button
          className={`communication-communicationpage-filter-tab ${activeFilter === "unread" ? "active" : ""}`}
          onClick={() => handleFilterChange("unread")}
        >
          <Mail size={16} />
          Unread
          {unreadCount > 0 && <span className="communication-communicationpage-badge">{unreadCount}</span>}
        </button>
        <button
          className={`communication-communicationpage-filter-tab ${activeFilter === "announcements" ? "active" : ""}`}
          onClick={() => handleFilterChange("announcements")}
        >
          <Bell size={16} />
          Announcements
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="communication-communicationpage-error-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error:</strong> {error}
            <button
              className="btn btn-sm"
              onClick={() => loadInbox(currentUser?.id)}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Messages Grid */}
      <div className="communication-communicationpage-messages-grid">
        {/* Messages List */}
        <div className="communication-communicationpage-messages-list">
          <div className="communication-communicationpage-list-header">
            <h3>Messages</h3>
            <span className="communication-communicationpage-count">{messages.length} messages</span>
          </div>
          <div className="communication-communicationpage-list-content">
            {messages.length === 0 ? (
              <div className="communication-communicationpage-empty-state">
                <MessageSquare size={48} />
                <h4>No Messages</h4>
                <p>Your inbox is empty</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCompose(true)}
                >
                  <Send size={16} /> Compose
                </button>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`communication-communicationpage-message-item ${selectedMessage?.id === message.id ? "active" : ""} ${message.status === "SENT" && message.receiverId === currentUser?.id ? "unread" : ""}`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div
                    className="communication-communicationpage-message-icon"
                    style={{
                      backgroundColor: `${getMessageTypeColor(message.messageType)}15`,
                    }}
                  >
                    {getMessageTypeIcon(message.messageType)}
                  </div>
                  <div className="communication-communicationpage-message-content">
                    <div className="communication-communicationpage-message-header">
                      <span className="communication-communicationpage-message-sender">
                        {message.sender?.firstName} {message.sender?.lastName}
                      </span>
                      <span className="communication-communicationpage-message-time">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <div className="communication-communicationpage-message-preview">
                      {message.message.substring(0, 60)}...
                    </div>
                    <div className="communication-communicationpage-message-footer">
                      <span
                        className="communication-communicationpage-message-type"
                        style={{
                          color: getMessageTypeColor(message.messageType),
                        }}
                      >
                        {MESSAGE_TYPES.find(
                          (t) => t.value === message.messageType,
                        )?.label || message.messageType}
                      </span>
                      {message.status === "READ" && (
                        <span className="communication-communicationpage-read-badge">✓ Read</span>
                      )}
                      {message.status === "SENT" &&
                        message.receiverId === currentUser?.id && (
                          <span className="communication-communicationpage-unread-badge">New</span>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="communication-communicationpage-pagination">
              <button
                className="communication-communicationpage-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span className="communication-communicationpage-pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="communication-communicationpage-pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="communication-communicationpage-message-detail">
          {selectedMessage ? (
            <>
              <div className="communication-communicationpage-detail-header">
                <div className="communication-communicationpage-detail-header-info">
                  <div
                    className="communication-communicationpage-message-icon-large"
                    style={{
                      backgroundColor: `${getMessageTypeColor(selectedMessage.messageType)}15`,
                    }}
                  >
                    {getMessageTypeIcon(selectedMessage.messageType)}
                  </div>
                  <div>
                    <h3>
                      {selectedMessage.messageType === "ANNOUNCEMENT"
                        ? "Announcement"
                        : "Message"}
                    </h3>
                    <p>
                      From: {selectedMessage.sender?.firstName}{" "}
                      {selectedMessage.sender?.lastName}
                    </p>
                  </div>
                </div>
                <div className="communication-communicationpage-detail-actions">
                  <button
                    className="communication-communicationpage-btn-icon"
                    onClick={() => handleDeleteMessage(selectedMessage)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="communication-communicationpage-detail-body">
                <div className="communication-communicationpage-detail-meta">
                  <span className="communication-communicationpage-meta-item">
                    <span className="communication-communicationpage-meta-label">Type:</span>
                    <span
                      className="communication-communicationpage-meta-value"
                      style={{
                        color: getMessageTypeColor(selectedMessage.messageType),
                      }}
                    >
                      {
                        MESSAGE_TYPES.find(
                          (t) => t.value === selectedMessage.messageType,
                        )?.label
                      }
                    </span>
                  </span>
                  <span className="communication-communicationpage-meta-item">
                    <span className="communication-communicationpage-meta-label">Date:</span>
                    <span className="communication-communicationpage-meta-value">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </span>
                  <span className="communication-communicationpage-meta-item">
                    <span className="communication-communicationpage-meta-label">Status:</span>
                    <span
                      className={`communication-communicationpage-status-badge ${selectedMessage.status?.toLowerCase()}`}
                    >
                      {selectedMessage.status === "READ" ? "✓ Read" : "Sent"}
                    </span>
                  </span>
                </div>
                <div className="communication-communicationpage-detail-message">{selectedMessage.message}</div>
                {selectedMessage.attachments &&
                  selectedMessage.attachments.length > 0 && (
                    <div className="communication-communicationpage-detail-attachments">
                      <h4>Attachments</h4>
                      <div className="communication-communicationpage-attachments-list">
                        {selectedMessage.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="communication-communicationpage-attachment-item"
                          >
                            📎 {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="communication-communicationpage-detail-empty">
              <MessageSquare size={48} />
              <h3>No Message Selected</h3>
              <p>Select a message from the list to read it</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="communication-communicationpage-modal-overlay" onClick={() => setShowCompose(false)}>
          <div
            className="communication-communicationpage-modal-content compose-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="communication-communicationpage-modal-header">
              <h2>
                <Send size={20} />
                New Message
              </h2>
              <button
                className="communication-communicationpage-close-button"
                onClick={() => setShowCompose(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendMessage}>
              <div className="communication-communicationpage-modal-body">
                <div className="communication-communicationpage-form-group">
                  <label>Message Type</label>
                  <select
                    name="messageType"
                    value={formData.messageType}
                    onChange={(e) =>
                      setFormData({ ...formData, messageType: e.target.value })
                    }
                  >
                    {MESSAGE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.messageType !== "ANNOUNCEMENT" && (
                  <div className="communication-communicationpage-form-group">
                    <label>
                      Recipient <span className="required">*</span>
                    </label>
                    <div className="recipient-search-container">
                      <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={formErrors.receiverId ? "error" : ""}
                        />
                        {searching && (
                          <div className="search-spinner-small"></div>
                        )}
                      </div>

                      {searchResults.length > 0 && (
                        <div className="search-results">
                          {searchResults
                            .filter((user) => user.id !== currentUser?.id)
                            .map((user) => (
                              <div
                                key={user.id}
                                className="search-result-item"
                                onClick={() => selectRecipient(user)}
                              >
                                <div className="result-avatar">
                                  {user.firstName?.[0]}
                                  {user.lastName?.[0]}
                                </div>
                                <div className="result-info">
                                  <div className="result-name">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="result-email">
                                    {user.email}
                                  </div>
                                  <div className="result-role">
                                    {user.role?.name || "User"}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {selectedRecipient && (
                        <div className="selected-recipient">
                          <span className="selected-badge">
                            To: {selectedRecipient.firstName}{" "}
                            {selectedRecipient.lastName} (
                            {selectedRecipient.email})
                            <button
                              type="button"
                              className="clear-recipient"
                              onClick={clearRecipient}
                            >
                              <X size={14} />
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                    <small className="communication-communicationpage-help-text">
                      Search for users by name or email
                    </small>
                  </div>
                )}
                <div className="communication-communicationpage-form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows="6"
                    placeholder="Type your message here..."
                    className={formErrors.message ? "error" : ""}
                  />
                  {formErrors.message && (
                    <span className="communication-communicationpage-error-text">{formErrors.message}</span>
                  )}
                  <small className="communication-communicationpage-help-text">
                    {formData.message.length}/1000 characters
                  </small>
                </div>
              </div>
              <div className="communication-communicationpage-modal-footer">
                <button
                  type="button"
                  className="btn communication-communicationpage-btn-secondary"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
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
