// src/modules/assignments/pages/TeacherClassSubjectAssignment.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
} from "lucide-react";
import api from "../../../api/axios";
import { teacherApi } from "../../teacher/api/teacher.api";
import { sectionSubjectService } from "../services/sectionSubject.service";
import "./TeacherClassSubjectAssignment.css";

const TeacherClassSubjectAssignment = () => {
  const [activeTab, setActiveTab] = useState("subject"); // 'subject' or 'classTeacher'
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [classTeacherAssignments, setClassTeacherAssignments] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [availableSections, setAvailableSections] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const filtered = sections.filter(
        (s) =>
          String(s.classId) === String(selectedClassId) ||
          String(s.class_id) === String(selectedClassId),
      );
      setAvailableSections(filtered);
      setSelectedSectionId("");
      setSelectedSubjectId("");
      setSelectedTeacherId("");
    } else {
      setAvailableSections([]);
    }
  }, [selectedClassId, sections]);

  useEffect(() => {
    if (selectedClassId && subjects.length > 0) {
      setAvailableSubjects(subjects);
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedClassId, subjects]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        classesRes,
        sectionsRes,
        subjectsRes,
        teachersResponse,
        assignmentsData,
      ] = await Promise.all([
        api.get("/classes"),
        api.get("/sections"),
        api.get("/subjects"),
        teacherApi.getAllTeachers(),
        sectionSubjectService.listAll(),
      ]);

      const allClasses = classesRes.data?.data || classesRes.data || [];
      const allSections = sectionsRes.data?.data || sectionsRes.data || [];
      const allSubjects = subjectsRes.data?.data || subjectsRes.data || [];
      const allTeachers = teachersResponse.success ? teachersResponse.data : [];

      setClasses(allClasses);
      setSections(allSections);
      setSubjects(allSubjects);
      setTeachers(allTeachers);

      const classMap = new Map(allClasses.map((c) => [String(c.id), c]));
      const sectionMap = new Map(allSections.map((s) => [String(s.id), s]));
      const subjectMap = new Map(allSubjects.map((s) => [String(s.id), s]));
      const teacherMap = new Map(
        allTeachers.map((t) => [String(t.userId || t.id), t]),
      );

      const rawAssignments = Array.isArray(assignmentsData)
        ? assignmentsData
        : [];

      const subList = [];
      const classLeadList = [];

      rawAssignments.forEach((ss) => {
        const secId = ss.sectionId || ss.section_id;
        const subId = ss.subjectId || ss.subject_id;
        const teachId = ss.teacherId || ss.teacher_id;

        const section = sectionMap.get(String(secId));
        const classObj = section
          ? classMap.get(String(section.classId || section.class_id))
          : classMap.get(String(ss.classId));
        const subject = subjectMap.get(String(subId));
        const teacher = teacherMap.get(String(teachId));

        const teacherName =
          ss.teacherName ||
          (teacher
            ? teacher.fullName ||
              `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
            : null) ||
          `Teacher #${teachId}`;

        const formattedItem = {
          id: ss.id || `${secId}-${subId}-${teachId}`,
          className: classObj?.name || ss.className || "Class",
          sectionName: section?.name || ss.sectionName || "",
          sectionId: secId,
          subjectName: subject?.name || ss.subjectName || "",
          subjectCode: subject?.code || ss.subjectCode || "",
          subjectId: subId,
          teacherName: teacherName,
          teacherId: teachId,
          isClassTeacher: ss.isClassTeacher || !subId,
        };

        if (formattedItem.isClassTeacher) {
          classLeadList.push(formattedItem);
        } else {
          subList.push(formattedItem);
        }
      });

      setSubjectAssignments(subList);
      setClassTeacherAssignments(classLeadList);
    } catch (err) {
      console.error("Error loading assignment data:", err);
      setError("Failed to load assignment data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeacherId || !selectedClassId) {
      setError("Please select both a teacher and a class");
      return;
    }

    if (activeTab === "subject" && !selectedSubjectId) {
      setError("Please select a subject");
      return;
    }

    if (activeTab === "classTeacher" && !selectedSectionId) {
      setError(
        "Please select a specific section for the Class Teacher / Head of Section role.",
      );
      return;
    }

    // Validation: Check uniqueness constraints
    if (activeTab === "classTeacher") {
      const alreadyHasHead = classTeacherAssignments.some(
        (a) => String(a.sectionId) === String(selectedSectionId),
      );
      if (alreadyHasHead) {
        setError(
          "This section already has a designated Class Teacher / Head of Section.",
        );
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedClass = classes.find(
        (c) => String(c.id) === String(selectedClassId),
      );
      const selectedSection = sections.find(
        (s) => String(s.id) === String(selectedSectionId),
      );
      const selectedSubject = subjects.find(
        (s) => String(s.id) === String(selectedSubjectId),
      );
      const selectedTeacher = teachers.find(
        (t) => String(t.id) === String(selectedTeacherId),
      );

      const teacherName =
        selectedTeacher?.fullName ||
        `${selectedTeacher?.firstName || ""} ${selectedTeacher?.lastName || ""}`.trim() ||
        "Teacher";

      if (activeTab === "subject") {
        const payload = {
          teacherId: parseInt(selectedTeacherId, 10),
          classId: parseInt(selectedClassId, 10),
          subjectId: parseInt(selectedSubjectId, 10),
          sectionId: selectedSectionId ? parseInt(selectedSectionId, 10) : null,
          subjectName: selectedSubject?.name,
          subjectCode: selectedSubject?.code,
          className: selectedClass?.name,
          sectionName: selectedSection?.name,
          teacherName: teacherName,
        };
        await sectionSubjectService.create(payload);
        setSuccess(
          `✓ ${teacherName} successfully assigned to teach ${selectedSubject?.name} in ${selectedClass?.name}${selectedSection ? ` - ${selectedSection.name}` : ""}`,
        );
      } else {
        const endpoint = `/teacher/${selectedTeacherId}/assign-class`;
        const payload = {
          classId: parseInt(selectedClassId, 10),
          sectionId: parseInt(selectedSectionId, 10),
          isClassTeacher: true,
          className: selectedClass?.name,
          sectionName: selectedSection?.name,
          teacherName: teacherName,
        };
        await api.post(endpoint, payload);
        setSuccess(
          `✓ ${teacherName} successfully assigned as Head of Section for ${selectedClass?.name} - ${selectedSection?.name}`,
        );
      }

      setSelectedClassId("");
      setSelectedSectionId("");
      setSelectedSubjectId("");
      setSelectedTeacherId("");

      loadAllData();
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process assignment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!assignmentId) return;
    if (!window.confirm("Remove this assignment?")) return;

    try {
      await sectionSubjectService.remove(assignmentId);
      setSuccess("Assignment removed successfully");
      loadAllData();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError(err.response?.data?.message || "Failed to remove assignment");
    }
  };

  const currentList =
    activeTab === "subject" ? subjectAssignments : classTeacherAssignments;

  const stats = {
    totalAssignments: currentList.length,
    classesCovered: new Set(currentList.map((a) => a.className)).size,
    teachersAssigned: new Set(currentList.map((a) => a.teacherId)).size,
  };

  if (loading && classes.length === 0) {
    return (
      <div className="marks-page-loading">
        <div className="marks-page-spinner"></div>
        <p>Loading teacher assignments...</p>
      </div>
    );
  }

  return (
    <div className="marks-entry-container-page">
      <div className="marks-page-header-banner">
        <div className="marks-header-inner-content">
          <div>
            <h1>
              <GraduationCap size={24} />
              Teacher & Class Assignments
            </h1>
            <p>
              Manage subject course loads and section head responsibilities
              separately
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="marks-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="marks-success-banner">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs / Mode Selector */}
      <div
        className="examination-entry-moderationpanel-filter-tabs"
        style={{ marginBottom: "20px" }}
      >
        <button
          type="button"
          className={`examination-entry-moderationpanel-tab ${activeTab === "subject" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("subject");
            setError(null);
            setSuccess(null);
          }}
        >
          <BookOpen
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          Subject Teacher Assignment ({subjectAssignments.length})
        </button>
        <button
          type="button"
          className={`examination-entry-moderationpanel-tab ${activeTab === "classTeacher" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("classTeacher");
            setError(null);
            setSuccess(null);
          }}
        >
          <ShieldCheck
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          Class Teacher / Head of Section ({classTeacherAssignments.length})
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="marks-stats-grid-cards">
        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#dbeafe" }}
          >
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">
              Active {activeTab === "subject" ? "Subject" : "Class Head"} Roles
            </p>
            <p className="marks-stat-number-val">{stats.totalAssignments}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#dcfce7" }}
          >
            <BookOpen size={24} color="#10b981" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Classes Covered</p>
            <p className="marks-stat-number-val">{stats.classesCovered}</p>
          </div>
        </div>

        <div className="marks-stat-card-item">
          <div
            className="marks-stat-icon-box"
            style={{ background: "#fef3c7" }}
          >
            <Award size={24} color="#f59e0b" />
          </div>
          <div className="marks-stat-text-box">
            <p className="marks-stat-title-label">Assigned Teachers</p>
            <p className="marks-stat-number-val">{stats.teachersAssigned}</p>
          </div>
        </div>
      </div>

      {/* Assignment Form Card */}
      <div className="marks-filter-toolbar-card marks-form-card-wrapper">
        <h3 className="marks-form-heading">
          <Plus size={20} />{" "}
          {activeTab === "subject"
            ? "Assign Subject Course"
            : "Designate Class Teacher / Head of Section"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="marks-filter-row-grid marks-form-row">
            <div className="marks-form-control-group">
              <label htmlFor="select-teacher" className="marks-lbl-title">
                Select Teacher *
              </label>
              <select
                id="select-teacher"
                name="teacherId"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                required
                className="marks-dropdown-select"
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName ||
                      `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()}
                    {teacher.departmentName &&
                    teacher.departmentName !== "Not Assigned"
                      ? ` (${teacher.departmentName})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="marks-form-control-group">
              <label htmlFor="select-class" className="marks-lbl-title">
                Select Class *
              </label>
              <select
                id="select-class"
                name="classId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="marks-dropdown-select"
              >
                <option value="">-- Choose Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="marks-filter-row-grid marks-form-row">
            <div className="marks-form-control-group">
              <label htmlFor="select-section" className="marks-lbl-title">
                Select Section{" "}
                {activeTab === "classTeacher" ? "*" : "(Optional)"}
              </label>
              <select
                id="select-section"
                name="sectionId"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                required={activeTab === "classTeacher"}
                disabled={!selectedClassId}
                className="marks-dropdown-select"
              >
                <option value="">-- Choose Section --</option>
                {availableSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "subject" ? (
              <div className="marks-form-control-group">
                <label htmlFor="select-subject" className="marks-lbl-title">
                  Select Subject *
                </label>
                <select
                  id="select-subject"
                  name="subjectId"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required={activeTab === "subject"}
                  disabled={!selectedClassId}
                  className="marks-dropdown-select"
                >
                  <option value="">-- Choose Subject --</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div
                className="marks-form-control-group"
                style={{ display: "flex", alignItems: "flex-end" }}
              >
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    margin: 0,
                    paddingBottom: "8px",
                  }}
                >
                  ℹ️ Each section can only have one designated Head / Class
                  Teacher.
                </p>
              </div>
            )}
          </div>

          <div className="marks-form-actions-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !selectedTeacherId ||
                !selectedClassId ||
                (activeTab === "subject" && !selectedSubjectId) ||
                (activeTab === "classTeacher" && !selectedSectionId)
              }
              className="marks-btn-primary btn-primary"
            >
              {submitting
                ? "Processing..."
                : activeTab === "subject"
                  ? "Assign Teacher to Subject"
                  : "Assign as Class Teacher"}
            </button>
          </div>
        </form>
      </div>

      {/* Distinctly Filtered Current Assignments Table */}
      <div className="marks-main-table-card">
        <div className="marks-card-header-area">
          <h2>
            <Users size={20} />
            {activeTab === "subject"
              ? "Subject Teacher Assignments"
              : "Class Teachers / Section Heads"}
            <span className="marks-badge-counter">
              {currentList.length} records
            </span>
          </h2>
        </div>

        {currentList.length === 0 ? (
          <div className="marks-empty-state-box">
            <BookOpen size={48} />
            <h3>
              No {activeTab === "subject" ? "Subject" : "Class Teacher"}{" "}
              Assignments Yet
            </h3>
            <p>Use the form above to configure roles for this category.</p>
          </div>
        ) : (
          <div className="marks-table-scroll-wrapper">
            <table className="marks-data-table-grid">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Class & Section</th>
                  <th>
                    {activeTab === "subject"
                      ? "Subject Details"
                      : "Designation Role"}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((assignment) => (
                  <tr
                    key={
                      assignment.id ||
                      `${assignment.teacherId}-${assignment.subjectId || assignment.sectionId}`
                    }
                  >
                    <td>
                      <strong>{assignment.teacherName}</strong>
                    </td>
                    <td>
                      {assignment.className}{" "}
                      {assignment.sectionName
                        ? `- ${assignment.sectionName}`
                        : ""}
                    </td>
                    <td>
                      <strong>
                        {activeTab === "subject"
                          ? assignment.subjectName
                          : "Class Teacher / Head of Section"}
                      </strong>
                      <span className="marks-mono-text marks-mono-code">
                        {activeTab === "subject"
                          ? assignment.subjectCode
                          : "HEAD"}
                      </span>
                    </td>
                    <td>
                      <div className="marks-row-actions">
                        <button
                          className="marks-icon-action-btn marks-action-delete"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          title="Remove Assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClassSubjectAssignment;
