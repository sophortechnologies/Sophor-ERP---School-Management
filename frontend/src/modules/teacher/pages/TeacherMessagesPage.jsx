import React from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./TeacherMessagesPage.css";

const TeacherMessagesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="teacher-messages-page">
      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate("/teacher/dashboard")}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>
          <MessageSquare size={24} />
          Messages
        </h1>
        <p>Communicate with students and parents</p>
      </div>
      <div className="messages-container">
        <div className="info-card">
          <MessageSquare size={48} />
          <h3>Communication Module</h3>
          <p>Send and receive messages, announcements, and progress updates.</p>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/teacher/communication")}
          >
            Go to Communication Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherMessagesPage;
