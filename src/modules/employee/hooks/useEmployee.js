import { useState, useEffect, useCallback } from "react";
import { employeeApi } from "../api/employee.api";

export const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empList, userList] = await Promise.all([
        employeeApi.getAllEmployees(),
        employeeApi.getAssignableUsers(),
      ]);
      setEmployees(Array.isArray(empList) ? empList : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load employee list.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    employees,
    setEmployees,
    users,
    loading,
    error,
    refreshEmployees: fetchAll,
  };
};

export default useEmployee;
