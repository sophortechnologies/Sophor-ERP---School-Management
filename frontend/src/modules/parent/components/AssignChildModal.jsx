import React, { useState, useEffect } from "react";
import { parentApi } from "../api/parent.api";
import "./AssignChildModal.css";

export const AssignChildModal = ({
  isOpen,
  onClose,
  onAssign,
  parent,
  allStudents = [],
  parents = [],
}) => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadClasses = async () => {
        try {
          const res = await parentApi.getClasses();
          const list = Array.isArray(res) ? res : res?.data || res?.items || [];
          setClasses(list);
        } catch {
          setClasses([]);
        }
      };
      loadClasses();
    }
  }, [isOpen]);

  const handleClassChange = (e) => {
    const classVal = e.target.value;
    setSelectedClassId(classVal);
    setSelectedSectionId("");
    setSelectedStudentId("");

    const targetClass = classes.find(
      (c) =>
        String(c.id) === String(classVal) ||
        String(c.name) === String(classVal),
    );
    setSections(targetClass?.sections || []);
  };

  // Compile a Set of student IDs that are ALREADY linked to ANY parent
  const alreadyLinkedStudentIds = new Set();
  parents.forEach((p) => {
    (p.students || []).forEach((st) => {
      alreadyLinkedStudentIds.add(String(st.id));
    });
  });

  // Filter students:
  // 1. MUST NOT already be linked to another parent
  // 2. Must match the selected Class & Section filter
  const availableStudents = allStudents.filter((st) => {
    // Exclude students who already have a parent
    if (alreadyLinkedStudentIds.has(String(st.id))) {
      return false;
    }

    if (!selectedClassId) return true;

    const studentClassId = String(st.classId || st.class?.id || "");
    const studentClassName = String(st.class?.name || st.className || "");
    const targetClassId = String(selectedClassId);

    const matchesClass =
      studentClassId === targetClassId ||
      studentClassName === targetClassId ||
      studentClassName.toLowerCase() === targetClassId.toLowerCase();

    if (!matchesClass) return false;

    if (!selectedSectionId) return true;

    const studentSectionId = String(st.sectionId || st.section?.id || "");
    const studentSectionName = String(st.section?.name || st.sectionName || "");
    const targetSectionId = String(selectedSectionId);

    return (
      studentSectionId === targetSectionId ||
      studentSectionName === targetSectionId ||
      studentSectionName.toLowerCase() === targetSectionId.toLowerCase()
    );
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalStudentId = selectedStudentId || manualStudentId.trim();
    if (!finalStudentId) return;

    onAssign(parent.id, finalStudentId);
    setSelectedStudentId("");
    setManualStudentId("");
    onClose();
  };

  return (
    <div className="assign-modal-overlay">
      <div className="assign-modal-content">
        <div className="assign-modal-header">
          <h3 className="assign-modal-title">
            Link Student to {parent?.firstName} {parent?.lastName}
          </h3>
          <button
            type="button"
            className="assign-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="assign-modal-body">
            <p className="assign-modal-description">
              Only students who are not yet linked to any guardian are shown
              below.
            </p>

            <div className="cascading-select-group">
              <div className="assign-form-group">
                <label className="assign-form-label">1. Select Class</label>
                <select
                  className="assign-form-select"
                  value={selectedClassId}
                  onChange={handleClassChange}
                >
                  <option value="">-- All Classes --</option>
                  {classes.map((cls) => (
                    <option key={cls.id || cls.name} value={cls.id || cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {sections.length > 0 && (
                <div className="assign-form-group">
                  <label className="assign-form-label">2. Select Section</label>
                  <select
                    className="assign-form-select"
                    value={selectedSectionId}
                    onChange={(e) => {
                      setSelectedSectionId(e.target.value);
                      setSelectedStudentId("");
                    }}
                  >
                    <option value="">-- All Sections --</option>
                    {sections.map((sec) => (
                      <option
                        key={sec.id || sec.name}
                        value={sec.id || sec.name}
                      >
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="assign-form-group">
                <label className="assign-form-label">
                  3. Select Unlinked Student ({availableStudents.length}{" "}
                  Available) *
                </label>
                <select
                  className="assign-form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={availableStudents.length === 0}
                >
                  <option value="">
                    {availableStudents.length === 0
                      ? "-- No Unlinked Students Available --"
                      : "-- Choose Student --"}
                  </option>
                  {availableStudents.map((st) => {
                    const studentCode =
                      st.studentId ||
                      st.admissionNo ||
                      st.admissionNumber ||
                      st.rollNumber ||
                      st.id;

                    return (
                      <option key={st.id} value={st.id}>
                        {st.firstName} {st.lastName} (ID: {studentCode})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="divider-text-container">
              <span>OR ENTER ID DIRECTLY</span>
            </div>

            <div className="assign-form-group">
              <label className="assign-form-label">Student ID / UUID</label>
              <input
                type="text"
                placeholder="Paste Student UUID or Admission ID"
                className="assign-form-input"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value)}
              />
            </div>
          </div>

          <div className="assign-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!selectedStudentId && !manualStudentId.trim()}
            >
              Assign Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
