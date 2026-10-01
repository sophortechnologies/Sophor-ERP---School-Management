// src/modules/department/components/DepartmentList.jsx
import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Eye,
  Users,
  Building2,
  Calendar,
  Power,
} from "lucide-react";
import { teacherApi } from "../../teacher/api/teacher.api";
import "./DepartmentList.css";

const DepartmentList = ({
  departments,
  onEdit,
  onDelete,
  onViewStats,
  onToggleStatus,
}) => {
  const [teachersMap, setTeachersMap] = useState({});

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await teacherApi.getAllTeachers({ page_size: 100 });
        if (res.success && res.data) {
          const map = {};
          res.data.forEach((t) => {
            const name =
              `${t.firstName || t.first_name || ""} ${t.lastName || t.last_name || ""}`.trim() ||
              t.name;
            map[t.id] = name;
          });
          setTeachersMap(map);
        }
      } catch (e) {
        console.warn("Could not map teacher names:", e);
      }
    };
    fetchTeachers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="department-departmentlist-department-list printable-department-table">
      {/* Print-Only Title Header */}
      <div className="print-only-header">
        <h1
          style={{
            margin: "0 0 6px 0",
            fontSize: "24px",
            color: "#172b4c",
            fontWeight: "700",
          }}
        >
          SophorERP — List of Departments
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Generated on {new Date().toLocaleDateString()} | Total Departments:{" "}
          {departments.length}
        </p>
      </div>

      <table className="department-departmentlist-department-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Head Teacher</th>
            <th>Subjects / Teachers</th>
            <th>Status</th>
            <th>Created</th>
            <th className="no-print">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => {
            const headName = department.headId
              ? teachersMap[department.headId] ||
                `Teacher ID: ${department.headId}`
              : null;

            return (
              <tr key={department.id}>
                <td>
                  <div className="department-departmentlist-department-code">
                    <Building2 size={16} />
                    <strong>{department.code || "N/A"}</strong>
                  </div>
                </td>
                <td>
                  <div className="department-departmentlist-department-name">
                    <strong>{department.name || "N/A"}</strong>
                    {department.description && (
                      <div className="department-departmentlist-department-description">
                        {department.description.length > 60
                          ? `${department.description.substring(0, 60)}...`
                          : department.description}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="department-departmentlist-department-head">
                    {headName ? (
                      <>
                        <Users size={14} />
                        <span>{headName}</span>
                      </>
                    ) : (
                      <span className="department-departmentlist-no-head">
                        Not Assigned
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: "13px", color: "#475569" }}>
                    {department.counts?.subjects ?? 0} subjects /{" "}
                    {department.counts?.teachers ?? 0} teachers
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: department.isActive
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: department.isActive ? "#166534" : "#991b1b",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {department.status ||
                      (department.isActive ? "ACTIVE" : "INACTIVE")}
                  </span>
                </td>
                <td>
                  <div
                    className="department-date"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    <Calendar size={14} />
                    <span>{formatDate(department.createdAt)}</span>
                  </div>
                </td>
                <td className="no-print">
                  <div className="department-departmentlist-department-actions">
                    {/* Toggle Activate / Deactivate */}
                    <button
                      type="button"
                      className="department-action-btn"
                      onClick={() =>
                        onToggleStatus && onToggleStatus(department)
                      }
                      title={
                        department.isActive
                          ? "Deactivate Department"
                          : "Activate Department"
                      }
                      style={{
                        color: department.isActive ? "#d97706" : "#166534",
                      }}
                    >
                      <Power size={16} />
                    </button>

                    {/* View Details */}
                    <button
                      type="button"
                      className="department-action-btn"
                      onClick={() => onViewStats && onViewStats(department)}
                      title="View Details & Statistics"
                      style={{ color: "#2563eb" }}
                    >
                      <Eye size={16} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      className="department-action-btn"
                      onClick={() => onEdit && onEdit(department)}
                      title="Edit Department"
                      style={{ color: "#475569" }}
                    >
                      <Edit size={16} />
                    </button>

                    {/* Delete: White button with red trash icon */}
                    <button
                      type="button"
                      className="department-action-btn delete-btn"
                      onClick={() => onDelete && onDelete(department)}
                      title="Delete Department"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentList;
