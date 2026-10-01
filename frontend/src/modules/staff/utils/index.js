// Utility functions for staff module
// src/modules/staff/utils/index.js
// Format staff name
export const formatStaffName = (firstName, lastName) => {
  return `${firstName} ${lastName}`.trim();
};

// Generate staff ID (for mock data)
export const generateStaffId = (index) => {
  return `STF${String(index).padStart(3, "0")}`;
};

// Calculate years of service
export const calculateServiceYears = (joinDate) => {
  if (!joinDate) return 0;

  const join = new Date(joinDate);
  const now = new Date();
  const years = now.getFullYear() - join.getFullYear();
  const months = now.getMonth() - join.getMonth();

  return years + (months < 0 ? -1 : 0);
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Export staff data to CSV
export const exportToCSV = (staffData, filename = "staff_export.csv") => {
  const headers = [
    "Staff ID",
    "Name",
    "Email",
    "Phone",
    "Role",
    "Department",
    "Designation",
    "Status",
    "Join Date",
  ];

  const csvContent = [
    headers.join(","),
    ...staffData.map((staff) =>
      [
        staff.staffId,
        `"${formatStaffName(staff.firstName, staff.lastName)}"`,
        staff.email,
        staff.phone,
        staff.role,
        staff.department,
        staff.designation,
        staff.status,
        staff.joinDate,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Filter staff by search term
export const filterStaff = (staffList, searchTerm) => {
  if (!searchTerm) return staffList;

  const term = searchTerm.toLowerCase();
  return staffList.filter(
    (staff) =>
      staff.firstName.toLowerCase().includes(term) ||
      staff.lastName.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term) ||
      staff.staffId.toLowerCase().includes(term) ||
      staff.department.toLowerCase().includes(term),
  );
};

// Sort staff by field
export const sortStaff = (staffList, field, direction = "asc") => {
  const sorted = [...staffList].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Handle dates
    if (field.includes("Date") || field === "joinDate") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle strings
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
};
