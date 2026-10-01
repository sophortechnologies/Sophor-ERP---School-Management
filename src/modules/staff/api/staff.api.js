// src/modules/staff/api/staff.api.js
import api from "../../../api/axios";

const transformToBackendFormat = (staffData) => {
  console.log(" Transforming staff data for backend...", staffData);

  // Map employment type to backend format
  const employmentTypeMap = {
    FULL_TIME: "FULL_TIME",
    "Full Time": "FULL_TIME",
    PART_TIME: "PART_TIME",
    "Part Time": "PART_TIME",
    CONTRACT: "CONTRACT",
    Contract: "CONTRACT",
  };

  // Get formatted employment type
  let employmentType = employmentTypeMap[staffData.employmentType];

  // If not in map, try to convert
  if (!employmentType) {
    const upper = staffData.employmentType?.toUpperCase();
    if (upper === "FULL_TIME" || upper === "FULL-TIME") {
      employmentType = "FULL_TIME";
    } else if (upper === "PART_TIME" || upper === "PART-TIME") {
      employmentType = "PART_TIME";
    } else if (upper === "CONTRACT") {
      employmentType = "CONTRACT";
    } else {
      employmentType = "FULL_TIME"; // Default
    }
  }

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split("T")[0];
    }
  };

  // Generate username
  const generateUsername = (firstName, lastName) => {
    if (!firstName || !lastName)
      return "user" + Date.now().toString().slice(-6);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(
      /\s+/g,
      "",
    );
  };

  // Generate password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + "!";
  };

  // Build backend payload
  return {
    username: generateUsername(staffData.firstName, staffData.lastName),
    email:
      staffData.email ||
      `${generateUsername(staffData.firstName, staffData.lastName)}@school.edu`,
    password: generatePassword(),
    firstName: staffData.firstName || "",
    lastName: staffData.lastName || "",
    phone: staffData.phone || "+251900000000",
    designation: staffData.designation || "Staff",
    employmentType: employmentType,
    joiningDate:
      formatDate(staffData.joinDate) || new Date().toISOString().split("T")[0],
  };
};

