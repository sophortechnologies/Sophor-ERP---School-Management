// src/modules/staff/pages/StaffManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  UserPlus,
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  UserX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStaff } from "../hooks/useStaff";
import { StaffForm } from "../components";
import { STAFF_ROLES } from "../constants";

const StaffManagement = () => {
  const navigate = useNavigate();
  const {
    staff,
    loading,
    error,
    stats,
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    searchStaff,
    loadStaff,
  } = useStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize filtered staff
  useEffect(() => {
    setFilteredStaff(staff);
    setCurrentPage(1); // Reset to first page when staff changes
  }, [staff]);

  // Apply filters
  // Apply filters
  useEffect(() => {
    let result = [...staff];

    if (selectedStatus !== "all") {
      result = result.filter((s) => s.status === selectedStatus.toUpperCase());
    }

    if (selectedRole !== "all") {
      result = result.filter(
        (s) =>
          s.designation?.toLowerCase() === selectedRole.toLowerCase() ||
          s.role?.toLowerCase() === selectedRole.toLowerCase(),
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const fullName =
          `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
        return (
          fullName.includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.phone?.toLowerCase().includes(term) ||
          s.staffId?.toLowerCase().includes(term) ||
          s.designation?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredStaff(result);
    setCurrentPage(1);
  }, [staff, searchTerm, selectedRole, selectedStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchStaff(searchTerm);
    } else {
      await loadStaff();
    }
  };

  // Clear search
  const handleClearSearch = async () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    await loadStaff();
  };

  // Handle Enter key press in search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Click on stat cards to filter
  const handleTotalStaffClick = () => {
    setSelectedStatus("all");
    setSelectedRole("all");
    setSearchTerm("");
  };

  const handleActiveStaffClick = () => {
    setSelectedStatus("ACTIVE");
    setSelectedRole("all");
    setSearchTerm("");
  };

  const handleInactiveStaffClick = () => {
    setSelectedStatus("INACTIVE");
    setSelectedRole("all");
    setSearchTerm("");
  };

  // Staff form handlers
  const handleCreateStaff = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staffMember) => {
    const name =
      staffMember.fullName ||
      `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim() ||
      staffMember.staffId ||
      "this staff member";
    if (
      window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    ) {
      try {
        const result = await deleteStaff(staffMember.id);

        if (result.success) {
          alert("Staff member deleted successfully!");
          await loadStaff();
        } else {
          alert(result.error || "Failed to delete staff member");
        }
      } catch (error) {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    const result = await updateStaffStatus(staffId, newStatus.toUpperCase());
    if (!result.success) {
      alert(result.error || "Failed to update status");
    }
  };

  const handleSubmitStaff = async (formData, backendData) => {
    const dataToSend = backendData || formData;

    const result = editingStaff
      ? await updateStaff(editingStaff.id, dataToSend)
      : await createStaff(dataToSend);

    if (result.success) {
      alert(result.message || "Staff saved successfully!");
      setShowStaffModal(false);
      await loadStaff();
    } else {
      alert(result.error || "Failed to save staff");
    }
  };

  // View staff details
  const handleViewDetails = (staffMember) => {
    navigate(`${staffMember.id}`);
  };

  // Export functionality
  const handleExport = (type) => {
    if (filteredStaff.length === 0) {
      alert("No staff data to export.");
      return;
    }

    if (type === "csv") {
      exportToCSV();
    } else if (type === "pdf") {
      handlePrint();
    }

    setShowExportDropdown(false);
  };

  // CSV Export function
  const exportToCSV = () => {
    const headers = [
      "Staff ID",
      "Name",
      "Email",
      "Phone",
      "Designation",
      "Employment Type",
      "Status",
      "Join Date",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStaff.map((staff) => {
        const fullName =
          `${staff.firstName || ""} ${staff.lastName || ""}`.trim();
        return [
          staff.staffId || "N/A",
          `"${fullName}"`.replace(/"/g, '""'),
          staff.email || "N/A",
          staff.phone || "N/A",
          staff.designation || "N/A",
          staff.employmentType || "N/A",
          staff.status || "N/A",
          staff.joinDate || "N/A",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `staff_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print staff list with bigger logo
  const handlePrint = () => {
    if (filteredStaff.length === 0) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Staff Report - ${new Date().toLocaleDateString()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
          body { padding: 40px; color: #333; background: #fff; }
          .report-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #172b4c; }
          .logo-container { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
          .logo { height: 80px; } /* BIGGER LOGO */
          .school-name { font-size: 24px; font-weight: bold; color: #172b4c; }
          .report-title { font-size: 20px; font-weight: 600; color: #1b633b; margin: 20px 0; }
          .report-meta { display: flex; justify-content: center; gap: 30px; color: #666; font-size: 14px; margin-bottom: 20px; }
          .stats-summary { display: flex; gap: 30px; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; justify-content: center; }
          .stat-box { text-align: center; }
          .stat-value { font-size: 22px; font-weight: bold; color: #172b4c; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #172b4c; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 12px; }
          .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; }
          .active { background: #d4edda; color: #155724; }
          .inactive { background: #f8d7da; color: #721c24; }
          .report-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #172b4c; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="logo-container">
            <div>
              <h1 class="school-name">SCHOOL MANAGEMENT SYSTEM</h1>
              <p>Staff Members Report</p>
            </div>
          </div>
          
          <div class="report-meta">
            <div>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            <div>Report ID: STF-${Date.now().toString().slice(-6)}</div>
          </div>
          
          <div class="stats-summary">
            <div class="stat-box">
              <div class="stat-value">${filteredStaff.length}</div>
              <div class="stat-label">Total Staff</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${filteredStaff.filter((s) => s.status === "ACTIVE").length}</div>
              <div class="stat-label">Active Staff</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${filteredStaff.filter((s) => s.status === "INACTIVE").length}</div>
              <div class="stat-label">Inactive Staff</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Designation</th>
              <th>Employment</th>
              <th>Status</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStaff
              .map((member) => {
                const fullName =
                  `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                  "Unnamed Staff";
                return `
                <tr>
                  <td>${member.staffId || "N/A"}</td>
                  <td>${fullName}</td>
                  <td>${member.email || "N/A"}</td>
                  <td>${member.phone || "N/A"}</td>
                  <td>${member.designation || "N/A"}</td>
                  <td>${member.employmentType || "N/A"}</td>
                  <td><span class="status-badge ${member.status === "ACTIVE" ? "active" : "inactive"}">${member.status || "N/A"}</span></td>
                  <td>${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : "N/A"}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
        
        <div class="report-footer">
          <p>© ${new Date().getFullYear()} School Management System</p>
          <div style="margin-top: 30px; display: flex; justify-content: space-between;">
            <div style="width: 200px; text-align: center;">
              <div style="border-top: 1px solid #000; margin: 40px auto 10px; width: 80%;"></div>
              <div>HR Manager</div>
            </div>
            <div style="width: 200px; text-align: center;">
              <div style="border-top: 1px solid #000; margin: 40px auto 10px; width: 80%;"></div>
              <div>Principal</div>
            </div>
          </div>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1b633b; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
        
        <script>
          window.onload = function() { setTimeout(() => window.print(), 500); };
          window.onafterprint = function() { setTimeout(() => window.close(), 500); };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center gap-5 z-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading staff data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center gap-6 z-50">
        <p className="text-red-600 font-medium text-center max-w-md">
          Error: {error}
        </p>
        <button
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-all duration-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main scrollable container */}
      <div className="flex-1 overflow-y-auto">
        {/* Page Header with Gradient - SAME AS STUDENT PAGE */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={24} />
              <div>
                <h1 className="text-xl font-semibold">Staff Management</h1>
                <p className="text-white/80 text-sm">
                  Manage school staff members and their information
                </p>
              </div>
            </div>
            <button
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-white/20"
              onClick={handleCreateStaff}
            >
              <UserPlus size={18} />
              Add Staff
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className={`bg-white rounded-xl border p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-primary hover:shadow-md ${
                selectedStatus === "all" &&
                selectedRole === "all" &&
                !searchTerm
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
              onClick={handleTotalStaffClick}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Total Staff
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>

            <div
              className={`bg-white rounded-xl border p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-green-500 hover:shadow-md ${
                selectedStatus === "ACTIVE"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
              onClick={handleActiveStaffClick}
            >
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Briefcase size={24} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Active Staff
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>

            <div
              className={`bg-white rounded-xl border p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-gray-500 hover:shadow-md ${
                selectedStatus === "INACTIVE"
                  ? "border-gray-500 bg-gray-50"
                  : "border-gray-200"
              }`}
              onClick={handleInactiveStaffClick}
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <UserX size={24} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Inactive Staff
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Section */}
            <div className="flex-1">
              <div className="bg-white border border-gray-300 rounded-xl flex items-center gap-3 p-2 max-w-2xl">
                <Search
                  size={20}
                  className="text-gray-400 ml-2 flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or staff ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 py-3 px-2 border-none outline-none text-gray-700 placeholder-gray-500"
                />
                <button
                  className="px-5 py-2.5 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-600 transition-all duration-200 flex-shrink-0"
                  onClick={handleSearch}
                >
                  Search
                </button>
                {(searchTerm ||
                  selectedRole !== "all" ||
                  selectedStatus !== "all") && (
                  <button
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-300 flex-shrink-0"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[140px]"
              >
                <option value="all">All Roles</option>
                {STAFF_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  className="px-5 py-2.5 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-600 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  onBlur={() =>
                    setTimeout(() => setShowExportDropdown(false), 200)
                  }
                >
                  <Download size={18} />
                  Export
                  <ChevronDown size={16} />
                </button>

                {showExportDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                    >
                      <Download size={16} className="text-gray-500" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <FileText size={16} className="text-gray-500" />
                      Export as PDF/Print
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users size={22} className="text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Staff Members
                    <span className="ml-3 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {filteredStaff.length} staff
                      {(searchTerm ||
                        selectedRole !== "all" ||
                        selectedStatus !== "all") &&
                        " (filtered)"}
                    </span>
                  </h2>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {Math.min(itemsPerPage, currentStaff.length)} of{" "}
                  {filteredStaff.length} staff members
                </div>
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="py-20 text-center">
                <Users size={56} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Staff Members Found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm ||
                  selectedRole !== "all" ||
                  selectedStatus !== "all"
                    ? "Try changing your search or filters"
                    : "Get started by adding your first staff member"}
                </p>
                <button
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 mx-auto"
                  onClick={handleCreateStaff}
                >
                  <UserPlus size={18} />
                  Add First Staff
                </button>
              </div>
            ) : (
              <>
                {/* Table Container */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Staff ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Employment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStaff.map((staffMember) => {
                        const currentStatus = (
                          staffMember.status || "ACTIVE"
                        ).toUpperCase();
                        const fullName =
                          `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim() ||
                          "Unnamed Staff";

                        return (
                          <tr
                            key={staffMember.id || staffMember.staffId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono font-semibold text-primary text-sm">
                                {staffMember.staffId || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {fullName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {staffMember.email || "No email"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {staffMember.phone || "No phone"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold">
                                {staffMember.designation ||
                                  staffMember.role ||
                                  "Not specified"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {staffMember.employmentType
                                    ? staffMember.employmentType.replace(
                                        /_/g,
                                        " ",
                                      )
                                    : "Not specified"}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Calendar size={12} />
                                  <span>
                                    {staffMember.joinDate
                                      ? new Date(
                                          staffMember.joinDate,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={currentStatus}
                                onChange={(e) =>
                                  handleStatusChange(
                                    staffMember.id,
                                    e.target.value,
                                  )
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30 ${
                                  currentStatus === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                  onClick={() => handleViewDetails(staffMember)}
                                  title="View details"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                  onClick={() => handleEditStaff(staffMember)}
                                  title="Edit staff"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="p-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                  onClick={() => handleDeleteStaff(staffMember)}
                                  title="Delete staff"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                      className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : "text-gray-700 hover:bg-white hover:border-gray-400"
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:bg-white hover:border hover:border-gray-300"
                              }`}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : "text-gray-700 hover:bg-white hover:border-gray-400"
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Staff Form Modal */}
      <StaffForm
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSubmit={handleSubmitStaff}
        initialData={editingStaff}
      />
    </div>
  );
};

export default StaffManagement;
