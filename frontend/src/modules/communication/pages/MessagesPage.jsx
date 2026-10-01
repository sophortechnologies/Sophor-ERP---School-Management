import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Archive,
  Trash2,
  Reply,
  Clock,
  Mail,
  Paperclip,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { useCommunication } from '../hooks';
import './MessagesPage.css';

const MessagesPage = () => {
  const { getInboxMessages, getSentMessages, loading, error } = useCommunication();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'sent', 'drafts', 'starred'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      let data;
      if (activeTab === 'inbox') {
        data = await getInboxMessages();
      } else if (activeTab === 'sent') {
        data = await getSentMessages();
      }
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.subject?.toLowerCase().includes(query) ||
      message.content?.toLowerCase().includes(query) ||
      message.senderName?.toLowerCase().includes(query) ||
      message.senderEmail?.toLowerCase().includes(query)
    );
  });

  if (loading && messages.length === 0) {
    return (
      <div className="communication-messagespage-messages-page">
        <div className="communication-messagespage-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="communication-messagespage-messages-page">
      <div className="communication-messagespage-messages-header">
        <h1>Messages</h1>
        <button 
          className="communication-messagespage-compose-button"
          onClick={() => setComposeOpen(true)}
        >
          <Plus size={18} />
          Compose
        </button>
      </div>

      <div className="communication-messagespage-messages-container">
        {/* Sidebar */}
        <div className="communication-messagespage-messages-sidebar">
          <div className="communication-messagespage-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="communication-messagespage-folders">
            <button 
              className={`communication-messagespage-folder-item ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <Mail size={16} />
              <span>Inbox</span>
              <span className="communication-messagespage-badge">12</span>
            </button>
            <button 
              className={`communication-messagespage-folder-item ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <Mail size={16} />
              <span>Sent</span>
            </button>
            <button 
              className={`communication-messagespage-folder-item ${activeTab === 'starred' ? 'active' : ''}`}
              onClick={() => setActiveTab('starred')}
            >
              <Star size={16} />
              <span>Starred</span>
            </button>
            <button 
              className={`communication-messagespage-folder-item ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              <Archive size={16} />
              <span>Archived</span>
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="communication-messagespage-messages-list">
          {filteredMessages.length === 0 ? (
            <div className="communication-messagespage-empty-state">
              <div className="communication-messagespage-empty-icon">📨</div>
              <h3>No messages</h3>
              <p>Your {activeTab} folder is empty</p>
            </div>
          ) : (
            filteredMessages.map(message => (
              <div 
                key={message.id}
                className={`communication-messagespage-message-item ${!message.isRead ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                onClick={() => handleMessageSelect(message)}
              >
                <div className="communication-messagespage-message-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="communication-messagespage-message-star">
                  <Star 
                    size={18} 
                    fill={message.starred ? "gold" : "none"} 
                    stroke={message.starred ? "gold" : "#94a3b8"}
                  />
                </div>
                <div className="communication-messagespage-message-sender">
                  <div className="communication-messagespage-sender-name">{message.senderName || 'Unknown'}</div>
                  <div className="communication-messagespage-sender-email">{message.senderEmail || ''}</div>
                </div>
                <div className="communication-messagespage-message-content">
                  <div className="communication-messagespage-message-subject">{message.subject || 'No subject'}</div>
                  <div className="communication-messagespage-message-preview">
                    {message.content ? `${message.content.substring(0, 60)}...` : 'No content'}
                  </div>
                </div>
                <div className="communication-messagespage-message-meta">
                  <div className="communication-messagespage-message-time">
                    {formatDate(message.createdAt || message.created_at)}
                  </div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="communication-messagespage-message-attachments">
                      <Paperclip size={12} /> {message.attachments.length}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="communication-messagespage-message-detail">
          {selectedMessage ? (
            <div className="communication-messagespage-message-view">
              <div className="communication-messagespage-message-view-header">
                <div className="communication-messagespage-message-view-subject">
                  <h2>{selectedMessage.subject || 'No subject'}</h2>
                  <div className="communication-messagespage-message-actions">
                    <button className="communication-messagespage-icon-action" title="Reply">
                      <Reply size={18} />
                    </button>
                    <button className="communication-messagespage-icon-action" title="Archive">
                      <Archive size={18} />
                    </button>
                    <button className="communication-messagespage-icon-action" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="communication-messagespage-message-view-sender">
                  <div className="communication-messagespage-sender-avatar">
                    {selectedMessage.senderName?.charAt(0) || 'U'}
                  </div>
                  <div className="communication-messagespage-sender-info">
                    <div className="communication-messagespage-sender-name-role">
                      <strong>{selectedMessage.senderName || 'Unknown'}</strong>
                      <span className="communication-messagespage-sender-email">{selectedMessage.senderEmail || ''}</span>
                    </div>
                    <div className="communication-messagespage-message-time-detail">
                      <Clock size={14} />
                      {formatDate(selectedMessage.createdAt || selectedMessage.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="communication-messagespage-message-view-body">
                <div className="communication-messagespage-message-content-full">
                  {selectedMessage.content || 'No content'}
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="communication-messagespage-message-attachments-list">
                    <h4>Attachments ({selectedMessage.attachments.length})</h4>
                    {selectedMessage.attachments.map((attachment, index) => (
                      <div key={index} className="communication-messagespage-attachment-item">
                        <div className="communication-messagespage-attachment-icon">📎</div>
                        <div className="communication-messagespage-attachment-details">
                          <span className="communication-messagespage-attachment-name">{attachment.name || 'Attachment'}</span>
                          <span className="communication-messagespage-attachment-size">
                            {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </span>
                        </div>
                        <button className="communication-messagespage-download-button">Download</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="communication-messagespage-select-message">
              <div className="communication-messagespage-select-message-icon">📨</div>
              <h3>Select a message</h3>
              <p>Choose a message from the list to read it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;