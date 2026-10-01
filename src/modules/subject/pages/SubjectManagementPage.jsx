// src/modules/subject/pages/SubjectManagementPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Printer,
  Layers,
  FlaskConical,
  Award,
} from "lucide-react";
import { useSubject } from "../hooks/useSubject";
import SubjectForm from "../components/SubjectForm";
import { departmentApi } from "../../department/api/department.api";
import "./SubjectManagementPage.css";

const SubjectManagementPage = () => {
  const {
    subjects,
    createSubject,
    updateSubject,
    deleteSubject,
    loadSubjects,
  } = useSubject();

  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    subject: null,
    error: "",
    loading: false,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getAllDepartments();
        if (res.success && res.data) setDepartments(res.data);
      } catch (err) {
        console.warn("Could not load departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const hydratedSubjects = subjects.map((sub) => {
    const rawCached = localStorage.getItem(`subject_meta_${sub.code}`);
    const cached = rawCached ? JSON.parse(rawCached) : {};

    const resolvedDeptId = sub.departmentId || cached.departmentId;
    const resolvedDeptName =
      sub.departmentName ||
      cached.departmentName ||
      departments.find((d) => String(d.id) === String(resolvedDeptId))?.name ||
      "—";

    return {
      ...sub,
      type: (cached.type || sub.type || "CORE").toUpperCase(),
      departmentId: resolvedDeptId,
      departmentName: resolvedDeptName,
    };
  });

  const filteredSubjects = hydratedSubjects.filter((sub) => {
    if (!sub) return false;
    const term = searchTerm.toLowerCase();
    const nameMatch = sub.name?.toLowerCase().includes(term);
    const codeMatch = sub.code?.toLowerCase().includes(term);
    const typeMatch = selectedType === "all" || sub.type === selectedType;
    const deptMatch =
      selectedDepartment === "all" ||
      String(sub.departmentId) === String(selectedDepartment);

    return (nameMatch || codeMatch) && typeMatch && deptMatch;
  });

  const stats = {
    total: hydratedSubjects.length,
    core: hydratedSubjects.filter((s) => s.type === "CORE").length,
    elective: hydratedSubjects.filter((s) => s.type === "ELECTIVE").length,
    lab: hydratedSubjects.filter((s) => s.type === "LAB").length,
  };

  const handleOpenDelete = (subject) => {
    setDeleteDialog({
      isOpen: true,
      subject,
      error: "",
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const { subject } = deleteDialog;
    if (!subject) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true, error: "" }));

    const res = await deleteSubject(subject.id);
    if (res.success) {
      localStorage.removeItem(`subject_meta_${subject.code}`);
      setDeleteDialog({
        isOpen: false,
        subject: null,
        error: "",
        loading: false,
      });
      loadSubjects();
    } else {
      setDeleteDialog((prev) => ({
        ...prev,
        loading: false,
        error:
          res.error ||
          "Cannot delete subject with active assignments or timetable entries.",
      }));
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-subject-area");
    if (!printArea) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Subject Catalog</title>
          <style>
            body { font-family: sans-serif; margin: 24px; color: #1e293b; }
            .print-title { font-size: 22px; font-weight: 800; color: #172b4c; margin-bottom: 4px; }
            .print-meta { font-size: 13px; color: #64748b; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1b633b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="print-title">SophorERP — Subject Catalog</div>
          <div class="print-meta">Generated on ${new Date().toLocaleDateString()} | Total Subjects: ${filteredSubjects.length}</div>
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
    const csvContent = [
      ["Subject ID", "Code", "Name", "Type", "Department", "Status"],
      ...filteredSubjects.map((s) => [
        s.subjectId,
        s.code,
        s.name,
        s.type,
        s.departmentName || "None",
        s.status,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subjects_catalog_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="subject-page">
      {/* Header Banner */}
      <div className="subject-header-banner no-print">
        <div className="subject-header-content">
          <div>
            <h1>Subject Catalog</h1>
            <p>
              Define academic courses, core requirements, electives, and labs
            </p>
          </div>
          <div className="subject-header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => loadSubjects()}
            >
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingSubject(null);
                setShowSubjectModal(true);
              }}
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>
      </div>

      <div className="subject-page-body">
        {/* Metric Cards */}
        <div className="subject-stats-grid no-print">
          <div className="subject-stat-card">
            <div className="subject-stat-icon blue">
              <BookOpen size={24} />
            </div>
            <div className="subject-stat-info">
              <p className="subject-stat-label">Total Subjects</p>
              <p className="subject-stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="subject-stat-card">
            <div className="subject-stat-icon green">
              <Award size={24} />
            </div>
            <div className="subject-stat-info">
              <p className="subject-stat-label">Core Subjects</p>
              <p className="subject-stat-value">{stats.core}</p>
            </div>
          </div>

          <div className="subject-stat-card">
            <div className="subject-stat-icon amber">
              <Layers size={24} />
            </div>
            <div className="subject-stat-info">
              <p className="subject-stat-label">Electives</p>
              <p className="subject-stat-value">{stats.elective}</p>
            </div>
          </div>

          <div className="subject-stat-card">
            <div className="subject-stat-icon purple">
              <FlaskConical size={24} />
            </div>
            <div className="subject-stat-info">
              <p className="subject-stat-label">Practical Labs</p>
              <p className="subject-stat-value">{stats.lab}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="subject-action-bar no-print">
          <div className="subject-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="subject-filter-group">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="CORE">CORE</option>
              <option value="ELECTIVE">ELECTIVE</option>
              <option value="LAB">LAB</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Printable Header */}
        <div className="subject-print-header">
          <h2>SophorERP — Subject Catalog</h2>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content Table Card */}
        <div className="subject-content-card" id="printable-subject-area">
          <div className="subject-table-responsive">
            <table className="subject-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="subject-empty-row">
                      No subjects found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((sub) => (
                    <tr key={sub.id}>
                      <td className="subject-id-cell">{sub.subjectId}</td>
                      <td className="subject-code-cell">{sub.code}</td>
                      <td className="subject-name-cell">{sub.name}</td>
                      <td>
                        <span
                          className={`subject-pill ${sub.type.toLowerCase()}`}
                        >
                          {sub.type}
                        </span>
                      </td>
                      <td className="subject-dept-cell">
                        {sub.departmentName}
                      </td>
                      <td>
                        <span
                          className={`subject-pill ${sub.isActive ? "active" : "inactive"}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="no-print">
                        <div className="subject-action-buttons">
                          <button
                            type="button"
                            className="subject-action-btn"
                            onClick={() => {
                              setEditingSubject(sub);
                              setShowSubjectModal(true);
                            }}
                            title="Edit Subject"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="subject-action-btn delete-btn"
                            onClick={() => handleOpenDelete(sub)}
                            title="Delete Subject"
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
          </div>
        </div>
      </div>

      {/* Modal */}
      {showSubjectModal && (
        <SubjectForm
          isOpen={showSubjectModal}
          onClose={() => {
            setShowSubjectModal(false);
            setEditingSubject(null);
            loadSubjects();
          }}
          onSubmit={
            editingSubject
              ? (id, data) => updateSubject(id, data)
              : (data) => createSubject(data)
          }
          initialData={editingSubject}
          departments={departments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog.isOpen && (
        <div className="subject-modal-overlay">
          <div className="subject-delete-modal-card">
            <h3>Delete Subject</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{deleteDialog.subject?.name}"</strong> (
              {deleteDialog.subject?.code})? This action cannot be undone.
            </p>

            {deleteDialog.error && (
              <div className="subject-delete-error">{deleteDialog.error}</div>
            )}

            <div className="subject-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setDeleteDialog({
                    isOpen: false,
                    subject: null,
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
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                disabled={deleteDialog.loading}
              >
                {deleteDialog.loading ? "Deleting..." : "Delete Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagementPage;
