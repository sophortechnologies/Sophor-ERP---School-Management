// src/modules/classes/pages/ClassDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  User, 
  Calendar, 
  Edit, 
  Trash2,
  Plus,
  Home
} from "lucide-react";
import { classesApi } from "../api/classes.api";
import "./ClassDetails.css";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch class details
      const classResponse = await classesApi.getClassById(id);
      console.log("Class details:", classResponse.data);
      
      // Fetch sections for this class
      const sectionsResponse = await classesApi.getSectionsByClass(id);
      console.log("Class sections:", sectionsResponse.data);
      
      setClassData(classResponse.data);
      setSections(sectionsResponse.data || []);
      
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError("Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/classes?edit=${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${classData.name}"?`)) {
      try {
        await classesApi.deleteClass(id);
        alert("Class deleted successfully!");
        navigate("/admin/classes");
      } catch (err) {
        alert("Failed to delete class");
      }
    }
  };

  const handleAddSection = () => {
    navigate(`/admin/classes?addSection=${id}`);
  };

  const handleBack = () => {
    navigate("/admin/classes");
  };

  if (loading) {
    return (
      <div className="classes-classdetails-loading-container">
        <div className="classes-classdetails-spinner"></div>
        <p>Loading class details...</p>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="classes-classdetails-error-container">
        <p className="classes-classdetails-error-message">{error || "Class not found"}</p>
        <button className="btn btn-primary" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="classes-classdetails-class-details">
      <div className="classes-classdetails-details-header">
        <button className="btn classes-classdetails-btn-secondary" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Classes
        </button>
        
        <div className="classes-classdetails-header-actions">
          <button className="btn btn-primary" onClick={handleEdit}>
            <Edit size={18} />
            Edit Class
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="details-content">
        <div className="classes-classdetails-class-header">
          <div className="classes-classdetails-class-icon">
            <BookOpen size={48} />
          </div>
          <div className="classes-classdetails-class-info">
            <h1>{classData.name}</h1>
            <p className="classes-classdetails-class-id">Class ID: {classData.id}</p>
            <div className="classes-classdetails-status-badge" style={{
              backgroundColor: classData.status === 'active' ? '#d4edda' : '#f8d7da',
              color: classData.status === 'active' ? '#155724' : '#721c24'
            }}>
              {classData.status?.toUpperCase() || 'ACTIVE'}
            </div>
          </div>
        </div>

        <div className="classes-classdetails-details-grid">
          <div className="classes-classdetails-details-section">
            <h2><BookOpen size={18} /> Class Information</h2>
            <div className="classes-classdetails-info-grid">
              <div className="classes-classdetails-info-item">
                <label>Class Name</label>
                <p>{classData.name}</p>
              </div>
              <div className="classes-classdetails-info-item">
                <label>Capacity</label>
                <p>{classData.capacity || 'Unlimited'} students</p>
              </div>
              <div className="classes-classdetails-info-item">
                <label>Current Enrollment</label>
                <p>{classData.currentEnrollment || 0} students</p>
              </div>
              <div className="classes-classdetails-info-item">
                <label>Available Seats</label>
                <p>{(classData.capacity || 0) - (classData.currentEnrollment || 0)} seats</p>
              </div>
            </div>
          </div>

          <div className="classes-classdetails-details-section">
            <h2><Calendar size={18} /> Academic Information</h2>
            <div className="classes-classdetails-info-grid">
              <div className="classes-classdetails-info-item">
                <label>Grade Level</label>
                <p>{classData.gradeLevel || 'Not specified'}</p>
              </div>
              <div className="classes-classdetails-info-item">
                <label>Academic Session</label>
                <p>{classData.academicSessionId || 'Not specified'}</p>
              </div>
              <div className="classes-classdetails-info-item">
                <label>Created Date</label>
                <p>{new Date(classData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Section */}
        <div className="classes-classdetails-sections-section">
          <div className="classes-classdetails-section-header">
            <h2><Users size={18} /> Sections ({sections.length})</h2>
            <button className="btn btn-primary" onClick={handleAddSection}>
              <Plus size={16} />
              Add Section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="classes-classdetails-empty-sections">
              <p>No sections created yet for this class.</p>
              <button className="btn classes-classdetails-btn-secondary" onClick={handleAddSection}>
                <Plus size={16} />
                Create First Section
              </button>
            </div>
          ) : (
            <div className="classes-classdetails-sections-grid">
              {sections.map(section => (
                <div key={section.id} className="classes-classdetails-section-card">
                  <div className="classes-classdetails-section-header">
                    <h3>{section.name}</h3>
                    <span className="classes-classdetails-section-type">{section.type}</span>
                  </div>
                  <div className="classes-classdetails-section-details">
                    <div className="classes-classdetails-detail-item">
                      <Home size={14} />
                      <span>Room: {section.roomNumber || 'Not assigned'}</span>
                    </div>
                    <div className="classes-classdetails-detail-item">
                      <User size={14} />
                      <span>Capacity: {section.capacity} students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;