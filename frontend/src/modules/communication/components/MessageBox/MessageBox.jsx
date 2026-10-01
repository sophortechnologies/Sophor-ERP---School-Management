import React, { useState, useRef } from "react";
import { Send, Paperclip, X, Smile } from "lucide-react";
import { useCommunication } from "../../hooks";
import { validateMessage, validateAttachment } from "../../utils";
import "./MessageBox.css";

export const MessageBox = ({ receiverId, receiverType, subject, onSendSuccess }) => {
  const [message, setMessage] = useState({
    subject: subject || "",
    content: "",
    receiverId: receiverId || "",
    receiverType: receiverType || "",
    attachments: [],
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, loading } = useCommunication();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];
    const newErrors = [];

    files.forEach(file => {
      const validationErrors = validateAttachment(file);
      if (validationErrors.length > 0) {
        newErrors.push(...validationErrors);
      } else {
        newAttachments.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        });
      }
    });

    if (newErrors.length > 0) {
      alert(newErrors.join("\n"));
      return;
    }

    setMessage(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const removeAttachment = (index) => {
    setMessage(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateMessage(message);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload attachments first if any
      const attachmentIds = [];
      if (message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          const response = await communicationAPI.uploadAttachment(attachment.file);
          if (response?.id) {
            attachmentIds.push(response.id);
          }
        }
      }

      // Send message with attachment IDs
      const messageData = {
        subject: message.subject,
        content: message.content,
        receiverId: message.receiverId,
        receiverType: message.receiverType,
        attachmentIds,
      };

      await sendMessage(messageData);
      
      // Reset form
      setMessage({
        subject: "",
        content: "",
        receiverId: receiverId || "",
        receiverType: receiverType || "",
        attachments: [],
      });
      setErrors({});
      
      if (onSendSuccess) {
        onSendSuccess();
      }
      
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="communication-messagebox-messagebox-message-box">
      <form onSubmit={handleSubmit}>
        <div className="communication-messagebox-messagebox-message-header">
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={message.subject}
            onChange={handleChange}
            className={`communication-messagebox-messagebox-subject-input ${errors.subject ? 'error' : ''}`}
            disabled={!!subject} // Disable if subject is provided
          />
          {errors.subject && <span className="communication-messagebox-messagebox-error-text">{errors.subject}</span>}
        </div>

        <div className="communication-messagebox-messagebox-message-body">
          <textarea
            name="content"
            placeholder="Type your message here..."
            value={message.content}
            onChange={handleChange}
            className={`communication-messagebox-messagebox-message-textarea ${errors.content ? 'error' : ''}`}
            rows="6"
          />
          {errors.content && <span className="communication-messagebox-messagebox-error-text">{errors.content}</span>}
        </div>

        {message.attachments.length > 0 && (
          <div className="communication-messagebox-messagebox-attachments-preview">
            <h4>Attachments ({message.attachments.length})</h4>
            <div className="communication-messagebox-messagebox-attachments-list">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="communication-messagebox-messagebox-attachment-item">
                  {attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name} 
                      className="communication-messagebox-messagebox-attachment-preview"
                    />
                  ) : (
                    <div className="communication-messagebox-messagebox-file-icon">📄</div>
                  )}
                  <div className="communication-messagebox-messagebox-attachment-info">
                    <span className="communication-messagebox-messagebox-attachment-name">{attachment.name}</span>
                    <span className="communication-messagebox-messagebox-attachment-size">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="communication-messagebox-messagebox-remove-attachment"
                    onClick={() => removeAttachment(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="communication-messagebox-messagebox-message-footer">
          <div className="communication-messagebox-messagebox-message-actions">
            <button
              type="button"
              className="communication-messagebox-messagebox-icon-button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: "none" }}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
            />

            <button
              type="button"
              className="communication-messagebox-messagebox-icon-button"
              title="Emoji"
            >
              <Smile size={20} />
            </button>
          </div>

          <button
            type="submit"
            className="communication-messagebox-messagebox-send-button"
            disabled={loading || isUploading}
          >
            {loading || isUploading ? (
              <span className="communication-messagebox-messagebox-spinner"></span>
            ) : (
              <>
                <Send size={18} />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};