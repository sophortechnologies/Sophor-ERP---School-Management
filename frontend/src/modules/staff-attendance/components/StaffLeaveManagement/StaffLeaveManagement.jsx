// src/modules/staff-attendance/components/StaffLeaveManagement/StaffLeaveManagement.jsx - COMPLETE UPDATED
import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, Clock, CheckCircle, XCircle, Clock as ClockIcon, 
  Edit, Trash2, Eye, Search, Check, X, Plus,
  Filter, Download, RefreshCw, User, Mail, Phone, FileText
} from "lucide-react";
import { LEAVE_TYPES, LEAVE_STATUS } from "../../constants";
import { formatDateForDisplay, calculateLeaveDays } from "../../utils";
import "./StaffLeaveManagement.css";

// Enhanced formatLeaveForDisplay function
const formatLeaveForDisplay = (leave, staffMembers = []) => {
  // Extract employee information from various possible fields
  let employeeInfo = {
    name: "Unknown",
    id: "N/A",
    email: "",
    phone: "",
    department: ""
  };
  
  // METHOD 1: Check if leave has employee information directly
  if (leave.employee) {
    const emp = leave.employee;
    employeeInfo.name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || "Unknown";
    employeeInfo.id = emp.employeeId || emp.staffId || emp.id || "N/A";
    employeeInfo.email = emp.email || emp.user?.email || "";
    employeeInfo.phone = emp.phone || emp.user?.phone || "";
    employeeInfo.department = emp.department || "";
  }
  
  // METHOD 2: Check if leave has user information
  else if (leave.user) {
    const user = leave.user;
    employeeInfo.name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unknown";
    employeeInfo.id = user.employeeId || user.staffId || user.id || "N/A";
    employeeInfo.email = user.email || "";
    employeeInfo.phone = user.phone || "";
    employeeInfo.department = user.department || "";
  }
  
  // METHOD 3: Check if leave has staff information
  else if (leave.staff) {
    const staff = leave.staff;
    employeeInfo.name = staff.name || staff.fullName || "Unknown";
    employeeInfo.id = staff.employeeId || staff.staffId || staff.id || "N/A";
    employeeInfo.email = staff.email || "";
    employeeInfo.phone = staff.phone || "";
    employeeInfo.department = staff.department || "";
  }
  
  // METHOD 4: Check direct fields on leave object
  else {
    employeeInfo.name = leave.employeeName || leave.staffName || leave.appliedByName || "Unknown";
    employeeInfo.id = leave.employeeId || leave.staffId || leave.appliedBy || "N/A";
    employeeInfo.email = leave.employeeEmail || leave.appliedByEmail || "";
    employeeInfo.phone = leave.contactNumber || leave.contactInfo || "";
    employeeInfo.department = leave.department || "";
  }
  
  // METHOD 5: Try to find in staffMembers array (fallback)
  if ((employeeInfo.name === "Unknown" || employeeInfo.id === "N/A") && staffMembers.length > 0) {
    const foundStaff = staffMembers.find(s => 
      s.id === leave.appliedBy ||
      s._id === leave.appliedBy ||
      s.employeeId === leave.employeeId ||
      s.staffId === leave.staffId ||
      (s.user && s.user.id === leave.appliedBy)
    );
    
    if (foundStaff) {
      if (foundStaff.user) {
        employeeInfo.name = `${foundStaff.user.firstName || ''} ${foundStaff.user.lastName || ''}`.trim() || foundStaff.user.name || "Unknown";
        employeeInfo.id = foundStaff.employeeId || foundStaff.staffId || foundStaff.user.id || "N/A";
        employeeInfo.email = foundStaff.user.email || "";
        employeeInfo.phone = foundStaff.user.phone || "";
      } else {
        employeeInfo.name = foundStaff.name || foundStaff.fullName || "Unknown";
        employeeInfo.id = foundStaff.employeeId || foundStaff.staffId || foundStaff.id || "N/A";
        employeeInfo.email = foundStaff.email || "";
        employeeInfo.phone = foundStaff.phone || "";
      }
      employeeInfo.department = foundStaff.department || "";
    }
  }
  
  // Fix for appliedDate - handle various date formats
  let appliedDate = 'N/A';
  if (leave.createdAt) {
    appliedDate = leave.createdAt;
  } else if (leave.appliedDate) {
    appliedDate = leave.appliedDate;
  } else if (leave.created_date) {
    appliedDate = leave.created_date;
  } else if (leave.applied_date) {
    appliedDate = leave.applied_date;
  }
  
  const formattedLeave = {
    id: leave.id || leave._id,
    employeeId: employeeInfo.id,
    employeeName: employeeInfo.name,
    employeeEmail: employeeInfo.email,
    employeePhone: employeeInfo.phone,
    department: employeeInfo.department,
    leaveType: leave.leaveType || leave.leave_type,
    startDate: leave.startDate || leave.start_date,
    endDate: leave.endDate || leave.end_date,
    reason: leave.reason,
    status: (leave.status || 'PENDING').toUpperCase(),
    appliedDate: appliedDate,
    appliedBy: leave.appliedBy,
    contactInfo: leave.contactNumber || leave.contactInfo,
    address: leave.addressDuringLeave || leave.address,
    remarks: leave.additionalRemarks || leave.remarks,
    reviewRemarks: leave.reviewRemarks,
    reviewedBy: leave.reviewedBy,
    reviewedAt: leave.reviewedAt,
  };
  
  return formattedLeave;
};

