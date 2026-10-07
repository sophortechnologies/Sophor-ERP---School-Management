import { VALIDATION_RULES } from "../constants";

export const attendanceValidators = {
  // Validate CSV file
  validateCSVFile: (file) => {
    const errors = [];

    if (!file) {
      errors.push("File is required");
      return errors;
    }

    if (!VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push("Only CSV files are allowed");
    }

    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      errors.push(
        `File size must be less than ${
          VALIDATION_RULES.MAX_FILE_SIZE / 1024 / 1024
        }MB`
      );
    }
a
    return errors;
  },

  // Validate bulk upload data
  validateBulkData: (data) => {
    const errors = [];

    if (!Array.isArray(data)) {
      errors.push("Data must be an array");
      return errors;
    }

    if (data.length > VALIDATION_RULES.MAX_RECORDS_PER_UPLOAD) {
      errors.push(
        `Cannot upload more than ${VALIDATION_RULES.MAX_RECORDS_PER_UPLOAD} records at once`
      );
    }

    data.forEach((record, index) => {
      if (!record.studentId)
        errors.push(`Record ${index + 1}: Student ID is required`);
      if (!record.date) errors.push(`Record ${index + 1}: Date is required`);
      if (!record.status)
        errors.push(`Record ${index + 1}: Status is required`);

      if (record.date && new Date(record.date) > new Date()) {
        errors.push(
          `Record ${index + 1}: Cannot mark attendance for future dates`
        );
      }
    });

    return errors;
  },
};
