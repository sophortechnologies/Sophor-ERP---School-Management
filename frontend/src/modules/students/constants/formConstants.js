export const INITIAL_FORM_DATA = {
  personalInfo: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    identificationNumber: "", // matches backend's CreateStudentDto.identificationNumber
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  },
  guardianInfo: {
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianOccupation: "",
    guardianAddress: "",
    // NOTE: backend only stores ONE guardian record (see Prisma `Student` model —
    // there is no separate father/mother storage on the admission endpoint).
    // Don't add fatherName/motherName-style fields back here without a matching
    // backend field, or they'll silently be collected and then discarded.
  },
  educationBackground: {
    lastSchool: "",
    lastClass: "",
    previousAcademicYear: "",
    lastPercentage: "",
    admissionTestScore: "",
    admissionTestDate: "",
    remarks: "",
    // NOTE: no "Board/University" field here — CreateStudentDto has no matching
    // property, so it can never be sent to the backend.
  },
  academicInfo: {
    academicSession: "",
    className: "", // Changed from 'class' to 'className' for backend
    section: "",
    admissionCategory: "GENERAL",
    // NOTE: no rollNumber/admissionDate here — CreateStudentDto doesn't accept
    // either (admissionDate is server-generated; forbidNonWhitelisted would
    // reject the whole request if we sent it).
  },
  documents: {
    photo: null,
    birthCertificate: null,
    aadharCard: null,
    transferCertificate: null,
    marksheet: null,
  },
};

export const CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

export const SECTIONS = ["A", "B", "C", "D"];

export const GENDERS = ["MALE", "FEMALE", "OTHER"];

export const GUARDIAN_RELATIONS = ["FATHER", "MOTHER", "GUARDIAN", "OTHER"];

// NOTE: the backend's CreateStudentDto.admissionCategory enum is
// GENERAL/MANAGEMENT/NRI/SPORTS/OTHER — an Indian school-admissions quota
// scheme (NRI = "Non-Resident Indian") that doesn't map to anything
// meaningful here. Rather than surface it as a user-facing choice, we just
// send "GENERAL" for every admission (see INITIAL_FORM_DATA below and the
// payload builder in StudentAdmissionForm.jsx). Revisit only if the backend
// enum itself gets redefined for this deployment.

export const ACADEMIC_SESSIONS = [{ id: 3, name: "2025-2026", isActive: true }];

// Maps our UI's document keys to the backend's UploadDocumentDto.documentType
// enum (['BIRTH_CERTIFICATE','ID_PROOF','TRANSFER_CERTIFICATE',
// 'MEDICAL_CERTIFICATE','PHOTOGRAPH','MARKSHEET','GUARDIAN_ID','OTHER']).
// Sending the wrong string here 400s the upload.
export const DOCUMENT_TYPE_MAP = {
  photo: "PHOTOGRAPH",
  birthCertificate: "BIRTH_CERTIFICATE",
  aadharCard: "ID_PROOF",
  transferCertificate: "TRANSFER_CERTIFICATE",
  marksheet: "MARKSHEET",
};
