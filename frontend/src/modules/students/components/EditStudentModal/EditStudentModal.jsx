import React, { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { studentAPI } from "../../api";
import { GENDERS, GUARDIAN_RELATIONS } from "../../constants/formConstants";

// Backend reality check (students.service.ts):
//  - PATCH /students/:id (updateStudent) only ever writes this exact set of
//    fields: firstName, lastName, dateOfBirth, gender, email, phone, address,
//    city, state, pincode, nationality, guardianName, guardianPhone,
//    guardianEmail, guardianRelation, guardianOccupation, classId, status.
//    Anything else you send passes DTO validation but is silently dropped by
//    the service, so it's deliberately not in this form — Education
//    background, admission test info, admission category, and
//    identification number can't be changed after admission through any
//    endpoint the backend currently exposes.
//  - Changing the class/section pairing goes through a different, correct
//    endpoint: PATCH /students/:id/assign-class (studentAPI.assignClass),
//    which resolves the section name to a real sectionId. The generic
//    update's `classId` field alone would move the student's class without
//    touching section, leaving them inconsistent — so class/section here are
//    always submitted together via assignClass, not via updateStudent.

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const emptyForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  status: "ACTIVE",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianOccupation: "",
};

// student here should be the raw backend record (StudentManagement.jsx keeps
// this on each row as `rawData`), not the re-nested display shape used for
// the table.
const mapStudentToForm = (student) => {
  if (!student) return emptyForm;
  const toDateInput = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };
  const stripCountryCode = (phone) =>
    (phone || "").toString().replace(/^\+?251/, "").replace(/\D/g, "").slice(0, 9);

  return {
    firstName: student.firstName || "",
    lastName: student.lastName || "",
    dateOfBirth: toDateInput(student.dateOfBirth),
    gender: (student.gender || "").toUpperCase(),
    nationality: student.nationality || "",
    email: student.email || "",
    phone: stripCountryCode(student.phone),
    address: student.address || "",
    city: student.city || "",
    state: student.state || "",
    pincode: student.pincode || "",
    status: (student.status || "ACTIVE").toUpperCase(),
    guardianName: student.guardianName || "",
    guardianRelation: (student.guardianRelation || "").toUpperCase(),
    guardianPhone: stripCountryCode(student.guardianPhone),
    guardianEmail: student.guardianEmail || "",
    guardianOccupation: student.guardianOccupation || "",
  };
};

const EditStudentModal = ({ student, onClose, onSaved }) => {
  const rawStudent = student?.rawData || student;
  const [form, setForm] = useState(() => mapStudentToForm(rawStudent));
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(
    rawStudent?.classId || rawStudent?.class?.id || ""
  );
  const [selectedSection, setSelectedSection] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(mapStudentToForm(rawStudent));
    setSelectedClassId(rawStudent?.classId || rawStudent?.class?.id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      const res = await studentAPI.getClasses();
      if (res.success) setClasses(res.data || []);
      setLoadingClasses(false);
    };
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setSections([]);
      return;
    }
    const loadSections = async () => {
      setLoadingSections(true);
      const res = await studentAPI.getSectionsByClass(selectedClassId);
      if (res.success) setSections(res.data || []);
      setLoadingSections(false);
    };
    loadSections();
  }, [selectedClassId]);

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender || undefined,
        nationality: form.nationality.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        status: form.status || undefined,
        guardianName: form.guardianName.trim() || undefined,
        guardianRelation: form.guardianRelation || undefined,
        guardianEmail: form.guardianEmail.trim() || undefined,
        guardianOccupation: form.guardianOccupation.trim() || undefined,
      };
      if (form.dateOfBirth) updatePayload.dateOfBirth = form.dateOfBirth;
      if (form.phone) updatePayload.phone = `+251${form.phone}`;
      if (form.guardianPhone) updatePayload.guardianPhone = `+251${form.guardianPhone}`;
      if (selectedClassId) updatePayload.classId = parseInt(selectedClassId, 10);

      await studentAPI.updateStudent(rawStudent.id, updatePayload);

      // Only hit assign-class if the admin actually picked a section here —
      // otherwise leave the existing class/section assignment untouched.
      if (selectedClassId && selectedSection) {
        await studentAPI.assignClass(
          rawStudent.id,
          parseInt(selectedClassId, 10),
          selectedSection
        );
      }

      onSaved?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-xl shadow-[var(--shadow-md)] max-w-[800px] w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="shrink-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-t-xl border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold m-0">
            Edit Student {rawStudent?.firstName ? `— ${rawStudent.firstName} ${rawStudent.lastName || ""}` : ""}
          </h2>
          <button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-lg transition-all duration-200"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          <p className="text-xs text-gray-500 mb-4">
            Only these fields can currently be updated after admission. Education background, admission test details, admission category, and identification number aren't editable here — the backend doesn't persist changes to those on update.
          </p>

          {error && (
            <div className="bg-[#fef2f2] border border-[#fecaca] text-[#ef4444] px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <h4 className="text-base font-semibold text-secondary mb-3">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleField("firstName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleField("lastName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleField("gender", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => handleField("nationality", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">+251</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleField("phone", e.target.value.replace(/\D/g, "").slice(0, 9))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                  placeholder="9XXXXXXX"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleField("email", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="col-span-full flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => handleField("address", e.target.value)}
                rows="2"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleField("city", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleField("state", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Pincode</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleField("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h4 className="text-base font-semibold text-secondary mb-3">Guardian Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Guardian's Name</label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => handleField("guardianName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Relation</label>
              <select
                value={form.guardianRelation}
                onChange={(e) => handleField("guardianRelation", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              >
                <option value="">Select relation</option>
                {GUARDIAN_RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">+251</span>
                <input
                  type="tel"
                  value={form.guardianPhone}
                  onChange={(e) => handleField("guardianPhone", e.target.value.replace(/\D/g, "").slice(0, 9))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                  placeholder="9XXXXXXX"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Email</label>
              <input
                type="email"
                value={form.guardianEmail}
                onChange={(e) => handleField("guardianEmail", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Occupation</label>
              <input
                type="text"
                value={form.guardianOccupation}
                onChange={(e) => handleField("guardianOccupation", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
              />
            </div>
          </div>

          <h4 className="text-base font-semibold text-secondary mb-3">Class Assignment</h4>
          <p className="text-xs text-gray-500 mb-3">
            Leave section blank to change class only. To move the student to a specific section, select both — changes here go through the dedicated class/section assignment endpoint, not the general update.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSection("");
                }}
                disabled={loadingClasses}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">Unchanged</option>
                {classes.map((cls) => (
                  <option key={cls.id || cls._id || cls} value={cls.id || cls._id || cls}>
                    {cls.name || cls.className || cls.grade || `Class ${cls.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-secondary mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClassId || loadingSections}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">Unchanged</option>
                {sections.map((sec) => (
                  <option key={sec.id || sec._id || sec} value={sec.name || sec.sectionName || sec.code}>
                    {sec.name || sec.sectionName || sec.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
