import { useState, useCallback, useEffect } from "react";
import { parentApi } from "../api/parent.api";

const PARENT_REGISTRY_KEY = "school_erp_parent_registry_v1";

export const useParent = (autoFetch = false) => {
  const [parents, setParents] = useState([]);
  const [studentsRaw, setStudentsRaw] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [myChildren, setMyChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load registered parent metadata cache (to retain parents who have 0 children)
  const getKnownParentRegistry = () => {
    try {
      const stored = localStorage.getItem(PARENT_REGISTRY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveKnownParentRegistry = (registry) => {
    try {
      localStorage.setItem(PARENT_REGISTRY_KEY, JSON.stringify(registry));
    } catch {
      // LocalStorage access fallback
    }
  };

  const fetchParents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await parentApi.getStudents(params);
      const studentList = Array.isArray(response)
        ? response
        : response?.data || response?.items || response?.students || [];

      setStudentsRaw(studentList);

      const registry = getKnownParentRegistry();
      const parentMap = new Map();

      // Seed parentMap with all previously known parents (even if they currently have 0 kids)
      Object.keys(registry).forEach((id) => {
        parentMap.set(id, {
          ...registry[id],
          students: [],
        });
      });

      studentList.forEach((student) => {
        const guardianName = (student.guardianName || "").trim();
        const guardianPhone = (
          student.guardianPhone ||
          student.emergencyPhone ||
          ""
        ).trim();
        const guardianEmail = (student.guardianEmail || "").trim();

        // Skip completely unassigned students
        if (!guardianName && !guardianPhone && !guardianEmail) {
          return;
        }

        const rawKey =
          guardianPhone || guardianEmail || guardianName || String(student.id);
        const safeId = String(rawKey).replace(/[^a-zA-Z0-9_-]/g, "");

        const nameParts = (guardianName || "Guardian").split(" ");
        const firstName = nameParts[0] || "Guardian";
        const lastName = nameParts.slice(1).join(" ") || "";

        const resolvedStudent = {
          ...student,
          displayId:
            student.studentId ||
            student.admissionNo ||
            student.admissionNumber ||
            student.rollNumber ||
            student.rollNo ||
            student.id,
        };

        if (!parentMap.has(safeId)) {
          const newParent = {
            id: safeId,
            firstName,
            lastName,
            email: guardianEmail,
            phone: guardianPhone,
            relationship: student.guardianRelation || "FATHER",
            occupation: student.emergencyContactName || "",
            address: student.address || student.emergencyAddress || "",
            students: [resolvedStudent],
          };
          parentMap.set(safeId, newParent);
          registry[safeId] = {
            id: safeId,
            firstName,
            lastName,
            email: guardianEmail,
            phone: guardianPhone,
            relationship: student.guardianRelation || "FATHER",
            occupation: student.emergencyContactName || "",
            address: student.address || student.emergencyAddress || "",
          };
        } else {
          const existing = parentMap.get(safeId);
          if (
            !existing.students.some((s) => String(s.id) === String(student.id))
          ) {
            existing.students.push(resolvedStudent);
          }
          // Preserve updated contact info
          if (guardianEmail) existing.email = guardianEmail;
          if (guardianPhone) existing.phone = guardianPhone;
        }
      });

      saveKnownParentRegistry(registry);
      setParents(Array.from(parentMap.values()));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load parent records.");
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParent = async (parentItem, formData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        guardianName:
          `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
        guardianPhone: formData.phone || undefined,
        guardianEmail: formData.email || undefined,
        guardianRelation: formData.relationship || undefined,
        address: formData.address || undefined,
      };

      // 1. Update backend student rows
      const updatePromises = (parentItem.students || []).map((st) =>
        parentApi.updateGuardianDetails(st.id, payload),
      );
      await Promise.all(updatePromises);

      // 2. Update persistent registry
      const registry = getKnownParentRegistry();
      registry[parentItem.id] = {
        ...registry[parentItem.id],
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        occupation: formData.occupation,
        address: formData.address,
      };
      saveKnownParentRegistry(registry);

      await fetchParents();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save parent changes.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignChild = async (parentId, studentId) => {
    setLoading(true);
    setError(null);
    try {
      const targetParent = parents.find(
        (p) => String(p.id) === String(parentId),
      );
      if (targetParent) {
        await parentApi.updateGuardianDetails(studentId, {
          guardianName:
            `${targetParent.firstName} ${targetParent.lastName}`.trim(),
          guardianPhone: targetParent.phone || undefined,
          guardianEmail: targetParent.email || undefined,
          guardianRelation: targetParent.relationship || "FATHER",
          address: targetParent.address || undefined,
        });
      }

      try {
        await parentApi.assignChild({ parentId, studentId });
      } catch {
        // Backend relational fallback
      }

      await fetchParents();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to link student.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transfer Child from one Parent to Another (Enforcing non-abandonment rule)
  const transferChild = async (currentParentId, targetParentId, studentId) => {
    setLoading(true);
    setError(null);
    try {
      const targetParent = parents.find(
        (p) => String(p.id) === String(targetParentId),
      );
      if (!targetParent) {
        throw new Error("Target guardian record not found.");
      }

      await parentApi.updateGuardianDetails(studentId, {
        guardianName:
          `${targetParent.firstName} ${targetParent.lastName}`.trim(),
        guardianPhone: targetParent.phone || undefined,
        guardianEmail: targetParent.email || undefined,
        guardianRelation: targetParent.relationship || "FATHER",
        address: targetParent.address || undefined,
      });

      try {
        await parentApi.removeChild({ parentId: currentParentId, studentId });
        await parentApi.assignChild({ parentId: targetParentId, studentId });
      } catch {
        // Ignore backend relational errors
      }

      await fetchParents();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to transfer student.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerParent = async (payload) => {
    setLoading(true);
    try {
      const safeId = String(
        payload.phone || payload.email || Date.now(),
      ).replace(/[^a-zA-Z0-9_-]/g, "");
      const registry = getKnownParentRegistry();
      registry[safeId] = {
        id: safeId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        relationship: payload.relationship || "FATHER",
        occupation: payload.occupation || "",
        address: payload.address || "",
      };
      saveKnownParentRegistry(registry);

      try {
        await parentApi.registerParent(payload);
      } catch {
        // Ignored if handled locally
      }

      await fetchParents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register parent.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await parentApi.getMyChildren();
      const list = Array.isArray(response)
        ? response
        : response?.data || response?.items || [];
      setMyChildren(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load children.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchParents();
    }
  }, [autoFetch, fetchParents]);

  return {
    parents,
    studentsRaw,
    selectedParent,
    setSelectedParent,
    myChildren,
    loading,
    error,
    fetchParents,
    updateParent,
    registerParent,
    assignChild,
    transferChild,
    fetchMyChildren,
  };
};

export default useParent;
