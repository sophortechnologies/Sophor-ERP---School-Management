import { Student as StudentModel } from '@prisma/client';

export class Student implements StudentModel {
  id: string;
  studentId: string;
  userId: string;
  admissionNumber: string;
  admissionDate: Date;
  classId: string;
  sessionId: string;
  rollNumber: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup: string | null;
  nationality: string;
  religion: string | null;
  category: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string | null;
  guardianOccupation: string | null;
  guardianIncome: any | null;
  previousSchool: string | null;
  previousClass: string | null;
  previousPercentage: any | null;
  tcNumber: string | null;
  tcDate: Date | null;
  medicalConditions: string | null;
  allergies: string | null;
  emergencyContact: string | null;
  photoUrl: string | null;
  birthCertificateUrl: string | null;
  tcUrl: string | null;
  aadharUrl: string | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // New fields for admission
  admissionTestMarks: any | null;
  admissionTestRank: number | null;
  admissionRemarks: string | null;
  idProofUrl: string | null;
  transcriptUrl: string | null;
  medicalCertificateUrl: string | null;
  otherDocuments: string[];
  admissionStage: string;
  assignedAutomatically: boolean;
  confirmationNumber: string | null;
  receiptGenerated: boolean;
}

export class StudentWithDetails extends Student {
  className?: string;
  section?: string;
  sessionName?: string;
  classTeacher?: string;
  attendancePercentage?: number;
  totalFeesPaid?: number;
  totalFeesDue?: number;
}

export class AdmissionStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  applicationsByClass: { className: string; count: number }[];
  applicationsByMonth: { month: string; count: number }[];
}