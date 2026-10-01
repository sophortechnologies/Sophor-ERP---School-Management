// src/modules/classes/pages/ClassesManagement.jsx
import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Layers,
  Download,
  Printer,
  Calendar,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import ClassForm from "../components/ClassForm";
import SectionForm from "../components/SectionForm";
import "./ClassesManagement.css";

const ClassesManagement = () => {
  const {
    classes,
    sections,
    academicSessions,
    stats,
    createClass,
    updateClass,
    deleteClass,
    createSection,
    updateSection,
    deleteSection,
    refreshData,
    getSectionsByClass,
  } = useClasses();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState("all");
  const [activeTab, setActiveTab] = useState("classes");

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  // Delete modal state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    item: null,
    type: "class",
    error: "",
    loading: false,
  });

  const filteredClasses = classes.filter((cls) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = cls.name?.toLowerCase().includes(term);
    const sessionMatch =
      selectedSession === "all" ||
      String(cls.academicSessionId) === String(selectedSession);

    return nameMatch && sessionMatch;
  });

  const filteredSections = sections.filter((sec) => {
    const term = searchTerm.toLowerCase();
    return (
      sec.name?.toLowerCase().includes(term) ||
      sec.className?.toLowerCase().includes(term)
    );
  });

  const handleOpenDelete = (item, type = "class") => {
    setDeleteDialog({
      isOpen: true,
      item,
      type,
      error: "",
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const { item, type } = deleteDialog;
    if (!item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true, error: "" }));

    const res =
      type === "class"
        ? await deleteClass(item.id)
        : await deleteSection(item.id);

    if (res.success) {
      setDeleteDialog({
        isOpen: false,
        item: null,
        type: "class",
        error: "",
        loading: false,
      });
    } else {
      setDeleteDialog((prev) => ({
        ...prev,
        loading: false,
        error: res.error || `Failed to delete ${type}.`,
      }));
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-classes-area");
    if (!printArea) return;

    const title =
      activeTab === "classes" ? "Classes Roster" : "Sections Directory";

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 24px;
              color: #1e293b;
            }
            .print-title {
              font-size: 22px;
              font-weight: 800;
              color: #172b4c;
              margin: 0 0 4px 0;
            }
            .print-meta {
              font-size: 13px;
              color: #64748b;
              margin: 0 0 20px 0;
              padding-bottom: 12px;
              border-bottom: 2px solid #1b633b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 9px 12px;
              text-align: left;
              font-size: 13px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #334155;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-title">SophorERP — ${title}</div>
          <div class="print-meta">Generated on ${new Date().toLocaleDateString()} | Total Records: ${
            activeTab === "classes"
              ? filteredClasses.length
              : filteredSections.length
          }</div>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExport = () => {
    const csvContent =
      activeTab === "classes"
        ? [
            [
              "Class ID",
              "Class Name",
              "Academic Session",
              "Sections Count",
              "Enrolled Students",
            ],
            ...filteredClasses.map((c) => [
              `CLS${String(c.id).padStart(4, "0")}`,
              c.name,
              c.academicSessionName || "None",
              getSectionsByClass(c.id).length,
              c.studentsCount || 0,
            ]),
          ]
            .map((r) => r.join(","))
            .join("\n")
        : [
            [
              "Section ID",
              "Section Name",
              "Parent Class",
              "Capacity",
              "Enrolled Students",
            ],
            ...filteredSections.map((s) => [
              `SEC${String(s.id).padStart(4, "0")}`,
              s.name,
              s.className,
              s.capacity ?? "N/A",
              s.studentsCount || 0,
            ]),
          ]
            .map((r) => r.join(","))
            .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  return (
    <div className="classes-management-page">
      {/* Header Banner */}
      <div className="classes-header-banner no-print">
        <div className="classes-header-content">
          <div>
            <h1>Class & Section Management</h1>
          </div>
          <div className="classes-header-actions">
            <button className="btn btn-secondary" onClick={() => refreshData()}>
              Refresh
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingSection(null);
                setShowSectionModal(true);
              }}
            >
              <Plus size={16} /> Add Section
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingClass(null);
                setShowClassModal(true);
              }}
            >
              <Plus size={16} /> Add Class
            </button>
          </div>
        </div>
      </div>

      <div className="classes-page-body">
        {/* Metric Cards */}
        <div className="classes-stats-grid no-print">
          <div className="classes-stat-card">
            <div className="classes-stat-icon blue">
              <BookOpen size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Total Classes</p>
              <p className="classes-stat-value">{stats.totalClasses}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon green">
              <Layers size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Total Sections</p>
              <p className="classes-stat-value">{stats.totalSections}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon amber">
              <Users size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Total Capacity</p>
              <p className="classes-stat-value">{stats.availableCapacity}</p>
            </div>
          </div>

          <div className="classes-stat-card">
            <div className="classes-stat-icon purple">
              <Calendar size={24} />
            </div>
            <div className="classes-stat-info">
              <p className="classes-stat-label">Academic Sessions</p>
              <p className="classes-stat-value">{academicSessions.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="classes-tab-bar no-print">
          <button
            className={`classes-tab-btn ${
              activeTab === "classes" ? "active" : ""
            }`}
            onClick={() => setActiveTab("classes")}
          >
            <BookOpen size={16} /> Classes ({classes.length})
          </button>
          <button
            className={`classes-tab-btn ${
              activeTab === "sections" ? "active" : ""
            }`}
            onClick={() => setActiveTab("sections")}
          >
            <Layers size={16} /> Sections ({sections.length})
          </button>
        </div>

        {/* Toolbar */}
        <div className="classes-action-bar no-print">
          <div className="classes-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="classes-filter-group">
            {activeTab === "classes" && (
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                <option value="all">All Academic Sessions</option>
                {academicSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            )}

            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Printable Header */}
        <div className="classes-print-header">
          <h2>
            SophorERP —{" "}
            {activeTab === "classes" ? "Classes Roster" : "Sections Directory"}
          </h2>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content Table Area */}
        <div className="classes-content-card" id="printable-classes-area">
          <div className="classes-table-responsive">
            {activeTab === "classes" ? (
              <table className="classes-table">
                <thead>
                  <tr>
                    <th>Class ID</th>
                    <th>Class Name</th>
                    <th>Academic Session</th>
                    <th>Sections</th>
                    <th>Enrolled Students</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="classes-empty-row">
                        No classes found in the database.
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => {
                      const classSections = getSectionsByClass(cls.id);
                      return (
                        <tr key={cls.id}>
                          <td className="classes-id-cell">
                            CLS{String(cls.id).padStart(4, "0")}
                          </td>
                          <td className="classes-name-cell">{cls.name}</td>
                          <td className="classes-session-cell">
                            {cls.academicSessionName || "None"}
                          </td>
                          <td>
                            <span className="classes-pill-badge session">
                              {classSections.length} section
                              {classSections.length === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td className="classes-students-cell">
                            {cls.studentsCount || 0} students
                          </td>
                          <td className="no-print">
                            <div className="classes-action-buttons">
                              <button
                                type="button"
                                className="classes-action-btn"
                                onClick={() => {
                                  setEditingClass(cls);
                                  setShowClassModal(true);
                                }}
                                title="Edit Class"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="classes-action-btn delete-btn"
                                onClick={() => handleOpenDelete(cls, "class")}
                                title="Delete Class"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="classes-table">
                <thead>
                  <tr>
                    <th>Section ID</th>
                    <th>Section Name</th>
                    <th>Parent Class</th>
                    <th>Capacity</th>
                    <th>Enrolled Students</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSections.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="classes-empty-row">
                        No sections found in the database.
                      </td>
                    </tr>
                  ) : (
                    filteredSections.map((sec) => (
                      <tr key={sec.id}>
                        <td className="classes-id-cell">
                          SEC{String(sec.id).padStart(4, "0")}
                        </td>
                        <td className="classes-name-cell">{sec.name}</td>
                        <td className="classes-session-cell">
                          {sec.className}
                        </td>
                        <td className="classes-students-cell">
                          {sec.capacity !== null && sec.capacity !== undefined
                            ? sec.capacity
                            : "—"}
                        </td>
                        <td className="classes-session-cell">
                          {sec.studentsCount || 0} students
                        </td>
                        <td className="no-print">
                          <div className="classes-action-buttons">
                            <button
                              type="button"
                              className="classes-action-btn"
                              onClick={() => {
                                setEditingSection(sec);
                                setShowSectionModal(true);
                              }}
                              title="Edit Section"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              className="classes-action-btn delete-btn"
                              onClick={() => handleOpenDelete(sec, "section")}
                              title="Delete Section"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <ClassForm
          isOpen={showClassModal}
          onClose={() => {
            setShowClassModal(false);
            setEditingClass(null);
          }}
          onSubmit={
            editingClass
              ? (id, data) => updateClass(id, data)
              : (data) => createClass(data)
          }
          initialData={editingClass}
          academicSessions={academicSessions}
        />
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <SectionForm
          isOpen={showSectionModal}
          onClose={() => {
            setShowSectionModal(false);
            setEditingSection(null);
          }}
          onSubmit={
            editingSection
              ? (data) => updateSection(editingSection.id, data)
              : (data) => createSection(data)
          }
          initialData={editingSection}
          classes={classes}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog.isOpen && (
        <div className="classes-delete-modal-overlay">
          <div className="classes-delete-modal-card">
            <h3>
              Delete {deleteDialog.type === "class" ? "Class" : "Section"}
            </h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{deleteDialog.item?.name}"</strong>? This action cannot
              be undone.
            </p>

            {deleteDialog.error && (
              <div className="classes-delete-error">{deleteDialog.error}</div>
            )}

            <div className="classes-delete-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setDeleteDialog({
                    isOpen: false,
                    item: null,
                    type: "class",
                    error: "",
                    loading: false,
                  })
                }
                disabled={deleteDialog.loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="classes-delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={deleteDialog.loading}
              >
                {deleteDialog.loading
                  ? "Deleting..."
                  : `Delete ${
                      deleteDialog.type === "class" ? "Class" : "Section"
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;
