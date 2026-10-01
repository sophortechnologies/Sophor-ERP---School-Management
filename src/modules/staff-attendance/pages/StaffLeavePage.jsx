// src/modules/staff-attendance/pages/StaffLeavePage.jsx
import React, { useCallback } from 'react';
import { useStaffLeave } from '../hooks/useStaffLeave';
import StaffLeaveManagement from '../components/StaffLeaveManagement/StaffLeaveManagement';
import './StaffLeavePage.css';

const StaffLeavePage = () => {
  const {
    leaves,
    pendingLeaves,
    staffMembers,
    loading,
    error,
    stats,
    refreshData,
    applyForLeave,
    updateLeave,
    reviewLeave,
    deleteLeave,
    getLeaveById,
    exportLeaveData,
    searchLeaves,
  } = useStaffLeave();

  // Wrap handlers in useCallback to prevent unnecessary re-renders
  const handleApplyLeave = useCallback(async (leaveData) => {
    const result = await applyForLeave(leaveData);
    if (result.success) {
      // Don't call refreshData here - it's already handled in the hook
    }
    return result;
  }, [applyForLeave]);

  const handleReviewLeave = useCallback(async (leaveId, reviewData) => {
    const result = await reviewLeave(leaveId, reviewData);
    return result;
  }, [reviewLeave]);

  const handleUpdateLeave = useCallback(async (leaveId, leaveData) => {
    const result = await updateLeave(leaveId, leaveData);
    return result;
  }, [updateLeave]);

  const handleDeleteLeave = useCallback(async (leaveId) => {
    const result = await deleteLeave(leaveId);
    return result;
  }, [deleteLeave]);

  const handleViewLeave = useCallback(async (leaveId) => {
    const result = await getLeaveById(leaveId);
    if (result.success) {
      alert(`Leave Details:\nEmployee: ${result.data.employeeName}\nType: ${result.data.leaveType}\nStatus: ${result.data.status}`);
    } else {
      alert(`Failed to load leave details: ${result.error}`);
    }
    return result;
  }, [getLeaveById]);

  const handleExport = useCallback((format) => {
    exportLeaveData(format, leaves);
  }, [exportLeaveData, leaves]);

  const handleSearch = useCallback(async (params) => {
    return await searchLeaves(params);
  }, [searchLeaves]);

  // Use useCallback for refresh to prevent infinite loops
  const handleRefresh = useCallback(async () => {
    if (!loading) {
      await refreshData();
    }
  }, [refreshData, loading]);

  console.log("StaffLeavePage rendering", { loading, leavesCount: leaves.length });

  return (
    <div className="staff-attendance-staffleavepage-staff-leave-page">
      <StaffLeaveManagement
        leaves={leaves}
        pendingLeaves={pendingLeaves}
        staffMembers={staffMembers}
        loading={loading}
        onApplyLeave={handleApplyLeave}
        onReviewLeave={handleReviewLeave}
        onUpdateLeave={handleUpdateLeave}
        onDeleteLeave={handleDeleteLeave}
        onViewLeave={handleViewLeave}
        onExport={handleExport}
        onRefresh={handleRefresh} // Pass the memoized handler
        onSearch={handleSearch}
      />
      
      {error && (
        <div className="staff-attendance-staffleavepage-error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default StaffLeavePage;