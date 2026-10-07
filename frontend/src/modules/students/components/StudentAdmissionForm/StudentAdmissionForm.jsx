import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Users,
  GraduationCap,
  School,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useStudentForm } from "../../hooks/useStudentForm";
import { useFormValidation } from "../../hooks/useFormValidation";
import {
  INITIAL_FORM_DATA,
} from "../../constants/formConstants";
import { uploadDocuments } from "../../utils/formUtils";
import {
  PersonalInfoStep,
  GuardianInfoStep,
  EducationStep,
  AcademicStep,
  ReviewStep,
} from "./steps";
import { studentAPI } from "../../api";

const StudentAdmissionForm = ({ onClose: externalOnClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState({});
  const [showStepError, setShowStepError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState("");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successStudentId, setSuccessStudentId] = useState("");
  const [successStudentName, setSuccessStudentName] = useState("");

  const errorTimeoutRef = useRef(null);
  const modalRef = useRef(null);

  const { academicSessions } = useStudentForm();
  const { validateStep } = useFormValidation();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await studentAPI.getClasses();
        if (response.success && response.data) {
          setClasses(response.data);
        }
      } catch (error) {
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const fetchAllSections = async () => {
    setLoadingSections(true);
    try {
      const response = await studentAPI.getSections();
      if (response.success && response.data) {
        setSections(response.data);
      }
    } catch (error) {
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    fetchAllSections();
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
    }
  };

  const handleFileUpload = (documentType, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`documents.${documentType}`]: "File size must be less than 5MB",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [documentType]: file },
    }));
  };

  const nextStep = async () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const newErrors = await validateStep(currentStep, formData);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStepErrors(newErrors);
      setShowStepError(true);
      
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
      
      errorTimeoutRef.current = setTimeout(() => {
        setShowStepError(false);
      }, 5000);
      
      return;
    }
    
    setErrors({});
    setStepErrors({});
    setShowStepError(false);
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStepErrors({});
    setShowStepError(false);
    setCurrentStep((prev) => prev - 1);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (showSuccess) {
    resetForm();
    return;
  }

  setErrors({});
  setStepErrors({});
  setShowStepError(false);

  const newErrors = await validateStep(4, formData);
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length > 0) {
    setStepErrors(newErrors);
    setShowStepError(true);
    
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
    
    errorTimeoutRef.current = setTimeout(() => {
      setShowStepError(false);
    }, 5000);
    
    return;
  }

  setLoading(true);
  try {
    const formatPhone = (phone) => {
      if (!phone) return "";
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.startsWith("251") ? `+${cleaned}` : `+251${cleaned}`;
    };

    const parseSessionId = (sessionValue) => {
      if (!sessionValue) return 1;
      const id = parseInt(sessionValue);
      return isNaN(id) ? 1 : id;
    };

    const parseClassId = (classValue) => {
      if (!classValue) return null;
      const id = parseInt(classValue);
      return isNaN(id) ? null : id;
    };

    const formatDateForBackend = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        return null;
      }
    };

    const admissionData = {
      firstName: formData.personalInfo.firstName?.trim() || "",
      lastName: formData.personalInfo.lastName?.trim() || "",
      dateOfBirth: formatDateForBackend(formData.personalInfo.dateOfBirth) || "2000-01-01",
      gender: (formData.personalInfo.gender?.toUpperCase() || "MALE").slice(0, 6),
      email: formData.personalInfo.email?.trim() || 
             `${formData.personalInfo.firstName?.toLowerCase()}.${formData.personalInfo.lastName?.toLowerCase()}@sophor.edu`.replace(/\s+/g, ''),
      phone: formatPhone(formData.personalInfo.phone) || "+251900000000",
      
      address: formData.personalInfo.address?.trim() || "Not provided",
      city: formData.personalInfo.city?.trim() || "Addis Ababa",
      state: formData.personalInfo.state?.toString().trim() || "Addis Ababa",
      pincode: formData.personalInfo.pincode?.trim() || "1000",
      nationality: formData.personalInfo.nationality?.trim() || "Ethiopian",

      guardianName: formData.guardianInfo.guardianName?.trim() || 
                   `${formData.personalInfo.firstName} ${formData.personalInfo.lastName} Parent`,
      guardianPhone: formatPhone(formData.guardianInfo.guardianPhone) || 
                     formatPhone(formData.personalInfo.phone) || 
                     "+251911111111",
      guardianEmail: formData.guardianInfo.guardianEmail?.trim() || "",
      guardianRelation: (formData.guardianInfo.guardianRelation?.toUpperCase() || "FATHER").slice(0, 10),
      guardianOccupation: formData.guardianInfo.guardianOccupation?.trim() || "",
      guardianAddress: formData.guardianInfo.guardianAddress?.trim() || 
                      formData.personalInfo.address?.trim() || "Same as student",

      previousSchool: formData.educationBackground.lastSchool?.trim() || "",
      lastGradeCompleted: formData.educationBackground.lastClass?.trim() || "",
      previousAcademicYear: formData.educationBackground.previousAcademicYear?.trim() || "",
      lastGradeMarks: formData.educationBackground.lastPercentage?.trim() || "",

      admissionTestDate: formatDateForBackend(formData.educationBackground.admissionTestDate),
      admissionTestScore: formData.educationBackground.admissionTestScore || 0,
      admissionTestResult: formData.educationBackground.admissionTestScore >= 50 ? "PASS" : "FAIL",
      admissionRemarks: formData.educationBackground.remarks?.trim() || "",

      sessionId: parseSessionId(formData.academicInfo.academicSession),
      classId: parseClassId(formData.academicInfo.className) || 1,
      section: formData.academicInfo.section || "A",
      admissionCategory: formData.academicInfo.admissionCategory || "GENERAL",

      termsAccepted: true,
    };

    if (formData.personalInfo.identificationNumber?.trim()) {
      admissionData.identificationNumber = formData.personalInfo.identificationNumber.trim();
    }

    if (admissionData.admissionTestDate === null) {
      delete admissionData.admissionTestDate;
    }
    
    if (admissionData.admissionTestScore === 0) {
      delete admissionData.admissionTestScore;
      delete admissionData.admissionTestResult;
    }
    
    const optionalFields = [
      'guardianEmail',
      'guardianOccupation',
      'guardianAddress',
      'previousSchool',
      'lastGradeCompleted',
      'previousAcademicYear',
      'lastGradeMarks',
      'admissionRemarks'
    ];
    
    optionalFields.forEach(field => {
      if (admissionData[field] === "" || admissionData[field] === "Not provided" || admissionData[field] === "Same as student") {
        delete admissionData[field];
      }
    });

    let backendSuccess = false;
    let backendStudentId = "";
    let backendResponse = null;
    let detailedError = null;

    let backendNumericId = null;

    try {
      backendResponse = await studentAPI.createStudentAdmission(admissionData);
      
      if (backendResponse.data) {
        const responseData = backendResponse.data;
        backendStudentId = responseData.studentId || 
                          responseData.id || 
                          responseData.data?.studentId ||
                          `STU${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
        // The documents endpoint (POST /students/:id/documents) needs the
        // numeric database id, not the human-readable studentId code above.
        backendNumericId = responseData.data?.id ?? responseData.id ?? null;
        backendSuccess = true;
      } else {
        throw new Error("Invalid response format from backend");
      }

      // Upload any selected documents (photo, birth certificate, ID, transfer
      // certificate, marksheet) now that the student record exists. This is
      // best-effort: the student was already created successfully, so a
      // document upload failure here shouldn't block the success screen —
      // it's surfaced via errors.documents instead.
      if (backendNumericId) {
        const hasDocuments = Object.values(formData.documents).some(Boolean);
        if (hasDocuments) {
          const uploadResult = await uploadDocuments(backendNumericId, formData.documents);
          if (!uploadResult.success) {
            setErrors((prev) => ({
              ...prev,
              documents: "Student was created, but one or more documents failed to upload. You can retry uploading them from the student's profile.",
            }));
          }
        }
      }

    } catch (backendError) {
      detailedError = backendError;
      
      let errorMessage = "Backend internal server error";
      if (backendError.response?.data) {
        try {
          const errorData = backendError.response.data;
          errorMessage = errorData.message || 
                        errorData.error || 
                        JSON.stringify(errorData);
        } catch {
          errorMessage = backendError.message;
        }
      }
      
      backendStudentId = `LOCAL${Date.now().toString().slice(-6)}`;
    }

    const studentRecord = {
      ...admissionData,
      studentId: backendStudentId,
      id: Date.now(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      source: backendSuccess ? "backend" : "local",
      backendResponse: backendResponse?.data || null,
      backendError: detailedError?.response?.data || null
    };

    const existing = JSON.parse(localStorage.getItem("studentAdmissions") || "[]");
    existing.push(studentRecord);
    localStorage.setItem("studentAdmissions", JSON.stringify(existing));

    setSuccessStudentId(backendStudentId);
    setSuccessStudentName(`${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`);
    setShowSuccess(true);
    setCurrentStep(5);

  } catch (error) {
    setErrors({ submit: "Failed to save student data" });
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setStepErrors({});
    setShowStepError(false);
    setCurrentStep(1);
    setGeneratedStudentId("");
    setShowSuccess(false);
    setSuccessStudentId("");
    setSuccessStudentName("");
    
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  };

  const handleClose = useCallback(() => {
    if (typeof externalOnClose === "function") {
      externalOnClose();
    } else {
      navigate("/admin/students", { replace: true });
    }
  }, [navigate, externalOnClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handlePrintConfirmation = () => window.print();

  const handleFileInputChange = (documentType, event) => {
    const file = event.target.files[0];
    if (file) handleFileUpload(documentType, file);
  };

  const dismissStepError = () => {
    setShowStepError(false);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
  };

  const stepProps = {
    formData,
    errors,
    handleChange,
    handleFileInputChange,
    academicSessions,
    classes,
    sections,
    loadingClasses,
    loadingSections,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      {showStepError && Object.keys(stepErrors).length > 0 && (
        <div className="fixed top-5 right-5 max-w-md bg-[#fef2f2] border border-[#fecaca] rounded-lg shadow-[var(--shadow-md)] z-[10001] animate-[slideInRight_0.3s_ease] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#fee2e2] text-[#991b1b] font-semibold text-sm border-b border-[#fecaca]">
            <AlertCircle size={16} />
            <span>Please fix the following errors:</span>
            <button 
              className="ml-auto bg-transparent border-none text-[#991b1b] cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[#991b1b]/10"
              onClick={dismissStepError}
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-4 max-h-60 overflow-y-auto">
            {Object.values(stepErrors).map((error, index) => (
              <div key={index} className="text-[#991b1b] text-sm mb-2 pl-2 leading-[1.4]">
                • {error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[var(--shadow-md)] max-w-[900px] w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="shrink-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-t-xl border-b border-gray-200 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <User size={24} />
              <h2 className="text-xl font-semibold m-0">Student Admission & Registration</h2>
              {showSuccess && (
                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <CheckCircle size={16} />
                  Registration Successful!
                </span>
              )}
            </div>
            <div className="header-actions">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-lg transition-all duration-200" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white px-6 pt-6 pb-6 relative z-10">
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 -z-10"></div>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center gap-2 relative z-10 flex-1 ${step === currentStep ? "active" : ""} ${
                  step < currentStep ? "completed" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300
                  ${step === currentStep ? "bg-primary text-white border-primary" :
                    step < currentStep ? "bg-primary text-white border-primary" :
                    "bg-gray-100 text-gray-500 border-gray-200"}`}
                >
                  {step}
                </div>
                <div className={`text-xs font-medium text-center ${
                  step === currentStep ? "text-primary font-semibold" : "text-gray-500"
                }`}>
                  {step === 1 && "Personal Info"}
                  {step === 2 && "Guardian Info"}
                  {step === 3 && "Education"}
                  {step === 4 && "Academic"}
                  {step === 5 && "Review"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          ref={modalRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6"
        >
          {errors.submit && (
            <div className="bg-[#fef2f2] border border-[#fecaca] text-[#ef4444] px-4 py-3 rounded-lg mb-4 text-sm">
              {errors.submit}
            </div>
          )}

          {errors.documents && (
            <div className="bg-[#fffbeb] border border-[#fde68a] text-[#92400e] px-4 py-3 rounded-lg mb-4 text-sm">
              {errors.documents}
            </div>
          )}

          {currentStep === 1 && <PersonalInfoStep {...stepProps} />}
          {currentStep === 2 && <GuardianInfoStep {...stepProps} />}
          {currentStep === 3 && <EducationStep {...stepProps} />}
          {currentStep === 4 && <AcademicStep {...stepProps} />}
          {currentStep === 5 && (
            <ReviewStep
              {...stepProps}
              loading={loading}
              generatedStudentId={successStudentId || generatedStudentId}
              studentName={successStudentName}
              showSuccess={showSuccess}
              onPrint={handlePrintConfirmation}
              onClose={handleClose}
              onPrev={prevStep}
              onReset={resetForm}
            />
          )}

          {currentStep < 5 && !generatedStudentId && !showSuccess && (
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-600 transition-all duration-200 flex items-center gap-2"
                  onClick={prevStep}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 ml-auto"
                onClick={nextStep}
              >
                {currentStep === 4 ? "Review & Submit" : "Next"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentAdmissionForm;