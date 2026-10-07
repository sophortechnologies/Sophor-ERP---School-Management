// In src/modules/students/utils/formUtils.js
import { studentAPI } from "../api";

export const handleFileValidation = (file) => {
  return file && file.size <= 5 * 1024 * 1024;
};

export const uploadDocuments = async (studentId, documents) => {
  const uploadPromises = [];
  Object.entries(documents).forEach(([docType, file]) => {
    if (file) {
      uploadPromises.push(studentAPI.uploadDocument(studentId, docType, file));
    }
  });

  try {
    await Promise.all(uploadPromises);
    console.log(" All documents uploaded successfully");
    return { success: true };
  } catch (error) {
    console.error(" Some documents failed to upload:", error);
    return { success: false, error };
  }
};

export const generateStudentId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `STU${year}${random}`;
};
