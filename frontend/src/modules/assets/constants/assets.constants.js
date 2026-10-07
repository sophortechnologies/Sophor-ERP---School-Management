export const ASSET_CATEGORIES = [
  { value: "IT", label: "IT Equipment", icon: "💻", color: "#3b82f6" },
  { value: "FURNITURE", label: "Furniture", icon: "🪑", color: "#8b5cf6" },
  { value: "VEHICLE", label: "Vehicle", icon: "🚗", color: "#10b981" },
  {
    value: "LAB_EQUIPMENT",
    label: "Lab Equipment",
    icon: "🔬",
    color: "#f59e0b",
  },
  { value: "LIBRARY", label: "Library", icon: "📚", color: "#ef4444" },
  { value: "BUILDING", label: "Building", icon: "🏢", color: "#6366f1" },
  { value: "SPORTS", label: "Sports", icon: "⚽", color: "#ec4899" },
  { value: "OTHER", label: "Other", icon: "📦", color: "#6b7280" },
];

export const ASSET_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "#10b981" },
  { value: "MAINTENANCE", label: "Under Maintenance", color: "#f59e0b" },
  { value: "RETIRED", label: "Retired", color: "#6b7280" },
  { value: "DISPOSED", label: "Disposed", color: "#ef4444" },
  { value: "LOST", label: "Lost", color: "#dc2626" },
];

export const DEPRECIATION_METHODS = [
  { value: "STRAIGHT_LINE", label: "Straight Line" },
  { value: "WRITTEN_DOWN_VALUE", label: "Written Down Value" },
];

export const MAINTENANCE_TYPES = [
  { value: "PREVENTIVE", label: "Preventive", color: "#10b981" },
  { value: "REPAIR", label: "Repair", color: "#f59e0b" },
  { value: "EMERGENCY", label: "Emergency", color: "#ef4444" },
  { value: "AMC", label: "AMC", color: "#3b82f6" },
  { value: "CALIBRATION", label: "Calibration", color: "#8b5cf6" },
];

export const DISPOSAL_TYPES = [
  { value: "SOLD", label: "Sold", icon: "💰" },
  { value: "SCRAPPED", label: "Scrapped", icon: "🗑️" },
  { value: "DONATED", label: "Donated", icon: "🎁" },
  { value: "LOST", label: "Lost", icon: "❓" },
  { value: "STOLEN", label: "Stolen", icon: "🚨" },
];

export const DEFAULT_ASSET_FORM = {
  name: "",
  model: "",
  manufacturer: "",
  serialNumber: "",
  category: "IT",
  subCategory: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  purchaseCost: "",
  vendorName: "",
  invoiceNumber: "",
  warrantyExpiry: "",
  depreciationMethod: "STRAIGHT_LINE",
  usefulLifeYears: 5,
  salvageValue: 0,
  currentLocation: "",
  maintenanceInterval: "",
  notes: "",
};

export const ASSET_TABLE_COLUMNS = [
  { key: "assetTag", label: "Asset Tag", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "purchaseCost", label: "Cost", sortable: true },
  { key: "currentValue", label: "Current Value", sortable: true },
  { key: "assignedTo", label: "Assigned To", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

export default {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  DEPRECIATION_METHODS,
  MAINTENANCE_TYPES,
  DISPOSAL_TYPES,
  DEFAULT_ASSET_FORM,
  ASSET_TABLE_COLUMNS,
};
