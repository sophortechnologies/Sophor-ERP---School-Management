import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/slices/authSlice";

const DebugLoginPage = () => {
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState("admin");

  const handleDebugLogin = (role) => {
    const users = {
      admin: {
        id: 1,
        username: "admin",
        role: "admin",
        name: "System Administrator",
      },
      teacher: {
        id: 2,
        username: "teacher",
        role: "teacher",
        name: "Tesfaye Alemu",
      },
      student: {
        id: 3,
        username: "student",
        role: "student",
        name: "Abrha Hailu",
      },
      parent: {
        id: 4,
        username: "parent",
        role: "parent",
        name: "Hailu Abate",
      },
    };

    const user = users[role];

    // Store mock token
    localStorage.setItem("accessToken", `mock-token-${role}`);
    localStorage.setItem("refreshToken", `mock-refresh-${role}`);

    // Set user in Redux
    dispatch(setUser(user));

    console.log(`✅ Debug login as ${role}:`, user);

    // Redirect to appropriate dashboard
    window.location.href = `/${role}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🏫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Debug Login</h1>
          <p className="text-gray-600 mt-2">
            Authentication is stuck. Use this to bypass.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Administrator</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <button
            onClick={() => handleDebugLogin(selectedRole)}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Login as{" "}
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> This page appears because
            authentication is failing. Check browser console for detailed error
            messages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugLoginPage;
