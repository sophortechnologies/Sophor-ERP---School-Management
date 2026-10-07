export const formatParentPayload = (formData) => {
  return {
    email: formData.email?.trim(),
    password: formData.password || undefined,
    firstName: formData.firstName?.trim(),
    lastName: formData.lastName?.trim(),
    phone: formData.phone?.trim() || null,
    relationship: formData.relationship || "GUARDIAN",
    occupation: formData.occupation?.trim() || null,
    address: formData.address?.trim() || null,
    studentIds: formData.studentIds || [],
  };
};

export const getParentFullName = (parent) => {
  if (!parent) return "";
  if (parent.user) {
    return `${parent.user.firstName || ""} ${parent.user.lastName || ""}`.trim();
  }
  return `${parent.firstName || ""} ${parent.lastName || ""}`.trim() || "N/A";
};
