import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useParent } from "../hooks";
import { TransferChildModal } from "../components";
import "./ParentDetailsPage.css";

export const ParentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { parents, loading, transferChild } = useParent(true);
  const [parent, setParent] = useState(null);
  const [transferringStudent, setTransferringStudent] = useState(null);

  useEffect(() => {
    if (parents && parents.length > 0 && id) {
      const cleanParamId = decodeURIComponent(id).replace(
        /[^a-zA-Z0-9_-]/g,
        "",
      );
      const match = parents.find(
        (p) => String(p.id) === cleanParamId || String(p.id) === id,
      );
      setParent(match || null);
    }
  }, [parents, id]);

  if (loading && (!parents || parents.length === 0)) {
    return (
      <div className="parent-loading-banner">Loading parent details...</div>
    );
  }

  if (!parent) {
    return (
      <div className="parent-details-container">
        <div className="parent-error-banner">
          <p>Parent profile not found.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/parents")}
            className="btn-submit"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const fullName =
    `${parent.firstName || ""} ${parent.lastName || ""}`.trim() || "Guardian";

  return (
    <div className="parent-details-container">
      <div className="details-nav">
        <button
          type="button"
          onClick={() => navigate("/admin/parents")}
          className="btn-back-link"
        >
          &larr; Back to Parents Directory
        </button>
      </div>

      <div className="details-card">
        <h2 className="details-header-title">{fullName}</h2>
        <div className="details-grid">
          <div className="details-item">
            <span className="details-item-label">Email:</span>
            {parent.email || "N/A"}
          </div>
          <div className="details-item">
            <span className="details-item-label">Phone:</span>
            {parent.phone || "N/A"}
          </div>
          <div className="details-item">
            <span className="details-item-label">Relationship:</span>
            {parent.relationship || "Guardian"}
          </div>
          {parent.occupation && parent.occupation !== "N/A" && (
            <div className="details-item">
              <span className="details-item-label">Occupation:</span>
              {parent.occupation}
            </div>
          )}
          <div className="details-item-full">
            <span className="details-item-label">Address:</span>
            {parent.address || "N/A"}
          </div>
        </div>
      </div>

      <div className="details-card">
        <h3 className="details-header-title">
          Linked Students ({parent.students?.length || 0})
        </h3>
        {parent.students && parent.students.length > 0 ? (
          <div className="students-list">
            {parent.students.map((student) => {
              const studentIdentifier =
                student.displayId ||
                student.studentId ||
                student.admissionNo ||
                student.admissionNumber ||
                student.rollNumber ||
                student.id;

              const classDisplay =
                student.class?.name ||
                student.className ||
                (student.classId ? `Class ${student.classId}` : "Enrolled");

              return (
                <div key={student.id} className="student-list-item">
                  <div className="student-info">
                    <h4 className="student-name">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="student-subtext">
                      Student ID: {studentIdentifier} | Class: {classDisplay}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferringStudent(student)}
                    className="btn-action-assign"
                  >
                    Transfer Guardian
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="parent-subtitle">No students currently linked.</p>
        )}
      </div>

      <TransferChildModal
        isOpen={Boolean(transferringStudent)}
        onClose={() => setTransferringStudent(null)}
        onTransfer={transferChild}
        currentParent={parent}
        student={transferringStudent}
        allParents={parents}
      />
    </div>
  );
};

export default ParentDetailsPage;
