import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  X,
  Send,
  Check,
  Ban,
  Snowflake,
  ArrowRight,
  RefreshCw,
  Sun,
} from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import {
  BUDGET_CATEGORIES,
  BUDGET_STATUSES,
  FISCAL_YEARS,
} from "../constants/budget.constants";
import BudgetForm from "../components/BudgetForm";
import BudgetDetailsModal from "../components/BudgetDetailsModal";
import TransferModal from "../components/TransferModal";
import { budgetApi } from "../api/budget.api";
import "./BudgetManagement.css";

const BudgetManagement = () => {
  const {
    budgets,
    loading,
    error,
    stats,
    pagination,
    activeAlerts,
    pendingTransfers,
    selectedFiscalYear,
    setSelectedFiscalYear,
    loadBudgets,
    loadDashboardStats,
    loadPendingTransfers,
    deleteBudget,
    submitBudget,
    approveBudget,
    rejectBudget,
    freezeBudget,
    approveTransfer,
    executeTransfer,
    resolveAlert,
    exportReport,
  } = useBudget();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudgetForAction, setSelectedBudgetForAction] = useState(null);
  const [selectedTransferForAction, setSelectedTransferForAction] =
    useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("budgets");
  const itemsPerPage = 10;
  // Add this with other state declarations (around line 40)
  const [allTransfers, setAllTransfers] = useState([]);
  const [loadingAllTransfers, setLoadingAllTransfers] = useState(false);
  useEffect(() => {
    const params = {
      page: currentPage,
      page_size: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory !== "all" && { category: selectedCategory }),
      ...(selectedStatus !== "all" && { status: selectedStatus }),
    };
    loadBudgets(params);
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedFiscalYear,
    loadBudgets,
  ]);
  useEffect(() => {
    if (activeTab === "transfers") {
      loadAllTransfers();
    }
  }, [selectedFiscalYear, activeTab]);
  const filteredBudgets = budgets.filter((budget) => {
    if (!budget) return false;
    const matchesSearch =
      !searchTerm ||
      budget.budgetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || budget.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || budget.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  // Add this function after loadAllTransfers (around line 60)
  const loadAllTransfers = async () => {
    setLoadingAllTransfers(true);
    try {
      const response = await budgetApi.getAllTransfers();
      if (response.success && response.data) {
        const allData = Array.isArray(response.data) ? response.data : [];

        // Filter transfers by selected fiscal year
        const filteredTransfers = allData.filter((transfer) => {
          // Check if fromBudget or toBudget matches the selected fiscal year
          return (
            transfer.fromBudget?.fiscalYear === selectedFiscalYear ||
            transfer.toBudget?.fiscalYear === selectedFiscalYear
          );
        });

        console.log(
          `📊 Transfers for ${selectedFiscalYear}:`,
          filteredTransfers.length,
        );
        setAllTransfers(filteredTransfers);
      } else {
        setAllTransfers([]);
      }
    } catch (error) {
      console.error("Error loading transfers:", error);
      setAllTransfers([]);
    } finally {
      setLoadingAllTransfers(false);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = BUDGET_STATUSES.find((s) => s.value === status);
    const color = statusConfig?.color || "#6b7280";
    return (
      <span
        className="budget-budgetmanagement-status-badge"
        style={{
          backgroundColor: `${color}10`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const getCategoryInfo = (category) => {
    const cat = BUDGET_CATEGORIES.find((c) => c.value === category);
    return cat || { label: category, color: "#6b7280" };
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 100) return "#ef4444";
    if (percentage >= 80) return "#f59e0b";
    return "#10b981";
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleViewBudget = (budget) => {
    setSelectedBudgetForAction(budget);
    setShowDetailsModal(true);
  };

  const handleDeleteBudget = async (budget) => {
    if (
      !confirm(`Are you sure you want to delete budget "${budget.budgetCode}"?`)
    )
      return;
    const result = await deleteBudget(budget.id);
    if (result.success) {
      setSuccessMessage(`Budget "${budget.budgetCode}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to delete budget");
    }
  };

  const handleSubmitBudget = async (budget) => {
    if (!confirm(`Submit budget "${budget.budgetCode}" for approval?`)) return;
    const result = await submitBudget(budget.id);
    if (result.success) {
      setSuccessMessage(
        `Budget "${budget.budgetCode}" submitted for approval!`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to submit budget");
    }
  };

  const handleApproveBudget = async (budget) => {
    if (!confirm(`Approve budget "${budget.budgetCode}"?`)) return;
    const result = await approveBudget(budget.id);
    if (result.success) {
      setSuccessMessage(`Budget "${budget.budgetCode}" approved!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to approve budget");
    }
  };

  const handleRejectBudget = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    const result = await rejectBudget(
      selectedBudgetForAction?.id,
      rejectReason,
    );
    if (result.success) {
      setSuccessMessage(
        `Budget "${selectedBudgetForAction?.budgetCode}" rejected!`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowRejectModal(false);
      setRejectReason("");
    } else {
      alert(result.error || "Failed to reject budget");
    }
  };

  const handleFreezeBudget = async (budget) => {
    if (!confirm(`Freeze budget "${budget.budgetCode}"?`)) return;
    const result = await freezeBudget(budget.id);
    if (result.success) {
      setSuccessMessage(`Budget "${budget.budgetCode}" frozen!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to freeze budget");
    }
  };

  const handleUnfreezeBudget = async (budget) => {
    if (!confirm(`Unfreeze budget "${budget.budgetCode}"?`)) return;
    try {
      const response = await budgetApi.unfreezeBudget(budget.id);
      if (response.success) {
        setSuccessMessage(`Budget "${budget.budgetCode}" unfrozen!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        loadBudgets();
        loadDashboardStats();
      } else {
        alert(response.error || "Failed to unfreeze budget");
      }
    } catch (error) {
      alert(error.message || "Failed to unfreeze budget");
    }
  };

  const handleApproveTransfer = async (transfer) => {
    if (!confirm(`Approve transfer ${transfer.transferNumber}?`)) return;
    const result = await approveTransfer(transfer.id);
    if (result.success) {
      setSuccessMessage(
        `Transfer ${transfer.transferNumber} approved! Click Execute to move money.`,
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      await loadAllTransfers(); // Load all transfers including approved ones
      await loadPendingTransfers(); // Also refresh pending count
    } else {
      alert(result.error || "Failed to approve transfer");
    }
  };

  const handleRejectTransfer = async (transfer) => {
    if (!confirm(`Reject transfer ${transfer.transferNumber}?`)) return;
    try {
      const response = await budgetApi.rejectTransfer(
        transfer.id,
        "Rejected by administrator",
      );
      if (response.success) {
        setSuccessMessage(`Transfer ${transfer.transferNumber} rejected!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        await loadAllTransfers();
        await loadPendingTransfers();
      } else {
        alert(response.error || "Failed to reject transfer");
      }
    } catch (error) {
      alert(error.message || "Failed to reject transfer");
    }
  };

  const handleExecuteTransfer = async (transfer) => {
    if (
      !confirm(
        `Execute transfer ${transfer.transferNumber}? This will move ${formatCurrency(transfer.amount)} from ${transfer.fromBudget?.budgetCode} to ${transfer.toBudget?.budgetCode}.`,
      )
    )
      return;
    const result = await executeTransfer(transfer.id);
    if (result.success) {
      setSuccessMessage(
        `Transfer ${transfer.transferNumber} executed! Money has been moved.`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      await loadAllTransfers();
      await loadPendingTransfers();
      await loadBudgets();
      await loadDashboardStats();
    } else {
      alert(result.error || "Failed to execute transfer");
    }
  };
  const handleRefundTransfer = async (transfer) => {
    if (
      !confirm(
        `Refund transfer ${transfer.transferNumber}? This will reverse the money back to the source budget.`,
      )
    )
      return;

    try {
      const response = await budgetApi.refundTransfer(transfer.id);
      if (response.success) {
        setSuccessMessage(
          `Transfer ${transfer.transferNumber} refunded! Money has been moved back.`,
        );
        setTimeout(() => setSuccessMessage(""), 3000);
        await loadAllTransfers();
        await loadPendingTransfers();
        await loadBudgets();
        await loadDashboardStats();
      } else {
        alert(response.error || "Failed to refund transfer");
      }
    } catch (error) {
      alert(error.message || "Failed to refund transfer");
    }
  };
  const handleDeleteTransfer = async (transfer) => {
    if (
      !confirm(
        `Delete transfer ${transfer.transferNumber}? This action cannot be undone.`,
      )
    )
      return;

    try {
      const response = await budgetApi.deleteTransfer(transfer.id);
      if (response.success) {
        setSuccessMessage(`Transfer ${transfer.transferNumber} deleted!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        await loadAllTransfers();
        await loadPendingTransfers();
      } else {
        alert(response.error || "Failed to delete transfer");
      }
    } catch (error) {
      alert(error.message || "Failed to delete transfer");
    }
  };
  const handleResolveAlert = async (alert) => {
    if (!confirm(`Resolve alert for ${alert.budget?.budgetCode}?`)) return;
    const result = await resolveAlert(alert.id);
    if (result.success) {
      setSuccessMessage(`Alert resolved!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to resolve alert");
    }
  };

  const handleExportReport = async (format) => {
    const result = await exportReport({
      fiscalYear: selectedFiscalYear,
      format: format,
      type: "budget_vs_actual",
    });
    if (!result.success) {
      alert(result.message || "Failed to export report");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="budget-budgetmanagement-loading-container">
        <div className="budget-budgetmanagement-spinner"></div>
        <p>Loading budget data...</p>
      </div>
    );
  }

  return (
    <div className="budget-budgetmanagement-budget-management-page">
      {/* Header */}
      <div className="budget-budgetmanagement-page-header">
        <div className="budget-budgetmanagement-header-content">
          <div>
            <h1>
              <DollarSign size={24} /> Budget Management
            </h1>
            <p>Manage budgets, track spending, and monitor utilization</p>
            {successMessage && (
              <div className="success-message">
                <CheckCircle size={14} /> {successMessage}
              </div>
            )}
          </div>
          <div className="budget-budgetmanagement-header-buttons">
            <div className="budget-budgetmanagement-fiscal-year-selector">
              <label>
                <Calendar size={16} /> Fiscal Year
              </label>
              <select
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="budget-budgetmanagement-fiscal-select"
              >
                {FISCAL_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn budget-budgetmanagement-btn-secondary"
              onClick={() => setShowTransferModal(true)}
            >
              <ArrowRight size={18} /> Request Transfer
            </button>
            <button
              className="btn budget-budgetmanagement-btn-secondary"
              onClick={() => handleExportReport("excel")}
            >
              <Download size={18} /> Export
            </button>
            <button className="btn btn-primary" onClick={handleCreateBudget}>
              <Plus size={18} /> Create Budget
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>
            <DollarSign size={24} color="#3b82f6" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Budget</p>
            <p className="stat-value">{formatCurrency(stats.totalBudget)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}>
            <TrendingUp size={24} color="#f59e0b" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Committed + Actual</p>
            <p className="stat-value">
              {formatCurrency(
                (stats.totalCommitted || 0) + (stats.totalActual || 0),
              )}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>
            <TrendingDown size={24} color="#10b981" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Available</p>
            <p className="stat-value">
              {formatCurrency(stats.totalAvailable || 0)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Active Alerts</p>
            <p className="stat-value">{stats.activeAlerts || 0}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="budget-budgetmanagement-tab-navigation">
        <button
          className={`budget-budgetmanagement-tab-btn ${activeTab === "budgets" ? "active" : ""}`}
          onClick={() => setActiveTab("budgets")}
        >
          <DollarSign size={18} /> Budgets ({filteredBudgets.length})
        </button>
        <button
          className={`budget-budgetmanagement-tab-btn ${activeTab === "transfers" ? "active" : ""}`}
          onClick={() => setActiveTab("transfers")}
        >
          <ArrowRight size={18} /> Transfers ({pendingTransfers?.length || 0})
        </button>
        <button
          className={`budget-budgetmanagement-tab-btn ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          <AlertTriangle size={18} /> Alerts ({activeAlerts?.length || 0})
        </button>
      </div>

      {/* Budgets Tab */}
      {activeTab === "budgets" && (
        <>
          <div className="budget-budgetmanagement-action-bar">
            <div className="budget-budgetmanagement-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="budget-budgetmanagement-filter-group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="budget-budgetmanagement-filter-select"
              >
                <option value="all">All Categories</option>
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="budget-budgetmanagement-filter-select"
              >
                <option value="all">All Status</option>
                {BUDGET_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {(searchTerm ||
                selectedCategory !== "all" ||
                selectedStatus !== "all") && (
                <button className="btn budget-budgetmanagement-btn-secondary" onClick={clearFilters}>
                  <X size={16} /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="budget-budgetmanagement-content-card">
            <div className="card-header">
              <h2>
                <DollarSign size={20} /> Budgets{" "}
                <span className="budget-budgetmanagement-count-badge">
                  {filteredBudgets.length} of {budgets.length}
                </span>
              </h2>
            </div>
            <div className="budget-budgetmanagement-table-container">
              {filteredBudgets.length === 0 ? (
                <div className="budget-budgetmanagement-empty-state">
                  <DollarSign size={48} />
                  <h3>No Budgets Found</h3>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateBudget}
                  >
                    <Plus size={18} /> Create Budget
                  </button>
                </div>
              ) : (
                <table className="budget-budgetmanagement-data-table">
                  <thead>
                    <tr>
                      <th>Budget Code</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Allocated</th>
                      <th>Committed</th>
                      <th>Actual</th>
                      <th>Available</th>
                      <th>Utilization</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBudgets.map((budget) => {
                      const allocated = budget.allocatedAmount || 0;
                      const committed = budget.committedAmount || 0;
                      const actual = budget.actualAmount || 0;
                      const utilization =
                        allocated > 0
                          ? ((actual + committed) / allocated) * 100
                          : 0;
                      const categoryInfo = getCategoryInfo(budget.category);
                      return (
                        <tr key={budget.id}>
                          <td>
                            <span className="budget-budgetmanagement-budget-code">
                              {budget.budgetCode}
                            </span>
                          </td>
                          <td>
                            <span
                              className="budget-budgetmanagement-category-badge"
                              style={{
                                backgroundColor: `${categoryInfo.color}15`,
                                color: categoryInfo.color,
                              }}
                            >
                              {categoryInfo.icon} {categoryInfo.label}
                            </span>
                          </td>
                          <td>{budget.department?.name || "Institution"}</td>
                          <td>{formatCurrency(allocated)}</td>
                          <td>{formatCurrency(committed)}</td>
                          <td>{formatCurrency(actual)}</td>
                          <td>{formatCurrency(budget.availableAmount)}</td>
                          <td>
                            <div className="budget-budgetmanagement-utilization-bar">
                              <div
                                className="budget-budgetmanagement-utilization-fill"
                                style={{
                                  width: `${Math.min(utilization, 100)}%`,
                                  backgroundColor:
                                    getUtilizationColor(utilization),
                                }}
                              />
                              <span className="budget-budgetmanagement-utilization-text">
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td>{getStatusBadge(budget.status)}</td>
                          <td>
                            <div className="budget-budgetmanagement-action-buttons">
                              <button
                                className="budget-budgetmanagement-btn-icon"
                                onClick={() => handleViewBudget(budget)}
                              >
                                <Eye size={16} />
                              </button>
                              {budget.status === "DRAFT" && (
                                <>
                                  <button
                                    className="budget-budgetmanagement-btn-icon"
                                    onClick={() => handleEditBudget(budget)}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    className="budget-budgetmanagement-btn-icon"
                                    onClick={() => handleSubmitBudget(budget)}
                                  >
                                    <Send size={16} />
                                  </button>
                                </>
                              )}
                              {budget.status === "SUBMITTED" && (
                                <>
                                  <button
                                    className="budget-budgetmanagement-btn-icon success"
                                    onClick={() => handleApproveBudget(budget)}
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    className="budget-budgetmanagement-btn-icon danger"
                                    onClick={() => {
                                      setSelectedBudgetForAction(budget);
                                      setShowRejectModal(true);
                                    }}
                                  >
                                    <Ban size={16} />
                                  </button>
                                </>
                              )}
                              {budget.status === "APPROVED" && (
                                <button
                                  className="budget-budgetmanagement-btn-icon"
                                  onClick={() => handleFreezeBudget(budget)}
                                >
                                  <Snowflake size={16} />
                                </button>
                              )}
                              {budget.status === "FROZEN" && (
                                <button
                                  className="budget-budgetmanagement-btn-icon"
                                  onClick={() => handleUnfreezeBudget(budget)}
                                >
                                  <Sun size={16} />
                                </button>
                              )}
                              {budget.status === "DRAFT" && (
                                <button
                                  className="budget-budgetmanagement-btn-icon danger"
                                  onClick={() => handleDeleteBudget(budget)}
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
              )}
            </div>
            {pagination.totalPages > 1 && (
              <div className="budget-budgetmanagement-pagination">
                <button
                  className="budget-budgetmanagement-pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
                <span className="budget-budgetmanagement-pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="budget-budgetmanagement-pagination-btn"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1),
                    )
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Transfers Tab */}
      {activeTab === "transfers" && (
        <div className="budget-budgetmanagement-content-card">
          <div className="card-header">
            <h2>
              <ArrowRight size={20} /> Budget Transfers
              <span className="budget-budgetmanagement-count-badge">
                Total: {allTransfers.length} | Pending:{" "}
                {allTransfers.filter((t) => t?.status === "PENDING").length} |
                Approved:{" "}
                {allTransfers.filter((t) => t?.status === "APPROVED").length} |
                Executed:{" "}
                {allTransfers.filter((t) => t?.status === "EXECUTED").length}
              </span>
            </h2>
            <button
              className="btn budget-budgetmanagement-btn-sm budget-budgetmanagement-btn-secondary"
              onClick={loadAllTransfers}
              disabled={loadingAllTransfers}
            >
              <RefreshCw
                size={14}
                className={loadingAllTransfers ? "budget-budgetmanagement-spinning" : ""}
              />{" "}
              Refresh
            </button>
          </div>
          <div className="budget-budgetmanagement-table-container">
            {loadingAllTransfers ? (
              <div className="budget-budgetmanagement-loading-state">
                <div className="budget-budgetmanagement-spinner-small"></div> Loading transfers...
              </div>
            ) : allTransfers.length === 0 ? (
              <div className="budget-budgetmanagement-empty-state">
                <ArrowRight size={48} />
                <h3>No Transfers for {selectedFiscalYear}</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowTransferModal(true)}
                >
                  <ArrowRight size={18} /> Request a Transfer
                </button>
              </div>
            ) : (
              <table className="budget-budgetmanagement-data-table">
                <thead>
                  <tr>
                    <th>Transfer #</th>
                    <th>From Budget</th>
                    <th>To Budget</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className={
                        transfer.status === "EXECUTED" ? "budget-budgetmanagement-executed-row" : ""
                      }
                    >
                      <td>
                        <span className="budget-budgetmanagement-budget-code">
                          {transfer.transferNumber}
                        </span>
                      </td>
                      <td>
                        {transfer.fromBudget?.budgetCode} (
                        {transfer.fromBudget?.department?.name || "Institution"}
                        )
                        {transfer.status === "PENDING" &&
                          transfer.fromBudget && (
                            <>
                              <br />
                              <small>
                                Available:{" "}
                                {formatCurrency(
                                  transfer.fromBudget.availableAmount,
                                )}
                              </small>
                            </>
                          )}
                      </td>
                      <td>
                        {transfer.toBudget?.budgetCode} (
                        {transfer.toBudget?.department?.name || "Institution"})
                      </td>
                      <td>{formatCurrency(transfer.amount)}</td>
                      <td>{transfer.reason}</td>
                      <td>
                        <span
                          className={`budget-budgetmanagement-status-badge ${transfer.status?.toLowerCase()}`}
                        >
                          {transfer.status}
                        </span>
                      </td>
                      <td>
                        {transfer.requestedByUser?.firstName}{" "}
                        {transfer.requestedByUser?.lastName}
                      </td>
                      <td>
                        {new Date(transfer.requestedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="budget-budgetmanagement-action-buttons">
                          {transfer.status === "PENDING" && (
                            <>
                              <button
                                className="budget-budgetmanagement-btn-icon success"
                                onClick={() => handleApproveTransfer(transfer)}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="budget-budgetmanagement-btn-icon danger"
                                onClick={() => handleRejectTransfer(transfer)}
                              >
                                <Ban size={16} />
                              </button>
                              <button
                                className="budget-budgetmanagement-btn-icon"
                                onClick={() => handleDeleteTransfer(transfer)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {transfer.status === "APPROVED" && (
                            <>
                              <button
                                className="budget-budgetmanagement-btn-icon primary"
                                onClick={() => handleExecuteTransfer(transfer)}
                              >
                                <ArrowRight size={16} /> Execute
                              </button>
                              <button
                                className="budget-budgetmanagement-btn-icon danger"
                                onClick={() => handleDeleteTransfer(transfer)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {transfer.status === "REJECTED" && (
                            <button
                              className="budget-budgetmanagement-btn-icon"
                              onClick={() => handleDeleteTransfer(transfer)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {transfer.status === "EXECUTED" && (
                            <span className="budget-budgetmanagement-text-muted success-text">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="budget-budgetmanagement-content-card">
          <div className="card-header">
            <h2>
              <AlertTriangle size={20} /> Active Budget Alerts{" "}
              <span className="budget-budgetmanagement-count-badge">
                {activeAlerts?.length || 0} active
              </span>
            </h2>
          </div>
          <div className="budget-budgetmanagement-alerts-list">
            {!activeAlerts || activeAlerts.length === 0 ? (
              <div className="budget-budgetmanagement-empty-state">
                <CheckCircle size={48} />
                <h3>No Active Alerts</h3>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="budget-budgetmanagement-alert-card">
                  <div
                    className="budget-budgetmanagement-alert-icon"
                    style={{
                      background:
                        alert.alertType === "HARD_STOP" ? "#fee2e2" : "#fef3c7",
                    }}
                  >
                    <AlertTriangle
                      size={24}
                      color={
                        alert.alertType === "HARD_STOP" ? "#ef4444" : "#f59e0b"
                      }
                    />
                  </div>
                  <div className="budget-budgetmanagement-alert-content">
                    <div className="budget-budgetmanagement-alert-title">
                      {alert.alertType === "HARD_STOP"
                        ? "Hard Stop Warning"
                        : "Soft Stop Warning"}
                    </div>
                    <div className="budget-budgetmanagement-alert-message">{alert.message}</div>
                    <div className="budget-budgetmanagement-alert-details">
                      Budget: <strong>{alert.budget?.budgetCode}</strong> |
                      Department:{" "}
                      <strong>
                        {alert.budget?.department?.name || "Institution"}
                      </strong>{" "}
                      | Usage: <strong>{alert.percentageUsed}%</strong> of{" "}
                      {alert.threshold}% threshold
                    </div>
                  </div>
                  <button
                    className="btn budget-budgetmanagement-btn-sm btn-primary"
                    onClick={() => handleResolveAlert(alert)}
                  >
                    <Check size={14} /> Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBudgetForm && (
        <BudgetForm
          isOpen={showBudgetForm}
          onClose={() => {
            setShowBudgetForm(false);
            setEditingBudget(null);
          }}
          initialData={editingBudget}
          onSuccess={() => {
            setShowBudgetForm(false);
            setEditingBudget(null);
            loadBudgets();
            loadDashboardStats();
          }}
        />
      )}
      {showDetailsModal && selectedBudgetForAction && (
        <BudgetDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBudgetForAction(null);
          }}
          budget={selectedBudgetForAction}
        />
      )}
      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedTransferForAction(null);
          }}
          budgets={budgets}
          onSuccess={() => {
            setShowTransferModal(false);
            loadPendingTransfers();
            loadBudgets();
            loadDashboardStats();
            setSuccessMessage("Transfer request submitted successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          }}
        />
      )}
      {showRejectModal && (
        <div
          className="budget-budgetmanagement-modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="budget-budgetmanagement-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="budget-budgetmanagement-modal-header">
              <h2>Reject Budget</h2>
              <button
                className="budget-budgetmanagement-close-button"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="budget-budgetmanagement-modal-body">
              <p>
                Please provide a reason for rejecting{" "}
                <strong>{selectedBudgetForAction?.budgetCode}</strong>
              </p>
              <textarea
                className="budget-budgetmanagement-reject-reason-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
              />
            </div>
            <div className="budget-budgetmanagement-modal-footer">
              <button
                className="btn budget-budgetmanagement-btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRejectBudget}>
                Reject Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