const StaffLeaveManagement = ({ 
  leaves = [],
  pendingLeaves = [],
  staffMembers = [],
  loading = false,
  onApplyLeave,
  onReviewLeave,
  onUpdateLeave,
  onDeleteLeave,
  onViewLeave,
  onExport,
  onRefresh,
  onSearch
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    contactInfo: "",
    address: "",
    remarks: ""
  });

  // Get current user with better handling
  const getCurrentUser = useCallback(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        return { role: "" };
      }
      const user = JSON.parse(userStr);
      return user || { role: "" };
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return { role: "" };
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Check user roles (case-insensitive) - FIXED
  const userRole = currentUser?.role ? String(currentUser.role).toLowerCase() : "";
  const isSuperAdmin = userRole === "superadmin" || userRole === "super_admin";
  const isAdmin = userRole === "admin" || isSuperAdmin;
  const isHR = userRole === "hr" || userRole === "human_resources";
  
  // Determine if user can approve/reject
  const canApproveReject = isSuperAdmin || isAdmin || isHR;
  
  // Initialize viewMode based on user role
  const [viewMode, setViewMode] = useState(canApproveReject ? "pending" : "myLeaves");

  // Helper function to count leaves by status
  const countLeavesByStatus = useCallback(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let total = leaves.length;
    
    leaves.forEach(leave => {
      try {
        const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
        switch (formattedLeave.status) {
          case 'APPROVED':
            approved++;
            break;
          case 'PENDING':
            pending++;
            break;
          case 'REJECTED':
            rejected++;
            break;
        }
      } catch (error) {
        console.error("Error counting leave:", error);
      }
    });
    
    return { approved, pending, rejected, total };
  }, [leaves, staffMembers]);

  const leaveStats = countLeavesByStatus();

  // Update current user on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [getCurrentUser]);

  // Helper functions
  const getStatusColor = (status) => {
    const statusConfig = LEAVE_STATUS.find(s => s.value.toUpperCase() === (status?.toUpperCase() || ''));
    return statusConfig ? statusConfig.color : '#6b7280';
  };

  const getTypeColor = (type) => {
    const typeConfig = LEAVE_TYPES.find(t => t.value.toUpperCase() === (type?.toUpperCase() || ''));
    return typeConfig ? typeConfig.color : '#6b7280';
  };

  const getStatusLabel = (status) => {
    const statusConfig = LEAVE_STATUS.find(s => s.value.toUpperCase() === (status?.toUpperCase() || ''));
    return statusConfig ? statusConfig.label : status || 'Unknown';
  };

  const getTypeLabel = (type) => {
    const typeConfig = LEAVE_TYPES.find(t => t.value.toUpperCase() === (type?.toUpperCase() || ''));
    return typeConfig ? typeConfig.label : type || 'Unknown';
  };

  // Permission check functions
  const canEditLeave = useCallback((leave) => {
    const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
    const userEmployeeId = currentUser?.employeeId || currentUser?.id || '';
    const userEmail = currentUser?.email || '';
    
    const isOwner = formattedLeave.employeeId === userEmployeeId || 
                    formattedLeave.appliedBy === currentUser?.id ||
                    (userEmail && formattedLeave.employeeEmail === userEmail);
    
    return isOwner && formattedLeave.status === 'PENDING';
  }, [currentUser, staffMembers]);

  const canDeleteLeave = useCallback((leave) => {
    const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
    const userEmployeeId = currentUser?.employeeId || currentUser?.id || '';
    const userEmail = currentUser?.email || '';
    
    const isOwner = formattedLeave.employeeId === userEmployeeId || 
                    formattedLeave.appliedBy === currentUser?.id ||
                    (userEmail && formattedLeave.employeeEmail === userEmail);
    
    return isOwner && formattedLeave.status === 'PENDING';
  }, [currentUser, staffMembers]);

  // Filter leaves based on view mode
  const getFilteredLeaves = useCallback(() => {
    let filtered = [];
    
    switch (viewMode) {
      case "myLeaves":
        filtered = leaves.filter(leave => {
          try {
            const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
            const userEmployeeId = currentUser?.employeeId || currentUser?.id || '';
            const userEmail = currentUser?.email || '';
            
            return formattedLeave.employeeId === userEmployeeId || 
                   formattedLeave.appliedBy === currentUser?.id ||
                   (userEmail && formattedLeave.employeeEmail === userEmail);
          } catch (error) {
            return false;
          }
        });
        break;
      case "pending":
        filtered = pendingLeaves.length > 0 ? pendingLeaves : 
          leaves.filter(leave => {
            try {
              const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
              return formattedLeave.status === 'PENDING';
            } catch (error) {
              return false;
            }
          });
        break;
      case "all":
        filtered = [...leaves];
        break;
      default:
        filtered = leaves;
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(leave => {
        try {
          const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
          return formattedLeave.status === filterStatus.toUpperCase();
        } catch (error) {
          return false;
        }
      });
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(leave => {
        try {
          const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
          const type = formattedLeave.leaveType?.toUpperCase();
          return type === filterType.toUpperCase();
        } catch (error) {
          return false;
        }
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => {
        try {
          const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
          const employeeName = formattedLeave.employeeName?.toLowerCase() || "";
          const employeeId = formattedLeave.employeeId?.toLowerCase() || "";
          const reason = formattedLeave.reason?.toLowerCase() || "";
          const department = formattedLeave.department?.toLowerCase() || "";
          
          return employeeName.includes(term) ||
                 employeeId.includes(term) ||
                 reason.includes(term) ||
                 department.includes(term);
        } catch (error) {
          return false;
        }
      });
    }

    return filtered;
  }, [leaves, pendingLeaves, staffMembers, currentUser, viewMode, filterStatus, filterType, searchTerm]);

  const filteredLeaves = getFilteredLeaves();

  const handleApplyLeave = async () => {
    // Validation
    const errors = [];
    if (!leaveForm.leaveType) errors.push("Leave type is required");
    if (!leaveForm.startDate) errors.push("Start date is required");
    if (!leaveForm.endDate) errors.push("End date is required");
    if (!leaveForm.reason) errors.push("Reason is required");

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    if (end < start) {
      alert("End date must be after start date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      alert("Cannot apply for leave in the past");
      return;
    }

    const leaveDays = calculateLeaveDays(leaveForm.startDate, leaveForm.endDate);
    if (leaveDays <= 0) {
      alert("Invalid date range");
      return;
    }

    // Prepare data for API
    const leaveData = {
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      contactInfo: leaveForm.contactInfo || "",
      address: leaveForm.address || "",
      remarks: leaveForm.remarks || "",
    };

    const result = await onApplyLeave(leaveData);
    if (result.success) {
      alert("Leave application submitted successfully!");
      setShowApplyForm(false);
      setLeaveForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        contactInfo: "",
        address: "",
        remarks: ""
      });
      if (onRefresh) await onRefresh();
    } else {
      const errorMsg = result.message || result.error || 'Unknown error';
      alert(`Failed to apply for leave: ${errorMsg}`);
    }
  };

  const handleReviewLeave = async (status) => {
    if (!selectedLeave) return;

    // Prepare payload - backend expects only status
    const reviewData = {
      status: status,
    };

    const result = await onReviewLeave(selectedLeave.id, reviewData);
    if (result.success) {
      alert(`Leave ${status.toLowerCase()} successfully!`);
      setShowViewModal(false);
      setSelectedLeave(null);
      setReviewRemarks("");
      if (onRefresh) await onRefresh();
    } else {
      alert(`Failed to review leave: ${result.error || result.message}`);
    }
  };

  // Quick approve/reject functions
  const handleQuickApprove = async (leaveId) => {
    if (window.confirm("Are you sure you want to approve this leave?")) {
      const result = await onReviewLeave(leaveId, {
        status: 'APPROVED',
      });
      
      if (result.success) {
        alert("Leave approved successfully!");
        if (onRefresh) await onRefresh();
      } else {
        alert(`Failed to approve leave: ${result.error || result.message}`);
      }
    }
  };

  const handleQuickReject = async (leaveId) => {
    const reason = prompt("Please enter reason for rejection:");
    if (reason === null) return; // User cancelled
    
    if (reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }

    const result = await onReviewLeave(leaveId, {
      status: 'REJECTED',
    });
    
    if (result.success) {
      alert("Leave rejected successfully!");
      if (onRefresh) await onRefresh();
    } else {
      alert(`Failed to reject leave: ${result.error || result.message}`);
    }
  };

  const handleUpdateLeave = async () => {
    if (!selectedLeave) return;

    const result = await onUpdateLeave(selectedLeave.id, {
      leaveType: selectedLeave.leaveType,
      startDate: selectedLeave.startDate,
      endDate: selectedLeave.endDate,
      reason: selectedLeave.reason,
      contactInfo: selectedLeave.contactInfo,
      address: selectedLeave.address,
      remarks: selectedLeave.remarks,
    });

    if (result.success) {
      alert("Leave updated successfully!");
      setShowEditModal(false);
      setSelectedLeave(null);
      if (onRefresh) await onRefresh();
    } else {
      alert(`Failed to update leave: ${result.error || result.message}`);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (window.confirm("Are you sure you want to delete this leave record?")) {
      const result = await onDeleteLeave(leaveId);
      if (result.success) {
        alert("Leave record deleted successfully!");
        if (onRefresh) await onRefresh();
      } else {
        alert(`Failed to delete leave: ${result.error || result.message}`);
      }
    }
  };

  const handleViewLeave = async (leaveId) => {
    const result = await onViewLeave(leaveId);
    if (result.success) {
      const formattedLeave = formatLeaveForDisplay(result.data, staffMembers);
      setSelectedLeave(formattedLeave);
      setShowViewModal(true);
    } else {
      const foundLeave = leaves.find(l => l.id === leaveId || l._id === leaveId);
      if (foundLeave) {
        const formattedLeave = formatLeaveForDisplay(foundLeave, staffMembers);
        setSelectedLeave(formattedLeave);
        setShowViewModal(true);
      } else {
        alert(`Failed to load leave details: ${result.error || result.message}`);
      }
    }
  };

  const calculateDays = (startDate, endDate) => {
    return calculateLeaveDays(startDate, endDate);
  };

  // Load staff members on mount
  useEffect(() => {
    if (staffMembers.length === 0 && onRefresh) {
      onRefresh();
    }
  }, []);

  // Apply Leave Form Modal
  const ApplyLeaveForm = () => (
    <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) setShowApplyForm(false);
    }}>
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-content">
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-header">
          <h3>
            <Plus size={20} />
            Apply for Leave
          </h3>
          <button 
            className="staff-attendance-staffleavemanagement-staffleavemanagement-close-button" 
            onClick={() => setShowApplyForm(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-body">
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-row">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>Leave Type *</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                required
              >
                <option value="">Select Leave Type</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-row">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                required
                min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Reason *</label>
            <textarea
              placeholder="Enter reason for leave..."
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
              required
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Contact Information during leave</label>
            <input
              type="text"
              placeholder="Phone number or email"
              value={leaveForm.contactInfo}
              onChange={(e) => setLeaveForm({...leaveForm, contactInfo: e.target.value})}
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Address during leave</label>
            <input
              type="text"
              placeholder="Your address during leave period"
              value={leaveForm.address}
              onChange={(e) => setLeaveForm({...leaveForm, address: e.target.value})}
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Additional Remarks</label>
            <textarea
              placeholder="Any additional information..."
              rows={2}
              value={leaveForm.remarks}
              onChange={(e) => setLeaveForm({...leaveForm, remarks: e.target.value})}
            />
          </div>
          
          {leaveForm.startDate && leaveForm.endDate && (
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-leave-summary">
              <strong>Leave Duration:</strong> {calculateDays(leaveForm.startDate, leaveForm.endDate)} days
            </div>
          )}
        </div>
        
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-footer">
          <button 
            className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary" 
            onClick={() => setShowApplyForm(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleApplyLeave}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Leave Modal
  const EditLeaveForm = () => (
    <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) setShowEditModal(false);
    }}>
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-content">
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-header">
          <h3>
            <Edit size={20} />
            Edit Leave Application
          </h3>
          <button 
            className="staff-attendance-staffleavemanagement-staffleavemanagement-close-button" 
            onClick={() => setShowEditModal(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-body">
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-row">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>Leave Type *</label>
              <select
                value={selectedLeave?.leaveType || ""}
                onChange={(e) => setSelectedLeave({...selectedLeave, leaveType: e.target.value})}
                required
              >
                <option value="">Select Leave Type</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-row">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={selectedLeave?.startDate || ""}
                onChange={(e) => setSelectedLeave({...selectedLeave, startDate: e.target.value})}
                required
              />
            </div>
            
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={selectedLeave?.endDate || ""}
                onChange={(e) => setSelectedLeave({...selectedLeave, endDate: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Reason *</label>
            <textarea
              placeholder="Enter reason for leave..."
              rows={3}
              value={selectedLeave?.reason || ""}
              onChange={(e) => setSelectedLeave({...selectedLeave, reason: e.target.value})}
              required
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Contact Information during leave</label>
            <input
              type="text"
              placeholder="Phone number or email"
              value={selectedLeave?.contactInfo || ""}
              onChange={(e) => setSelectedLeave({...selectedLeave, contactInfo: e.target.value})}
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Address during leave</label>
            <input
              type="text"
              placeholder="Your address during leave period"
              value={selectedLeave?.address || ""}
              onChange={(e) => setSelectedLeave({...selectedLeave, address: e.target.value})}
            />
          </div>
          
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
            <label>Additional Remarks</label>
            <textarea
              placeholder="Any additional information..."
              rows={2}
              value={selectedLeave?.remarks || ""}
              onChange={(e) => setSelectedLeave({...selectedLeave, remarks: e.target.value})}
            />
          </div>
          
          {selectedLeave?.startDate && selectedLeave?.endDate && (
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-leave-summary">
              <strong>Leave Duration:</strong> {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days
            </div>
          )}
        </div>
        
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-footer">
          <button 
            className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary" 
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUpdateLeave}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Application"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="staff-attendance-staffleavemanagement-staffleavemanagement-staff-leave-management">
      {/* Header */}
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-page-header">
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-header-content">
          <div>
            <h1>
              <Calendar size={24} />
              Staff Leave Management
            </h1>
            <p>Manage staff leave applications and approvals</p>
          </div>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-header-actions">
            <button 
              className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary"
              onClick={async () => {
                if (onRefresh) {
                  await onRefresh();
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Refresh
                </>
              )}
            </button>
            <button 
              className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary"
              onClick={() => onExport("csv")}
              disabled={filteredLeaves.length === 0}
            >
              <Download size={18} />
              Export
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowApplyForm(true)}
            >
              <Plus size={18} />
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-quick-stats">
        <div 
          className="stat-card clickable"
          onClick={() => {
            setViewMode('pending');
            setFilterStatus('all');
            setFilterType('all');
            setSearchTerm('');
          }}
          title="Click to view pending approvals"
        >
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-icon" style={{ background: '#fef3c7' }}>
            <ClockIcon size={24} color="#f59e0b" />
          </div>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-info">
            <p className="stat-label">Pending Approvals</p>
            <p className="stat-value">{leaveStats.pending}</p>
          </div>
        </div>

        <div className="stat-card clickable"
          onClick={() => {
            setViewMode('all');
            setFilterStatus('APPROVED');
            setFilterType('all');
            setSearchTerm('');
          }}
          title="Click to view approved leaves"
        >
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-info">
            <p className="stat-label">Approved</p>
            <p className="stat-value">{leaveStats.approved}</p>
          </div>
        </div>

        <div className="stat-card clickable"
          onClick={() => {
            setViewMode('all');
            setFilterStatus('REJECTED');
            setFilterType('all');
            setSearchTerm('');
          }}
          title="Click to view rejected leaves"
        >
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-icon" style={{ background: '#fee2e2' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-info">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{leaveStats.rejected}</p>
          </div>
        </div>

        <div className="stat-card clickable"
          onClick={() => {
            setViewMode('all');
            setFilterStatus('all');
            setFilterType('all');
            setSearchTerm('');
          }}
          title="Click to view all applications"
        >
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-icon" style={{ background: '#dbeafe' }}>
            <FileText size={24} color="#3b82f6" />
          </div>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-stat-info">
            <p className="stat-label">Total Applications</p>
            <p className="stat-value">{leaveStats.total}</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-view-toggle">
        <button
          className={`staff-attendance-staffleavemanagement-staffleavemanagement-view-btn ${viewMode === 'myLeaves' ? 'active' : ''}`}
          onClick={() => setViewMode('myLeaves')}
        >
          My Leaves
        </button>
        
        {canApproveReject && (
          <>
            <button
              className={`staff-attendance-staffleavemanagement-staffleavemanagement-view-btn ${viewMode === 'pending' ? 'active' : ''}`}
              onClick={() => setViewMode('pending')}
            >
              Pending Approvals ({leaveStats.pending})
            </button>
            <button
              className={`staff-attendance-staffleavemanagement-staffleavemanagement-view-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All Leaves
            </button>
          </>
        )}
      </div>

      {/* Search & Filters */}
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-search-filters">
        <form onSubmit={(e) => { e.preventDefault(); }} className="staff-attendance-staffleavemanagement-staffleavemanagement-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by employee name, ID, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="staff-attendance-staffleavemanagement-staffleavemanagement-clear-search"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </form>

        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-filter-controls">
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-filter-group">
            <label>
              <Filter size={16} />
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="staff-attendance-staffleavemanagement-staffleavemanagement-filter-select"
            >
              <option value="all">All Status</option>
              {LEAVE_STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-filter-group">
            <label>Leave Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="staff-attendance-staffleavemanagement-staffleavemanagement-filter-select"
            >
              <option value="all">All Types</option>
              {LEAVE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="staff-attendance-staffleavemanagement-staffleavemanagement-leaves-table-container">
        {loading && leaves.length === 0 ? (
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-loading-state">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-spinner"></div>
            <p>Loading leave records...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-empty-state">
            <FileText size={48} />
            <h3>No Leave Records Found</h3>
            <p>
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? "Try changing your search or filter criteria"
                : viewMode === 'pending' ? 'No pending leaves for approval' :
                  viewMode === 'myLeaves' ? 'You have no leave applications' :
                  'No leave records found'
              }
            </p>
            {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
              <button 
                className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-table-wrapper">
            <div className="table-info">
              Showing {filteredLeaves.length} of {leaves.length} leaves
            </div>
            <table className="staff-attendance-staffleavemanagement-staffleavemanagement-leaves-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => {
                  const formattedLeave = formatLeaveForDisplay(leave, staffMembers);
                  const statusColor = getStatusColor(formattedLeave.status);
                  const typeColor = getTypeColor(formattedLeave.leaveType);
                  const leaveDays = calculateDays(formattedLeave.startDate, formattedLeave.endDate);
                  const isPending = formattedLeave.status === 'PENDING';
                  
                  return (
                    <tr key={formattedLeave.id}>
                      <td className="employee-cell">
                        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-info">
                          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-name-row">
                            <User size={14} />
                            <strong>{formattedLeave.employeeName}</strong>
                            {formattedLeave.employeeId !== "N/A" && (
                              <span className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-id-badge">ID: {formattedLeave.employeeId}</span>
                            )}
                          </div>
                          
                          {formattedLeave.employeeEmail && (
                            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-detail">
                              <Mail size={12} />
                              <span>{formattedLeave.employeeEmail}</span>
                            </div>
                          )}
                          
                          {formattedLeave.employeePhone && (
                            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-detail">
                              <Phone size={12} />
                              <span>{formattedLeave.employeePhone}</span>
                            </div>
                          )}
                          
                          {formattedLeave.department && (
                            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-employee-detail">
                              <span className="staff-attendance-staffleavemanagement-staffleavemanagement-department-badge">{formattedLeave.department}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="type-cell">
                        <span 
                          className="staff-attendance-staffleavemanagement-staffleavemanagement-type-badge"
                          style={{ 
                            backgroundColor: `${typeColor}20`,
                            color: typeColor,
                          }}
                        >
                          {getTypeLabel(formattedLeave.leaveType)}
                        </span>
                      </td>
                      <td className="period-cell">
                        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-period-dates">
                          <div>{formatDateForDisplay(formattedLeave.startDate)}</div>
                          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-to-text">to</div>
                          <div>{formatDateForDisplay(formattedLeave.endDate)}</div>
                        </div>
                      </td>
                      <td className="staff-attendance-staffleavemanagement-staffleavemanagement-days-cell">
                        <strong>{leaveDays}</strong> days
                      </td>
                      <td className="status-cell">
                        <span 
                          className="staff-attendance-staffleavemanagement-staffleavemanagement-status-badge"
                          style={{ 
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {getStatusLabel(formattedLeave.status)}
                        </span>
                      </td>
                      <td className="date-cell">
                        {formatDateForDisplay(formattedLeave.appliedDate)}
                      </td>
                      <td className="reason-cell">
                        <div className="reason-text" title={formattedLeave.reason}>
                          {formattedLeave.reason ? 
                            (formattedLeave.reason.length > 30 ? 
                              formattedLeave.reason.substring(0, 30) + '...' : 
                              formattedLeave.reason) 
                            : '-'}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-action-buttons">
                          {/* View Button */}
                          <button
                            className="staff-attendance-staffleavemanagement-staffleavemanagement-btn-icon staff-attendance-staffleavemanagement-staffleavemanagement-btn-view"
                            onClick={() => {
                              setSelectedLeave(formattedLeave);
                              setShowViewModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Approve/Reject Buttons (only for pending leaves) */}
                          {isPending && canApproveReject && (
                            <>
                              <button
                                className="staff-attendance-staffleavemanagement-staffleavemanagement-btn-icon staff-attendance-staffleavemanagement-staffleavemanagement-btn-approve"
                                onClick={() => handleQuickApprove(formattedLeave.id)}
                                title="Approve Leave"
                                style={{ backgroundColor: '#10b981', color: 'white' }}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="staff-attendance-staffleavemanagement-staffleavemanagement-btn-icon staff-attendance-staffleavemanagement-staffleavemanagement-btn-reject"
                                onClick={() => handleQuickReject(formattedLeave.id)}
                                title="Reject Leave"
                                style={{ backgroundColor: '#ef4444', color: 'white' }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          
                          {/* Edit Button (for owner when pending) */}
                          {isPending && canEditLeave(leave) && (
                            <button
                              className="staff-attendance-staffleavemanagement-staffleavemanagement-btn-icon staff-attendance-staffleavemanagement-staffleavemanagement-btn-edit"
                              onClick={() => {
                                setSelectedLeave(formattedLeave);
                                setShowEditModal(true);
                              }}
                              title="Edit Leave"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          
                          {/* Delete Button (for owner when pending) */}
                          {isPending && canDeleteLeave(leave) && (
                            <button
                              className="staff-attendance-staffleavemanagement-staffleavemanagement-btn-icon staff-attendance-staffleavemanagement-staffleavemanagement-btn-delete"
                              onClick={() => handleDeleteLeave(formattedLeave.id)}
                              title="Delete Leave"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View/Review Modal */}
      {showViewModal && selectedLeave && (
        <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowViewModal(false);
        }}>
          <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-content">
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-header">
              <h3>
                <Eye size={20} />
                Leave Details {selectedLeave.status === 'PENDING' && canApproveReject && "(Review)"}
              </h3>
              <button 
                className="staff-attendance-staffleavemanagement-staffleavemanagement-close-button" 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedLeave(null);
                  setReviewRemarks("");
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-body">
              <div className="staff-attendance-staffleavemanagement-staffleavemanagement-details-grid">
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Employee:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">
                    <strong>{selectedLeave.employeeName}</strong>
                    {selectedLeave.employeeId !== "N/A" && ` (${selectedLeave.employeeId})`}
                  </span>
                </div>
                
                {selectedLeave.department && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Department:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.department}</span>
                  </div>
                )}
                
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Leave Type:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-type-badge" style={{ 
                      backgroundColor: `${getTypeColor(selectedLeave.leaveType)}20`,
                      color: getTypeColor(selectedLeave.leaveType),
                    }}>
                      {getTypeLabel(selectedLeave.leaveType)}
                    </span>
                  </span>
                </div>
                
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Status:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-status-badge" style={{ 
                      backgroundColor: `${getStatusColor(selectedLeave.status)}20`,
                      color: getStatusColor(selectedLeave.status),
                    }}>
                      {getStatusLabel(selectedLeave.status)}
                    </span>
                  </span>
                </div>
                
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Period:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">
                    {formatDateForDisplay(selectedLeave.startDate)} to {formatDateForDisplay(selectedLeave.endDate)}
                    <br />
                    <small>({calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days)</small>
                  </span>
                </div>
                
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Applied On:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">
                    {formatDateForDisplay(selectedLeave.appliedDate)}
                  </span>
                </div>
                
                {selectedLeave.employeeEmail && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Email:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.employeeEmail}</span>
                  </div>
                )}
                
                {selectedLeave.employeePhone && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Phone:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.employeePhone}</span>
                  </div>
                )}
                
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item full-width">
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Reason:</span>
                  <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.reason || "No reason provided"}</span>
                </div>
                
                {selectedLeave.address && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Address during leave:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.address}</span>
                  </div>
                )}
                
                {selectedLeave.remarks && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Remarks:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.remarks}</span>
                  </div>
                )}
                
                {selectedLeave.reviewRemarks && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Review Remarks:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.reviewRemarks}</span>
                  </div>
                )}
                
                {selectedLeave.reviewedBy && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Reviewed By:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{selectedLeave.reviewedBy}</span>
                  </div>
                )}
                
                {selectedLeave.reviewedAt && (
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-item">
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-label">Reviewed At:</span>
                    <span className="staff-attendance-staffleavemanagement-staffleavemanagement-detail-value">{formatDateForDisplay(selectedLeave.reviewedAt)}</span>
                  </div>
                )}
              </div>
              
              {/* Show review section only for pending leaves if user can approve/reject */}
              {selectedLeave.status === 'PENDING' && canApproveReject && (
                <div className="staff-attendance-staffleavemanagement-staffleavemanagement-review-section">
                  <h4>Review Action</h4>
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-form-group">
                    <label>Review Remarks (Optional)</label>
                    <textarea
                      placeholder="Enter review remarks here..."
                      rows={3}
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                    />
                  </div>
                  
                  <div className="staff-attendance-staffleavemanagement-staffleavemanagement-review-actions">
                    <button 
                      className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-secondary" 
                      onClick={() => {
                        setShowViewModal(false);
                        setSelectedLeave(null);
                        setReviewRemarks("");
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => {
                        handleReviewLeave('REJECTED');
                      }}
                    >
                      <X size={16} />
                      Reject
                    </button>
                    <button 
                      className="btn staff-attendance-staffleavemanagement-staffleavemanagement-btn-success" 
                      onClick={() => {
                        handleReviewLeave('APPROVED');
                      }}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedLeave.status !== 'PENDING' && (
              <div className="staff-attendance-staffleavemanagement-staffleavemanagement-modal-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedLeave(null);
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Form Modal */}
      {showApplyForm && <ApplyLeaveForm />}

      {/* Edit Leave Form Modal */}
      {showEditModal && selectedLeave && <EditLeaveForm />}
    </div>
  );
};

export default StaffLeaveManagement;