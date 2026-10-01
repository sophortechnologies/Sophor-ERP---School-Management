import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Printer,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  TrendingDown,
  Wrench,
  Calendar,
  Truck,
  Building,
  X,
  UserCheck,
} from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
} from "../constants/assets.constants";
import AssetForm from "../components/AssetForm";
import AssetDetailsModal from "../components/AssetDetailsModal";
import AssignAssetModal from "../components/AssignAssetModal";
import MaintenanceModal from "../components/MaintenanceModal";
import DisposalModal from "../components/DisposalModal";
import "./AssetManagement.css";

const AssetManagement = () => {
  const {
    assets,
    loading,
    error,
    stats,
    pagination,
    loadAssets,
    loadDashboardStats,
    deleteAsset,
    exportToCSV,
    runMonthlyDepreciation,
  } = useAssets();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAssetForAction, setSelectedAssetForAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDepreciationConfirm, setShowDepreciationConfirm] = useState(false);

  const itemsPerPage = 10;

  // Load assets with filters
  useEffect(() => {
    const params = {
      page: currentPage,
      page_size: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory !== "all" && { category: selectedCategory }),
      ...(selectedStatus !== "all" && { status: selectedStatus }),
    };
    loadAssets(params);
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, loadAssets]);

  // Filtered assets (client-side filtering for instant feedback)
  const filteredAssets = assets.filter((asset) => {
    if (!asset) return false;

    const matchesSearch =
      !searchTerm ||
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || asset.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setShowAssetForm(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleViewAsset = (asset) => {
    setSelectedAssetForAction(asset);
    setShowDetailsModal(true);
  };

  const handleAssignAsset = (asset) => {
    setSelectedAssetForAction(asset);
    setShowAssignModal(true);
  };

  const handleMaintenance = (asset) => {
    setSelectedAssetForAction(asset);
    setShowMaintenanceModal(true);
  };

  const handleDisposeAsset = (asset) => {
    setSelectedAssetForAction(asset);
    setShowDisposalModal(true);
  };

  const handleDeleteAsset = async (asset) => {
    if (
      !confirm(
        `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const result = await deleteAsset(asset.id);
    if (result.success) {
      setSuccessMessage(`Asset "${asset.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to delete asset");
    }
  };

  const handleRunDepreciation = async () => {
    setShowDepreciationConfirm(false);
    const result = await runMonthlyDepreciation();
    if (result.success) {
      setSuccessMessage("Monthly depreciation calculated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error || "Failed to run monthly depreciation");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getCategoryIcon = (category) => {
    const cat = ASSET_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || "📦";
  };

  const getCategoryColor = (category) => {
    const cat = ASSET_CATEGORIES.find((c) => c.value === category);
    return cat?.color || "#6b7280";
  };

  const getStatusBadge = (status) => {
    const statusConfig = ASSET_STATUSES.find((s) => s.value === status);
    const color = statusConfig?.color || "#6b7280";

    return (
      <span
        className="status-badge"
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

  if (loading && assets.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="asset-management-page">
      {/* Header */}
      <div className="assets-assetmanagement-page-header">
        <div className="assets-assetmanagement-header-content">
          <div>
            <h1>
              <Package size={24} />
              Asset Management
            </h1>
            <p>
              Manage school assets, track depreciation, and schedule maintenance
            </p>
            {successMessage && (
              <div className="success-message">
                <CheckCircle size={14} />
                {successMessage}
              </div>
            )}
          </div>

          <div className="header-buttons">
            <button
              className="btn assets-assetmanagement-btn-secondary"
              onClick={() => setShowDepreciationConfirm(true)}
            >
              <TrendingDown size={18} />
              Run Depreciation
            </button>
            <button className="btn assets-assetmanagement-btn-secondary" onClick={exportToCSV}>
              <Download size={18} />
              Export
            </button>
            <button className="btn btn-primary" onClick={handleCreateAsset}>
              <Plus size={18} />
              Add Asset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>
            <Package size={24} color="#3b82f6" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Assets</p>
            <p className="stat-value">{stats.totalAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>
            <DollarSign size={24} color="#10b981" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Value</p>
            <p className="stat-value">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}>
            <TrendingDown size={24} color="#f59e0b" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Current Value</p>
            <p className="stat-value">
              {formatCurrency(stats.depreciatedValue)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>
            <Wrench size={24} color="#ef4444" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Maintenance Due</p>
            <p className="stat-value">{stats.maintenanceDueCount}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="assets-assetmanagement-action-bar">
        <div className="assets-assetmanagement-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, asset tag, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="assets-assetmanagement-filter-select"
          >
            <option value="all">All Categories</option>
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="assets-assetmanagement-filter-select"
          >
            <option value="all">All Status</option>
            {ASSET_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedStatus !== "all") && (
            <button className="btn assets-assetmanagement-btn-secondary" onClick={clearFilters}>
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="assets-assetmanagement-error-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error loading data:</strong>
            <p>{error}</p>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => loadAssets()}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <div className="content-card">
        <div className="card-header">
          <h2>
            <Package size={20} />
            Assets
            <span className="count-badge">
              {filteredAssets.length} of {assets.length}
            </span>
          </h2>
        </div>

        <div className="table-container">
          {filteredAssets.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No Assets Found</h3>
              <p>
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedStatus !== "all"
                  ? "Try changing your search or filters"
                  : "Get started by adding your first asset"}
              </p>
              <button className="btn btn-primary" onClick={handleCreateAsset}>
                <Plus size={18} />
                Add First Asset
              </button>
            </div>
          ) : (
            <table className="assets-assetmanagement-data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Purchase Cost</th>
                  <th>Current Value</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <span className="assets-assetmanagement-asset-tag">{asset.assetTag}</span>
                    </td>
                    <td>
                      <div className="asset-name">
                        <strong>{asset.name}</strong>
                        {asset.model && (
                          <div className="text-muted">{asset.model}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="assets-assetmanagement-category-badge"
                        style={{
                          backgroundColor: `${getCategoryColor(asset.category)}10`,
                          color: getCategoryColor(asset.category),
                        }}
                      >
                        {getCategoryIcon(asset.category)}{" "}
                        {ASSET_CATEGORIES.find(
                          (c) => c.value === asset.category,
                        )?.label || asset.category}
                      </span>
                    </td>
                    <td>{formatCurrency(asset.purchaseCost)}</td>
                    <td>{formatCurrency(asset.currentValue)}</td>
                    <td>
                      {asset.assignedToUser ? (
                        <span className="assigned-user">
                          {asset.assignedToUser.firstName}{" "}
                          {asset.assignedToUser.lastName}
                        </span>
                      ) : asset.assignedToDepartment ? (
                        <span className="assigned-dept">
                          {asset.assignedToDepartment.name}
                        </span>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleViewAsset(asset)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleEditAsset(asset)}
                          title="Edit asset"
                        >
                          <Edit size={16} />
                        </button>
                        {asset.status === "ACTIVE" && (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => handleAssignAsset(asset)}
                              title="Assign asset"
                            >
                              <UserCheck size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleMaintenance(asset)}
                              title="Schedule maintenance"
                            >
                              <Wrench size={16} />
                            </button>
                          </>
                        )}
                        {asset.status === "ACTIVE" && (
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDisposeAsset(asset)}
                            title="Dispose asset"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteAsset(asset)}
                          title="Delete asset"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="assets-assetmanagement-pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="assets-assetmanagement-pagination-btn"
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

      {/* Modals */}
      {showAssetForm && (
        <AssetForm
          isOpen={showAssetForm}
          onClose={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
          initialData={editingAsset}
          onSuccess={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
            loadAssets();
            loadDashboardStats();
          }}
        />
      )}

      {showDetailsModal && selectedAssetForAction && (
        <AssetDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAssetForAction(null);
          }}
          asset={selectedAssetForAction}
        />
      )}

      {showAssignModal && selectedAssetForAction && (
        <AssignAssetModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedAssetForAction(null);
          }}
          asset={selectedAssetForAction}
          onSuccess={() => {
            setShowAssignModal(false);
            loadAssets();
            loadDashboardStats();
          }}
        />
      )}

      {showMaintenanceModal && selectedAssetForAction && (
        <MaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedAssetForAction(null);
          }}
          asset={selectedAssetForAction}
          onSuccess={() => {
            setShowMaintenanceModal(false);
            loadAssets();
          }}
        />
      )}

      {showDisposalModal && selectedAssetForAction && (
        <DisposalModal
          isOpen={showDisposalModal}
          onClose={() => {
            setShowDisposalModal(false);
            setSelectedAssetForAction(null);
          }}
          asset={selectedAssetForAction}
          onSuccess={() => {
            setShowDisposalModal(false);
            loadAssets();
            loadDashboardStats();
          }}
        />
      )}

      {/* Depreciation Confirmation Modal */}
      {showDepreciationConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDepreciationConfirm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Run Monthly Depreciation</h2>
              <button
                className="close-button"
                onClick={() => setShowDepreciationConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                This will calculate and apply monthly depreciation for all
                active assets.
              </p>
              <p>Are you sure you want to continue?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn assets-assetmanagement-btn-secondary"
                onClick={() => setShowDepreciationConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRunDepreciation}
              >
                Run Depreciation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
