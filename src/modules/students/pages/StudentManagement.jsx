import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Filter,
  Users,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import StudentAdmissionForm from "../components/StudentAdmissionForm";
import { studentAPI } from "../api";

const StudentManagement = () => {
  const navigate = useNavigate();
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    graduated: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    class: "all",
    admissionDate: "all",
  });
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Activation modal state
  const [activationModal, setActivationModal] = useState({
    isOpen: false,
    student: null,
    password: "Student123!",
    confirmPassword: "Student123!",
    error: "",
    successMsg: "",
    loading: false,
  });

  // Helper to extract string values from nested response fields
  const extractValue = useCallback((value) => {
    if (!value && value !== 0) return "";
    if (typeof value !== "object") return String(value);
    if (Array.isArray(value))
      return value.map((v) => extractValue(v)).join(", ");

    const props = ["name", "value", "label", "text", "display"];
    for (const prop of props) {
      if (value[prop] != null) return String(value[prop]);
    }

    for (const key of Object.keys(value)) {
      if (typeof value[key] === "string" && value[key].trim())
        return value[key];
    }

    return "";
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getStudents();

      let apiStudents = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          apiStudents = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          apiStudents = response.data.data;
        } else if (
          response.data.students &&
          Array.isArray(response.data.students)
        ) {
          apiStudents = response.data.students;
        }
      }

      setStudents(apiStudents);
      setFilteredStudents(apiStudents);

      const total = apiStudents.length;
      const active = apiStudents.filter(
        (s) => (s.status || "").toUpperCase() === "ACTIVE",
      ).length;

      setStats({
        total,
        active,
        newThisMonth: total,
        graduated: 0,
      });
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter students based on search and selected filter dropdowns
  useEffect(() => {
    let result = [...students];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((student) => {
        const studentId = (
          student.studentId ||
          student.student_id ||
          ""
        ).toLowerCase();
        const firstName = (
          student.firstName ||
          student.personalInfo?.firstName ||
          ""
        ).toLowerCase();
        const lastName = (
          student.lastName ||
          student.personalInfo?.lastName ||
          ""
        ).toLowerCase();
        const email = (student.email || "").toLowerCase();

        return (
          studentId.includes(term) ||
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term)
        );
      });
    }

    if (filters.status !== "all") {
      result = result.filter(
        (student) =>
          (student.status || "").toUpperCase() === filters.status.toUpperCase(),
      );
    }

    setFilteredStudents(result);
  }, [searchTerm, filters, students]);

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await studentAPI.deleteStudent(studentId);
      loadStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  const handleOpenActivation = (student) => {
    setActivationModal({
      isOpen: true,
      student,
      password: "Student123!",
      confirmPassword: "Student123!",
      error: "",
      successMsg: "",
      loading: false,
    });
  };

  const handleConfirmActivation = async (e) => {
    e.preventDefault();
    const { student, password, confirmPassword } = activationModal;

    if (password !== confirmPassword) {
      setActivationModal((prev) => ({
        ...prev,
        error: "Passwords do not match",
      }));
      return;
    }

    // Backend complexity: 8+ chars, uppercase, lowercase, digit, special character
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;
    if (!regex.test(password)) {
      setActivationModal((prev) => ({
        ...prev,
        error:
          "Password must be at least 8 characters with an uppercase letter, lowercase letter, number, and special character (@$!%*?&)",
      }));
      return;
    }

    const studentCode = student.studentId || student.student_id;
    if (!studentCode) {
      setActivationModal((prev) => ({
        ...prev,
        error: "Student Code / ID is missing on this record.",
      }));
      return;
    }

    try {
      setActivationModal((prev) => ({ ...prev, loading: true, error: "" }));
      await studentAPI.activateStudent(studentCode, password);

      setActivationModal((prev) => ({
        ...prev,
        loading: false,
        successMsg: `Student ${studentCode} activated successfully! Password: ${password}`,
      }));

      loadStudents();

      setTimeout(() => {
        setActivationModal((prev) => ({
          ...prev,
          isOpen: false,
          successMsg: "",
        }));
      }, 2500);
    } catch (err) {
      setActivationModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err.response?.data?.message || err.message || "Activation failed",
      }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-gray-600">
            Admit, activate, and manage enrolled students.
          </p>
        </div>

        <button
          onClick={() => setShowAdmissionForm(true)}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg border-none cursor-pointer font-medium shadow-sm transition"
        >
          <UserPlus size={18} />
          <span>New Admission</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase">
            Total Students
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase">
            Active Students
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {stats.active}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-amber-500 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase">
            Pending Activation
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {
              students.filter(
                (s) => (s.status || "").toUpperCase() === "PENDING",
              ).length
            }
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-blue-600 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase">
            Total Classes
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">
            {new Set(students.map((s) => s.classId).filter(Boolean)).size || 1}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, student code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Activation</option>
            <option value="ADMITTED">Admitted</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl text-center text-gray-500 border border-gray-200">
          Loading students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            No Students Found
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search criteria or register a new student.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student ID</th>
                  <th className="px-5 py-3 font-semibold">Full Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Class / Section</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const studentId =
                    student.studentId ||
                    student.student_id ||
                    `STU${String(student.id).padStart(4, "0")}`;

                  const firstName =
                    student.firstName || student.personalInfo?.firstName || "";
                  const lastName =
                    student.lastName || student.personalInfo?.lastName || "";
                  const fullName =
                    `${firstName} ${lastName}`.trim() || student.name || "N/A";

                  const email = student.email || student.user?.email || "N/A";
                  const className =
                    student.class?.name || student.className || "Grade 10";
                  const sectionName =
                    student.section?.name || student.sectionName || "A";

                  const statusStr = (student.status || "PENDING").toUpperCase();
                  const isPending = statusStr === "PENDING";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-semibold text-emerald-700">
                        {studentId}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {fullName}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{email}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {className} - {sectionName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusStr === "ACTIVE" || statusStr === "ADMITTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusStr}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Account Activation & Password Setup Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActivation(student)}
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                            title="Activate Account & Set Password"
                          >
                            <KeyRound size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `Student: ${fullName}\nID: ${studentId}\nClass: ${className}\nStatus: ${statusStr}`,
                              )
                            }
                            className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete Student"
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
        </div>
      )}

      {/* Admission Form Modal */}
      {showAdmissionForm && (
        <StudentAdmissionForm
          onClose={() => {
            setShowAdmissionForm(false);
            loadStudents();
          }}
        />
      )}

      {/* Activation Modal */}
      {activationModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "460px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  color: "#172b4c",
                  fontWeight: "600",
                }}
              >
                Activate Student Account
              </h3>
              <button
                type="button"
                onClick={() =>
                  setActivationModal((prev) => ({ ...prev, isOpen: false }))
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                margin: "0 0 16px 0",
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              Set a login password for student{" "}
              <strong>
                {activationModal.student?.studentId ||
                  activationModal.student?.student_id}
              </strong>{" "}
              (
              {activationModal.student?.firstName ||
                activationModal.student?.personalInfo?.firstName}{" "}
              {activationModal.student?.lastName ||
                activationModal.student?.personalInfo?.lastName}
              ).
            </p>

            {activationModal.error && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "12px",
                }}
              >
                {activationModal.error}
              </div>
            )}

            {activationModal.successMsg && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle size={16} />
                <span>{activationModal.successMsg}</span>
              </div>
            )}

            <form onSubmit={handleConfirmActivation}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={activationModal.password}
                  onChange={(e) =>
                    setActivationModal((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. Student123!"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="text"
                  required
                  value={activationModal.confirmPassword}
                  onChange={(e) =>
                    setActivationModal((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. Student123!"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActivationModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activationModal.loading}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#1b633b",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {activationModal.loading
                    ? "Activating..."
                    : "Activate Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
