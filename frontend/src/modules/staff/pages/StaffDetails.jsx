// src/modules/staff/pages/StaffDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, User } from "lucide-react";
import api from "../../../api/axios";
import "./StaffDetails.css";

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStaffDetails();
  }, [id]);

  const loadStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff");
      
      let staffArray = [];
      
      if (Array.isArray(response.data)) {
        staffArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        staffArray = response.data.data;
      } else if (response.data && Array.isArray(response.data.staff)) {
        staffArray = response.data.staff;
      }
      
      // Find the specific staff member
      const foundStaff = staffArray.find(item => {
        const itemId = item.id || item._id || item.userId;
        const staffId = item.staffCode || item.staff_id || item.staffId || item.employeeId;
        return itemId == id || staffId == id;
      });
      
      if (foundStaff) {
        const transformed = transformStaffData(foundStaff);
        setStaff(transformed);
        setError(null);
      } else {
        setError(`Staff member with ID ${id} not found`);
      }
      
    } catch (err) {
      setError("Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  const transformStaffData = (staffData) => {
    // Extract name
    let firstName = staffData.firstName || staffData.first_name || staffData.fname || '';
    let lastName = staffData.lastName || staffData.last_name || staffData.lname || '';
    
    if (!firstName && staffData.name) {
      const nameParts = String(staffData.name).split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Check nested user object
    if (staffData.user) {
      if (!firstName) firstName = staffData.user.firstName || staffData.user.first_name || '';
      if (!lastName) lastName = staffData.user.lastName || staffData.user.last_name || '';
    }
    
    const transformed = {
      id: staffData.id || staffData._id || staffData.userId || id,
      staffId: staffData.staffCode || staffData.staff_id || staffData.staffId || 
               staffData.employeeId || staffData.employee_id || 
               `STF${String(id).padStart(3, '0')}`,
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`.trim() || 'Unnamed Staff',
      email: staffData.email || staffData.user?.email || '',
      phone: staffData.phone || staffData.phone_number || staffData.mobile || staffData.user?.phone || '',
      designation: staffData.designation || staffData.position || staffData.job_title || staffData.role || 'Staff',
      role: staffData.role || 'Staff',
      employmentType: staffData.employmentType || staffData.employment_type || 'FULL_TIME',
      joinDate: staffData.joiningDate || staffData.joining_date || staffData.join_date || staffData.createdAt,
      status: (staffData.status || 'ACTIVE').toUpperCase(),
    };
    
    return transformed;
  };

  const handleBack = () => {
    navigate("/admin/staff");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatEmploymentType = (type) => {
    if (!type) return 'Not specified';
    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="staff-staffdetails-loading-container">
        <div className="staff-staffdetails-spinner"></div>
        <p>Loading staff details...</p>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div className="staff-staffdetails-error-container">
        <div className="staff-staffdetails-error-icon">⚠️</div>
        <h3>Unable to Load Staff Details</h3>
        <p className="staff-staffdetails-error-message">{error}</p>
        <button className="btn btn-back" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Staff List
        </button>
      </div>
    );
  }

  const fullName = staff?.fullName || 'Unnamed Staff';

  return (
    <div className="staff-staffdetails-staff-details">
      {/* Header */}
      <div className="staff-staffdetails-details-header">
        <button className="btn btn-back" onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to Staff
        </button>
      </div>

      {/* Profile Header - Only Name and Status */}
      <div className="staff-staffdetails-profile-header">
        <div className="staff-staffdetails-profile-avatar">
          {staff?.firstName?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="staff-staffdetails-profile-info">
          <h1>{fullName}</h1>
          <div className="staff-staffdetails-profile-status">
            <span className={`staff-staffdetails-status-badge ${staff?.status?.toLowerCase() || 'active'}`}>
              {staff?.status || 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="staff-staffdetails-details-content">
        <div className="staff-staffdetails-details-grid">
          {/* Personal Information Card */}
          <div className="staff-staffdetails-details-card">
            <div className="card-header">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className="card-body">
              <div className="staff-staffdetails-info-grid">
                <div className="staff-staffdetails-info-item">
                  <label>Name</label>
                  <p>{fullName}</p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label><Mail size={16} /> Email Address</label>
                  <p className={!staff?.email ? 'staff-staffdetails-text-muted' : ''}>
                    {staff?.email || 'Not specified'}
                  </p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label><Phone size={16} /> Phone Number</label>
                  <p className={!staff?.phone ? 'staff-staffdetails-text-muted' : ''}>
                    {staff?.phone || 'Not specified'}
                  </p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label>Status</label>
                  <span className={`staff-staffdetails-status-indicator ${staff?.status?.toLowerCase() || 'active'}`}>
                    {staff?.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information Card */}
          <div className="staff-staffdetails-details-card">
            <div className="card-header">
              <Briefcase size={20} />
              <h2>Employment Information</h2>
            </div>
            <div className="card-body">
              <div className="staff-staffdetails-info-grid">
                <div className="staff-staffdetails-info-item">
                  <label>Designation</label>
                  <p>{staff?.designation || 'Not specified'}</p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label>Staff ID</label>
                  <p className="staff-staffdetails-staff-id-display">{staff?.staffId || 'N/A'}</p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label>Employment Type</label>
                  <p>{formatEmploymentType(staff?.employmentType)}</p>
                </div>
                <div className="staff-staffdetails-info-item">
                  <label><Calendar size={16} /> Join Date</label>
                  <p>{formatDate(staff?.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;