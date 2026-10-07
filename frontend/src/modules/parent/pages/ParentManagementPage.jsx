import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParent } from "../hooks";
import { ParentCard, ParentFormModal, AssignChildModal } from "../components";
import "./ParentManagementPage.css";

export const ParentManagementPage = () => {
  const navigate = useNavigate();
  const {
    parents,
    studentsRaw,
    loading,
    error,
    updateParent,
    registerParent,
    assignChild,
  } = useParent(true);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const handleCreateOrEdit = async (formData) => {
    try {
      if (selectedParent) {
        await updateParent(selectedParent, formData);
      } else {
        await registerParent(formData);
      }
      setIsFormOpen(false);
      setSelectedParent(null);
    } catch {
      // Handled in hook
    }
  };

  const filteredParents = parents.filter((p) => {
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(term) || email.includes(term) || phone.includes(term);

    const childrenCount = p.students?.length || 0;
    if (activeTab === "LINKED") {
      return matchesSearch && childrenCount > 0;
    }
    if (activeTab === "UNLINKED") {
      return matchesSearch && childrenCount === 0;
    }
    return matchesSearch;
  });

  const totalParents = parents.length;
  const linkedParents = parents.filter(
    (p) => (p.students?.length || 0) > 0,
  ).length;
  const unlinkedParents = totalParents - linkedParents;

  return (
    <div className="parent-page-wrapper">
      <div className="parent-page-header">
        <div className="parent-header-left">
          <h1 className="parent-title">Parent Management</h1>
          <p className="parent-subtitle">
            Manage guardian profiles, credential access, and associated
            students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedParent(null);
            setIsFormOpen(true);
          }}
          className="btn-primary-action"
        >
          <span>+</span> Add New Parent
        </button>
      </div>

      <div className="parent-stats-row">
        <div className="parent-stat-card">
          <span className="stat-card-label">Total Parents</span>
          <span className="stat-card-value">{totalParents}</span>
        </div>
        <div className="parent-stat-card">
          <span className="stat-card-label">With Linked Students</span>
          <span className="stat-card-value">{linkedParents}</span>
        </div>
        <div className="parent-stat-card">
          <span className="stat-card-label">Pending Student Link</span>
          <span className="stat-card-value">{unlinkedParents}</span>
        </div>
      </div>

      {error && (
        <div className="parent-notification-banner">
          <div className="notification-message">
            <span>&#9888;</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="parent-tabs-nav">
        <button
          type="button"
          className={`parent-tab-item ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          All Parents ({totalParents})
        </button>
        <button
          type="button"
          className={`parent-tab-item ${activeTab === "LINKED" ? "active" : ""}`}
          onClick={() => setActiveTab("LINKED")}
        >
          Linked ({linkedParents})
        </button>
        <button
          type="button"
          className={`parent-tab-item ${activeTab === "UNLINKED" ? "active" : ""}`}
          onClick={() => setActiveTab("UNLINKED")}
        >
          Pending Link ({unlinkedParents})
        </button>
      </div>

      <div className="parent-filter-bar">
        <div className="parent-search-box">
          <span className="parent-search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="parent-search-field"
          />
        </div>
        <span className="parent-counter-tag">
          Showing {filteredParents.length} parent record(s)
        </span>
      </div>

      {loading ? (
        <div className="parent-loading-view">Loading parent records...</div>
      ) : filteredParents.length === 0 ? (
        <div className="parent-empty-view">
          <div className="empty-view-icon">&#128101;</div>
          <h3 className="empty-view-title">No Parents Found</h3>
          <p className="empty-view-desc">
            No parent records matched your search query.
          </p>
        </div>
      ) : (
        <div className="parent-grid-layout">
          {filteredParents.map((parent) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onView={(p) => navigate(`${p.id}`)}
              onEdit={(p) => {
                setSelectedParent(p);
                setIsFormOpen(true);
              }}
              onAssignChild={(p) => {
                setSelectedParent(p);
                setIsAssignOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ParentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedParent(null);
        }}
        onSubmit={handleCreateOrEdit}
        initialData={selectedParent}
      />

      <AssignChildModal
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedParent(null);
        }}
        onAssign={assignChild}
        parent={selectedParent}
        allStudents={studentsRaw}
        parents={parents}
      />
    </div>
  );
};

export default ParentManagementPage;