// Main staff API object
const staffApi = {
  // ==================== GET ALL STAFF ====================
  getStaff: async (params = {}) => {
    try {
      console.log("🔍 Fetching staff list from /staff");
      console.log("📡 URL:", api.defaults.baseURL + "/staff");

      // MAKE A DIRECT FETCH TO SEE RAW RESPONSE
      const testResponse = await fetch("http://localhost:5000/staff");
      const testData = await testResponse.json();
      console.log("🔴 RAW BACKEND RESPONSE:", testData);
      console.log("🔴 Response keys:", Object.keys(testData));
      console.log("🔴 Is array?", Array.isArray(testData));
      console.log(
        "🔴 First item:",
        testData[0] || testData?.data?.[0] || testData?.staff?.[0],
      );

      // Now use your axios instance
      const response = await api.get("/staff", { params });

      console.log("✅ Axios response structure:");
      console.log("   Response data:", response.data);
      console.log("   Data type:", typeof response.data);
      console.log("   Is array?", Array.isArray(response.data));

      if (response.data && typeof response.data === "object") {
        console.log("   Object keys:", Object.keys(response.data));
        console.log("   Has 'data' property?", "data" in response.data);
        console.log("   Has 'staff' property?", "staff" in response.data);
        console.log("   Has 'users' property?", "users" in response.data);
      }

      // Handle different response structures
      let staffArray = [];
      let totalCount = 0;

      // Check common patterns
      if (Array.isArray(response.data)) {
        // Case 1: Direct array response [...]
        console.log("✅ Pattern: Direct array");
        staffArray = response.data;
        totalCount = staffArray.length;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Case 2: Paginated { data: [...], total: X }
        console.log("✅ Pattern: Paginated with 'data' property");
        staffArray = response.data.data;
        totalCount =
          response.data.total || response.data.count || staffArray.length;
      } else if (response.data && Array.isArray(response.data.staff)) {
        // Case 3: { staff: [...], ... }
        console.log("✅ Pattern: 'staff' property");
        staffArray = response.data.staff;
        totalCount = response.data.total || staffArray.length;
      } else if (response.data && Array.isArray(response.data.users)) {
        // Case 4: { users: [...], ... }
        console.log("✅ Pattern: 'users' property");
        staffArray = response.data.users;
        totalCount = response.data.total || staffArray.length;
      } else if (response.data && typeof response.data === "object") {
        // Case 5: Maybe it's a single object or has different structure
        console.log("⚠️ Pattern: Object, trying to extract array");

        // Try to find any array property
        const arrayProperties = Object.keys(response.data).filter((key) =>
          Array.isArray(response.data[key]),
        );

        if (arrayProperties.length > 0) {
          console.log("   Found array properties:", arrayProperties);
          staffArray = response.data[arrayProperties[0]];
          totalCount = staffArray.length;
        } else {
          // Maybe it's an object with nested data
          console.log("   No array found, checking for nested data");
          staffArray = [response.data];
          totalCount = 1;
        }
      } else {
        console.error("❌ Unexpected response format:", response.data);
        return {
          data: [],
          total: 0,
          success: false,
          message: "Unexpected response format from server",
        };
      }

      console.log(`✅ Extracted ${staffArray.length} staff members`);

      // Log first item to see structure
      if (staffArray.length > 0) {
        console.log("🔍 First staff item structure:");
        console.log("   Raw:", staffArray[0]);
        console.log("   Keys:", Object.keys(staffArray[0]));
        console.log("   Has firstName?", "firstName" in staffArray[0]);
        console.log("   Has first_name?", "first_name" in staffArray[0]);
        console.log("   Has name?", "name" in staffArray[0]);
        console.log("   Has email?", "email" in staffArray[0]);
        console.log("   Has phone?", "phone" in staffArray[0]);
        console.log("   Has phone_number?", "phone_number" in staffArray[0]);
        console.log("   Has user?", "user" in staffArray[0]);
      }

      // Transform with flexible field mapping
      const transformedData = staffArray.map((item, index) => {
        console.log(`\n🔍 Processing item ${index}:`, item);

        // Try to extract ID
        let id = item.id || item._id || item.userId || index;

        // Try to extract name - check multiple possibilities
        let firstName = "";
        let lastName = "";

        // Check for direct fields
        if (item.firstName) firstName = item.firstName;
        else if (item.first_name) firstName = item.first_name;
        else if (item.fname) firstName = item.fname;
        else if (item.name) {
          // Try to split full name
          const nameParts = String(item.name).split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        if (item.lastName) lastName = item.lastName;
        else if (item.last_name) lastName = item.last_name;
        else if (item.lname) lastName = item.lname;

        // Check nested user object (common in some APIs)
        if (item.user) {
          console.log("   Found nested user object");
          if (!firstName && item.user.firstName)
            firstName = item.user.firstName;
          if (!firstName && item.user.first_name)
            firstName = item.user.first_name;
          if (!lastName && item.user.lastName) lastName = item.user.lastName;
          if (!lastName && item.user.last_name) lastName = item.user.last_name;
          if (!id && item.user.id) id = item.user.id;
        }

        // Try to extract email
        let email = item.email || "";
        if (!email && item.user && item.user.email) email = item.user.email;

        // Try to extract phone
        let phone =
          item.phone || item.phone_number || item.mobile || item.contact || "";
        if (!phone && item.user && item.user.phone) phone = item.user.phone;

        // Try to extract designation/role
        let designation =
          item.designation ||
          item.position ||
          item.job_title ||
          item.role ||
          "";
        let role = item.role || item.designation || "";

        // Try to extract staff ID
        let staffId =
          item.staffCode ||
          item.staff_id ||
          item.staffId ||
          item.employeeId ||
          item.employee_id ||
          `STF${String(id).padStart(3, "0")}`;

        // Employment type
        const employmentType =
          item.employmentType ||
          item.employment_type ||
          item.employmentStatus ||
          "FULL_TIME";

        // Dates
        const joinDate =
          item.joiningDate ||
          item.joining_date ||
          item.join_date ||
          item.date_joined ||
          item.createdAt ||
          item.created_at;

        // Status
        const status = (item.status || "ACTIVE").toUpperCase();

        const transformedItem = {
          id: id,
          staffId: staffId,
          firstName: firstName || "",
          lastName: lastName || "",
          fullName: `${firstName} ${lastName}`.trim() || "Unnamed Staff",
          email: email || "",
          phone: phone || "",
          role: role || "Staff",
          designation: designation || "Staff",
          employmentType: employmentType,
          joinDate: joinDate,
          status: status,
          // Keep raw for debugging
          rawData: item,
        };

        console.log(`✅ Transformed item ${index}:`, transformedItem);
        return transformedItem;
      });

      console.log(
        `🎯 Successfully transformed ${transformedData.length} staff members`,
      );

      return {
        data: transformedData,
        total: totalCount,
        success: true,
        message: "Staff data fetched successfully",
      };
    } catch (error) {
      console.error("❌ Error fetching staff:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      return {
        data: [],
        total: 0,
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch staff data",
      };
    }
  },
  // ==================== CREATE NEW STAFF ====================
  createStaff: async (staffData) => {
    try {
      console.log(" Creating new staff with data:", staffData);

      const backendPayload = transformToBackendFormat(staffData);

      console.log(" Sending to /staff/register:", backendPayload);

      const response = await api.post("/staff/register", backendPayload);

      console.log(" Staff created successfully:", response.data);

      // Transform response to frontend format
      const staff = response.data;

      // Extract fields with multiple possible names
      const firstName =
        staff.first_name || staff.firstName || staffData.firstName || "";
      const lastName =
        staff.last_name || staff.lastName || staffData.lastName || "";

      const frontendData = {
        id: staff.id || staff._id,
        staffId:
          staff.staffCode ||
          staff.staff_id ||
          `STF${(staff.id || "").toString().padStart(3, "0")}`,
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: staff.email || staffData.email || "",
        phone: staff.phone || staffData.phone || "",
        role: staff.role || staffData.role || "Staff",
        designation: staff.designation || staffData.designation || "Staff",
        employmentType:
          staff.employmentType ||
          staff.employment_type ||
          staffData.employmentType ||
          "FULL_TIME",
        joinDate:
          staff.joining_date ||
          staff.joiningDate ||
          staffData.joinDate ||
          new Date().toISOString().split("T")[0],
        status: (staff.status || "ACTIVE").toUpperCase(),
      };

      return {
        data: frontendData,
        success: true,
        message:
          "Staff registered successfully. Password has been auto-generated.",
      };
    } catch (error) {
      console.error(" Error creating staff:", error);

      let errorMessage =
        error.response?.data?.message || "Failed to register staff member";

      if (error.response?.data?.errors) {
        const errorList = Object.entries(error.response.data.errors)
          .map(([field, errorMsg]) => `• ${field}: ${errorMsg}`)
          .join("\n");
        errorMessage += `\n\nValidation errors:\n${errorList}`;
      }

      return {
        data: null,
        success: false,
        message: errorMessage,
      };
    }
  },

  // ==================== GET STAFF BY ID ====================
  getStaffById: async (id) => {
    try {
      console.log(` Fetching staff with ID: ${id}`);

      const response = await api.get(`/staff/${id}`);
      console.log(" Staff details response:", response.data);

      const staff = response.data;

      // Extract fields with multiple possible names
      const firstName = staff.first_name || staff.firstName || "";
      const lastName = staff.last_name || staff.lastName || "";

      const frontendData = {
        id: staff.id || staff._id || id,
        staffId:
          staff.staffCode ||
          staff.staff_id ||
          staff.staffId ||
          `STF${(staff.id || id).toString().padStart(3, "0")}`,
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim() || "Unnamed Staff",
        email: staff.email || "",
        phone: staff.phone || staff.phone_number || staff.mobile || "",
        role: staff.role || staff.designation || "Staff",
        designation: staff.designation || "Staff",
        employmentType:
          staff.employmentType || staff.employment_type || "FULL_TIME",
        joinDate:
          staff.joining_date ||
          staff.joiningDate ||
          staff.join_date ||
          staff.createdAt,
        status: (staff.status || "ACTIVE").toUpperCase(),
        createdAt: staff.created_at || staff.createdAt,
      };

      return {
        data: frontendData,
        success: true,
        message: "Staff data fetched successfully",
      };
    } catch (error) {
      console.error(" Error fetching staff by ID:", error);
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch staff data",
      };
    }
  },

  // ==================== UPDATE STAFF ====================
  // ==================== UPDATE STAFF ====================
  updateStaff: async (id, staffData) => {
    try {
      console.log(` Updating staff ID ${id}:`, staffData);

      // Create update payload - send only allowed fields
      const updatePayload = {};

      // Only include fields that are allowed to be updated by backend
      if (staffData.designation !== undefined && staffData.designation !== "") {
        updatePayload.designation = staffData.designation;
      }
      if (
        staffData.employmentType !== undefined &&
        staffData.employmentType !== ""
      ) {
        // Convert employment type to backend format
        let employmentType = staffData.employmentType;
        if (employmentType === "Full Time") employmentType = "FULL_TIME";
        if (employmentType === "Part Time") employmentType = "PART_TIME";
        if (employmentType === "Contract") employmentType = "CONTRACT";
        updatePayload.employmentType = employmentType;
      }
      if (staffData.joinDate !== undefined && staffData.joinDate !== "") {
        updatePayload.joiningDate = staffData.joinDate;
      }
      if (staffData.departmentId !== undefined) {
        updatePayload.departmentId = staffData.departmentId;
      }
      if (staffData.status !== undefined && staffData.status !== "") {
        updatePayload.status = staffData.status.toUpperCase();
      }

      console.log(" Update payload:", updatePayload);

      const response = await api.put(`/staff/${id}`, updatePayload);

      console.log(" Update response:", response.data);

      const updatedStaff = response.data;

      // Extract fields
      const firstName =
        updatedStaff.first_name ||
        updatedStaff.firstName ||
        staffData.firstName ||
        "";
      const lastName =
        updatedStaff.last_name ||
        updatedStaff.lastName ||
        staffData.lastName ||
        "";

      const frontendData = {
        id: updatedStaff.id || updatedStaff._id || id,
        staffId:
          updatedStaff.staffCode ||
          updatedStaff.staff_id ||
          updatedStaff.staffId ||
          id,
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: updatedStaff.email || staffData.email || "",
        phone: updatedStaff.phone || staffData.phone || "",
        role:
          updatedStaff.role ||
          updatedStaff.designation ||
          staffData.role ||
          "Staff",
        designation:
          updatedStaff.designation || staffData.designation || "Staff",
        employmentType:
          updatedStaff.employmentType ||
          updatedStaff.employment_type ||
          staffData.employmentType ||
          "FULL_TIME",
        joinDate:
          updatedStaff.joining_date ||
          updatedStaff.joiningDate ||
          staffData.joinDate,
        status: (
          updatedStaff.status ||
          staffData.status ||
          "ACTIVE"
        ).toUpperCase(),
      };

      return {
        data: frontendData,
        success: true,
        message: "Staff updated successfully",
      };
    } catch (error) {
      console.error(" Error updating staff:", error);
      return {
        data: null,
        success: false,
        message:
          error.response?.data?.message || "Failed to update staff member",
      };
    }
  },

  // ==================== DELETE STAFF ====================
  deleteStaff: async (id) => {
    try {
      console.log(` Deleting staff ID: ${id}`);

      // Try soft delete first, then hard delete
      let response;
      try {
        response = await api.delete(`/staff/${id}`);
        console.log(" Soft delete successful");
      } catch (softError) {
        console.log(" Soft delete failed, trying hard delete...");
        response = await api.delete(`/staff/${id}/hard`);
        console.log(" Hard delete successful");
      }

      console.log(" Delete response:", response.data);

      return {
        success: true,
        message: "Staff deleted successfully",
        data: response.data,
      };
    } catch (error) {
      console.error(" Error deleting staff:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete staff member",
        error: error,
      };
    }
  },

  // ==================== UPDATE STAFF STATUS ====================
  updateStaffStatus: async (id, status) => {
    try {
      console.log(` Updating staff ${id} status to: ${status}`);

      const backendStatus = status.toUpperCase();
      let response;

      if (backendStatus === "INACTIVE") {
        // Use deactivate endpoint for inactive
        response = await api.put(`/staff/${id}/deactivate`, {
          status: backendStatus,
        });
      } else if (backendStatus === "ACTIVE") {
        // For activating, use regular update
        response = await api.put(`/staff/${id}`, { status: backendStatus });
      } else {
        // For other statuses, try status endpoint first
        try {
          response = await api.patch(`/staff/${id}/status`, {
            status: backendStatus,
          });
        } catch (statusError) {
          console.log("Status endpoint not found, trying update endpoint...");
          response = await api.put(`/staff/${id}`, { status: backendStatus });
        }
      }

      console.log(" Status update response:", response.data);

      return {
        data: response.data,
        success: true,
        message: `Staff status updated to ${backendStatus} successfully`,
      };
    } catch (error) {
      console.error(" Error updating staff status:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update staff status",
      };
    }
  },

  // ==================== SEARCH STAFF ====================
  searchStaff: async (searchTerm, params = {}) => {
    try {
      console.log(` Searching staff with term: "${searchTerm}"`);

      const searchParams = {
        ...params,
        search: searchTerm,
      };

      return await staffApi.getStaff(searchParams);
    } catch (error) {
      console.error(" Error searching staff:", error);
      return {
        data: [],
        total: 0,
        success: false,
        message: error.response?.data?.message || "Failed to search staff",
      };
    }
  },
};

export { staffApi };
