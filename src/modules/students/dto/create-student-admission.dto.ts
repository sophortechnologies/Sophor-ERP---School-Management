import { 
  IsString, 
  IsEmail, 
  IsDate, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsBoolean,
  IsEnum,
  Min,
  Max,
  Matches,
  ValidateIf,
  IsDecimal
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class CreateStudentAdmissionDto {
  // Personal Information
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'First name must contain only letters and spaces' })
  firstName: string;

  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Last name must contain only letters and spaces' })
  lastName: string;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsString()
  @IsEnum(['Male', 'Female', 'Other'])
  gender: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  category?: string;

  // Contact Information
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  // Guardian Information (FR1.2)
  @IsString()
  guardianName: string;

  @IsString()
  guardianRelation: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid guardian phone number format' })
  guardianPhone: string;

  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @IsString()
  @IsOptional()
  guardianOccupation?: string;

  @IsOptional()
  @IsDecimal()
  guardianIncome?: Prisma.Decimal;

  // Previous Education (FR1.3)
  @IsString()
  @IsOptional()
  previousSchool?: string;

  @IsString()
  @IsOptional()
  previousClass?: string;

  @IsOptional()
  @IsDecimal()
  previousPercentage?: Prisma.Decimal;

  @IsString()
  @IsOptional()
  tcNumber?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  tcDate?: Date;

  // Admission Test Details (FR1.3)
  @IsOptional()
  @IsDecimal()
  admissionTestMarks?: Prisma.Decimal;

  @IsOptional()
  @IsNumber()
  @Min(1)
  admissionTestRank?: number;

  @IsString()
  @IsOptional()
  admissionRemarks?: string;

  // Health Information
  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  // Academic Information
  @IsString()
  classId: string;

  @IsString()
  sessionId: string;

  @IsString()
  @IsOptional()
  rollNumber?: string;

  // Documents (FR1.6)
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  birthCertificateUrl?: string;

  @IsString()
  @IsOptional()
  tcUrl?: string;

  @IsString()
  @IsOptional()
  aadharUrl?: string;

  @IsString()
  @IsOptional()
  idProofUrl?: string;

  @IsString()
  @IsOptional()
  transcriptUrl?: string;

  @IsString()
  @IsOptional()
  medicalCertificateUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  otherDocuments?: string[];
}