// src/modules/assets/components/AssignAssetModal.jsx
import React, { useState, useEffect } from "react";
import { X, User, Building, MapPin } from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import api from "../../../api/axios";
import { API_ENDPOINTS } from "../../../config/swagger.config";

const AssignAssetModal = ({ isOpen, onClose, asset, onSuccess }) => {
  const { assignAsset, loading } = useAssets();
  const [formData, setFormData] = useState({
    userId: "",
    departmentId: "",
    location: "",
  });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [assignmentType, setAssignmentType] = useState("user"); // "user" or "department"

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadDepartments();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.BASE, {
        params: { role: "STAFF" },
      });
      let usersData = [];
      if (response.data?.data) usersData = response.data.data;
      else if (Array.isArray(response.data)) usersData = response.data;
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);
      let departmentsData = [];
      if (response.data?.data) departmentsData = response.data.data;
      else if (Array.isArray(response.data)) departmentsData = response.data;
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...(assignmentType === "user"
        ? { userId: parseInt(formData.userId) }
        : {}),
      ...(assignmentType === "department"
        ? { departmentId: parseInt(formData.departmentId) }
        : {}),
      location: formData.location,
    };

    if (assignmentType === "user" && !submitData.userId) {
      alert("Please select a user");
      return;
    }
    if (assignmentType === "department" && !submitData.departmentId) {
      alert("Please select a department");
      return;
    }

    const result = await assignAsset(asset.id, submitData);
    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(result.error || "Failed to assign asset");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Asset: {asset.name}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Assignment Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="user"
                    checked={assignmentType === "user"}
                    onChange={() => setAssignmentType("user")}
                  />
                  <User size={16} />
                  Assign to User
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="department"
                    checked={assignmentType === "department"}
                    onChange={() => setAssignmentType("department")}
                  />
                  <Building size={16} />
                  Assign to Department
                </label>
              </div>
            </div>

            {assignmentType === "user" && (
              <div className="form-group">
                <label>Select User</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {assignmentType === "department" && (
              <div className="form-group">
                <label>Select Department</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Admin Building, Room 101"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignAssetModal;
