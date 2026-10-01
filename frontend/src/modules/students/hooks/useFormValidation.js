// In src/modules/students/hooks/useFormValidation.js
export const useFormValidation = () => {
  const validateStep = async (step, formData) => {
    const newErrors = {};

    if (step === 1) {
      // Personal Info validation - only validate fields backend accepts
      if (!formData.personalInfo.firstName?.trim()) {
        newErrors["personalInfo.firstName"] = "First name is required";
      }

      if (!formData.personalInfo.lastName?.trim()) {
        newErrors["personalInfo.lastName"] = "Last name is required";
      }

      if (!formData.personalInfo.dateOfBirth) {
        newErrors["personalInfo.dateOfBirth"] = "Date of birth is required";
      } else {
        const dob = new Date(formData.personalInfo.dateOfBirth);
        const today = new Date();
        
        // Check if date is in the future
        if (dob >= today) {
          newErrors["personalInfo.dateOfBirth"] = "Date of birth must be in the past";
        }
        
        // Check age (must be at least 3 years old)
        const ageInYears = (today - dob) / (365.25 * 24 * 60 * 60 * 1000);
        if (ageInYears < 3) {
          newErrors["personalInfo.dateOfBirth"] = "Student must be at least 3 years old";
        }
      }

      if (!formData.personalInfo.gender) {
        newErrors["personalInfo.gender"] = "Gender is required";
      } else if (
        !["MALE", "FEMALE", "OTHER"].includes(
          formData.personalInfo.gender.toUpperCase()
        )
      ) {
        newErrors["personalInfo.gender"] =
          "Gender must be Male, Female, or Other";
      }

      if (!formData.personalInfo.nationality?.trim()) {
        newErrors["personalInfo.nationality"] = "Nationality is required";
      }

  if (!formData.personalInfo.phone) {
        newErrors["personalInfo.phone"] = "Phone is required";
      } else if (
        !/^\d{9}$/.test(formData.personalInfo.phone.replace(/\D/g, ""))
      ) {
        newErrors["personalInfo.phone"] =
          "Phone must be 10 digits (including +251)";
      }

      // Email is optional but must be valid if provided
      if (
        formData.personalInfo.email &&
        !/\S+@\S+\.\S+/.test(formData.personalInfo.email)
      ) {
        newErrors["personalInfo.email"] = "Email is invalid";
      }

      // Pincode is REQUIRED
      if (!formData.personalInfo.pincode) {
        newErrors["personalInfo.pincode"] = "Pincode is required";
      } else {
        const pincodeStr = formData.personalInfo.pincode.toString();
        if (!/^\d{6}$/.test(pincodeStr)) {
          newErrors["personalInfo.pincode"] =
            "Pincode must be exactly 6 digits";
        }
      }
    }

    if (step === 2) {
      const guardianName = formData.guardianInfo.guardianName || "";
      const guardianPhone = formData.guardianInfo.guardianPhone || "";
      const guardianRelation = formData.guardianInfo.guardianRelation || "";

      if (!guardianName.trim()) {
        newErrors["guardianInfo.guardianName"] = "Guardian name is required";
      }
 if (!guardianPhone.trim()) {
        newErrors["guardianInfo.guardianPhone"] = "Guardian phone is required";
      } else if (!/^\d{9}$/.test(guardianPhone.replace(/\D/g, ""))) {
        newErrors["guardianInfo.guardianPhone"] =
          "Guardian phone must be 10 digits (including +251)";
      }

      if (!guardianRelation) {
        newErrors["guardianInfo.guardianRelation"] =
          "Guardian relation is required";
      }

      if (
        formData.guardianInfo.guardianEmail &&
        !/\S+@\S+\.\S+/.test(formData.guardianInfo.guardianEmail)
      ) {
        newErrors["guardianInfo.guardianEmail"] = "Guardian email is invalid";
      }
      
      // Check if guardian email matches student email
      if (
        formData.guardianInfo.guardianEmail &&
        formData.personalInfo.email &&
        formData.guardianInfo.guardianEmail.toLowerCase() === formData.personalInfo.email.toLowerCase()
      ) {
        newErrors["guardianInfo.guardianEmail"] = "Guardian email cannot be the same as student email";
      }
    }

    if (step === 3) {
      // Step 3 is optional - no required validations
      // Only validate if fields are provided
      
      if (formData.educationBackground.admissionTestScore) {
        const score = parseFloat(
          formData.educationBackground.admissionTestScore
        );
        if (isNaN(score) || score < 0 || score > 100) {
          newErrors["educationBackground.admissionTestScore"] =
            "Test score must be between 0 and 100";
        }
      }

      if (formData.educationBackground.admissionTestDate) {
        const testDate = new Date(
          formData.educationBackground.admissionTestDate
        );
        if (testDate > new Date()) {
          newErrors["educationBackground.admissionTestDate"] =
            "Test date cannot be in the future";
        }
      }
    }

// In useFormValidation.js - Update step 4 validation:
if (step === 4) {
  if (!formData.academicInfo.academicSession) {
    newErrors["academicInfo.academicSession"] =
      "Academic session is required";
  }

  if (!formData.academicInfo.className) {
    newErrors["academicInfo.className"] = "Class is required";
  }

  // Add section validation
  if (!formData.academicInfo.section) {
    newErrors["academicInfo.section"] = "Section is required";
  }
}

    console.log(`🔍 Step ${step} validation errors:`, newErrors);
    return newErrors;
  };

  return { validateStep };
};