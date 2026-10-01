// Staff roles
// Staff roles - Remove Teacher since it has separate module
//src/modules/staff/constants/index.js
export const STAFF_ROLES = [
  { value: "Administrator", label: "Administrator" },
  { value: "Principal", label: "Principal" },
  { value: "Vice Principal", label: "Vice Principal" },
  { value: "Head of Department", label: "Head of Department" },
  { value: "Accountant", label: "Accountant" },
  { value: "Librarian", label: "Librarian" },
  { value: "IT Support", label: "IT Support" },
  { value: "Maintenance", label: "Maintenance Staff" },
  { value: "Security", label: "Security Guard" },
  { value: "Cleaner", label: "Cleaner" },
  { value: "Driver", label: "Driver" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Nurse", label: "School Nurse" },
  { value: "Counselor", label: "Counselor" },
];

// Designations (REQUIRED)
export const DESIGNATIONS = [
  { value: "Principal", label: "Principal" },
  { value: "Vice Principal", label: "Vice Principal" },
  { value: "Head of Department", label: "Head of Department" },
  { value: "Senior Teacher", label: "Senior Teacher" },
  { value: "Teacher", label: "Teacher" },
  { value: "Assistant Teacher", label: "Assistant Teacher" },
  { value: "Administrator", label: "Administrator" },
  { value: "Accountant", label: "Accountant" },
  { value: "Librarian", label: "Librarian" },
  { value: "IT Manager", label: "IT Manager" },
  { value: "Support Staff", label: "Support Staff" },
];

// Employment Types (REQUIRED - must map to backend format)
export const EMPLOYMENT_TYPES = [
  { value: "Full Time", label: "Full Time", backendValue: "FULL_TIME" },
  { value: "Part Time", label: "Part Time", backendValue: "PART_TIME" },
  { value: "Contract", label: "Contract", backendValue: "CONTRACT" },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

// Marital status
export const MARITAL_STATUS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

// Blood groups
export const BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

// Staff status - UPDATED for backend uppercase values
export const STAFF_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const STAFF_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "INACTIVE", label: "Inactive", color: "gray" },
];

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  MIN_LENGTH: (min) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max) => `Maximum ${max} characters allowed`,
};

// Default form values - Backend required fields
export const DEFAULT_STAFF_FORM = {
  // Backend required fields
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  employmentType: "FULL_TIME",
  joinDate: new Date().toISOString().split("T")[0],

  // Optional fields for UI (not sent to backend)
  role: "",
  department: "",
  departmentId: null,
  experience: "",
  qualifications: "",
  dateOfBirth: "",
  gender: "Male",
  bloodGroup: "",
  maritalStatus: "Single",
  nationality: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  status: "ACTIVE",
};

// Employment type mapping for backend
export const EMPLOYMENT_TYPE_MAP = {
  "Full Time": "FULL_TIME",
  "Part Time": "PART_TIME",
  Contract: "CONTRACT",
  Temporary: "TEMPORARY",
  Intern: "INTERN",
};
