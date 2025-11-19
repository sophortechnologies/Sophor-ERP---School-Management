// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import {
//   IsString,
//   IsEmail,
//   IsInt,
//   IsDateString,
//   IsOptional,
//   IsEnum,
//   MinLength,
//   MaxLength,
//   Matches,
//   IsNotEmpty,
//   IsNumber,
//   Min,
// } from 'class-validator';

// // EXPORT the enums so other files can use them
// export enum Gender {
//   MALE = 'Male',
//   FEMALE = 'Female',
//   OTHER = 'Other',
// }

// export enum StudentStatus {
//   ACTIVE = 'Active',
//   INACTIVE = 'Inactive',
//   PASSED_OUT = 'Passed Out',
//   TRANSFERRED = 'Transferred',
// }

// export enum GuardianRelation {
//   FATHER = 'Father',
//   MOTHER = 'Mother',
//   GUARDIAN = 'Guardian',
//   OTHER = 'Other',
// }

// export class CreateStudentDto {
//   // ==========================================
//   // USER ACCOUNT INFORMATION (For Login)
//   // ==========================================
  
//   @ApiProperty({ 
//     example: 'john_student', 
//     description: 'Username for student login account' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(3)
//   @MaxLength(50)
//   @Matches(/^[a-zA-Z0-9_]+$/, { 
//     message: 'Username can only contain letters, numbers and underscores' 
//   })
//   username: string;

//   @ApiProperty({ 
//     example: 'john.student@school.edu', 
//     description: 'Student email address for login' 
//   })
//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @ApiProperty({ 
//     example: 'SecurePass123!', 
//     description: 'Password for student account (min 8 chars, with uppercase, lowercase, number and special character)' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
//   })
//   password: string;

//   // ==========================================
//   // ADMISSION INFORMATION
//   // ==========================================

//   @ApiProperty({ 
//     example: 'ADM2024001', 
//     description: 'Unique admission number' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   admissionNumber: string;

//   @ApiProperty({ 
//     example: 1, 
//     description: 'Class ID (must exist in classes table)' 
//   })
//   @IsInt()
//   @IsNotEmpty()
//   classId: number;

//   @ApiProperty({ 
//     example: 1, 
//     description: 'Academic Session ID (must exist in academic_sessions table)' 
//   })
//   @IsInt()
//   @IsNotEmpty()
//   sessionId: number;

//   @ApiPropertyOptional({ 
//     example: '101', 
//     description: 'Roll number in class' 
//   })
//   @IsString()
//   @IsOptional()
//   rollNumber?: string;

//   @ApiPropertyOptional({ 
//     example: '2024-01-15', 
//     description: 'Date of admission (defaults to current date if not provided)' 
//   })
//   @IsDateString()
//   @IsOptional()
//   admissionDate?: string;

//   // ==========================================
//   // PERSONAL INFORMATION
//   // ==========================================

//   @ApiProperty({ 
//     example: 'John', 
//     description: 'Student first name' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(2)
//   @MaxLength(50)
//   firstName: string;

//   @ApiProperty({ 
//     example: 'Doe', 
//     description: 'Student last name' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(2)
//   @MaxLength(50)
//   lastName: string;

//   @ApiProperty({ 
//     example: '2010-05-15', 
//     description: 'Date of birth (YYYY-MM-DD format)' 
//   })
//   @IsDateString()
//   @IsNotEmpty()
//   dateOfBirth: string;

//   @ApiProperty({ 
//     enum: Gender, 
//     example: Gender.MALE, 
//     description: 'Student gender' 
//   })
//   @IsEnum(Gender)
//   @IsNotEmpty()
//   gender: Gender;

//   @ApiPropertyOptional({ 
//     example: 'A+', 
//     description: 'Blood group (e.g., A+, B-, O+, AB-)' 
//   })
//   @IsString()
//   @IsOptional()
//   bloodGroup?: string;

//   @ApiPropertyOptional({ 
//     example: 'Ethiopian', 
//     description: 'Nationality (defaults to Ethiopian)' 
//   })
//   @IsString()
//   @IsOptional()
//   nationality?: string;

//   @ApiPropertyOptional({ 
//     example: 'Christian', 
//     description: 'Religion' 
//   })
//   @IsString()
//   @IsOptional()
//   religion?: string;

//   @ApiPropertyOptional({ 
//     example: 'General', 
//     description: 'Category (e.g., General, OBC, SC, ST)' 
//   })
//   @IsString()
//   @IsOptional()
//   category?: string;

//   // ==========================================
//   // CONTACT INFORMATION
//   // ==========================================

//   @ApiPropertyOptional({ 
//     example: '+251912345678', 
//     description: 'Student phone number (international format)' 
//   })
//   @IsString()
//   @IsOptional()
//   @Matches(/^\+?[1-9]\d{1,14}$/, { 
//     message: 'Invalid phone number format. Use international format (e.g., +251912345678)' 
//   })
//   phone?: string;

//   @ApiPropertyOptional({ 
//     example: '123 Main Street, Bole', 
//     description: 'Full residential address' 
//   })
//   @IsString()
//   @IsOptional()
//   address?: string;

//   @ApiPropertyOptional({ 
//     example: 'Addis Ababa', 
//     description: 'City name' 
//   })
//   @IsString()
//   @IsOptional()
//   city?: string;

//   @ApiPropertyOptional({ 
//     example: 'Addis Ababa', 
//     description: 'State or region' 
//   })
//   @IsString()
//   @IsOptional()
//   state?: string;

//   @ApiPropertyOptional({ 
//     example: '1000', 
//     description: 'Postal or pin code' 
//   })
//   @IsString()
//   @IsOptional()
//   pincode?: string;

//   // ==========================================
//   // GUARDIAN INFORMATION
//   // ==========================================

//   @ApiProperty({ 
//     example: 'Michael Doe', 
//     description: 'Guardian full name' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   guardianName: string;

//   @ApiProperty({ 
//     enum: GuardianRelation, 
//     example: GuardianRelation.FATHER, 
//     description: 'Relationship with student' 
//   })
//   @IsEnum(GuardianRelation)
//   @IsNotEmpty()
//   guardianRelation: GuardianRelation;

//   @ApiProperty({ 
//     example: '+251911111111', 
//     description: 'Guardian phone number (required for emergencies)' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @Matches(/^\+?[1-9]\d{1,14}$/, { 
//     message: 'Invalid phone number format' 
//   })
//   guardianPhone: string;

//   @ApiPropertyOptional({ 
//     example: 'guardian@email.com', 
//     description: 'Guardian email address' 
//   })
//   @IsEmail()
//   @IsOptional()
//   guardianEmail?: string;

//   @ApiPropertyOptional({ 
//     example: 'Business Owner', 
//     description: 'Guardian occupation' 
//   })
//   @IsString()
//   @IsOptional()
//   guardianOccupation?: string;

//   @ApiPropertyOptional({ 
//     example: 50000, 
//     description: 'Guardian monthly income (in ETB or local currency)' 
//   })
//   @IsNumber()
//   @IsOptional()
//   @Min(0)
//   guardianIncome?: number;

//   // ==========================================
//   // PREVIOUS EDUCATION
//   // ==========================================

//   @ApiPropertyOptional({ 
//     example: 'ABC School', 
//     description: 'Name of previous school' 
//   })
//   @IsString()
//   @IsOptional()
//   previousSchool?: string;

//   @ApiPropertyOptional({ 
//     example: 'Grade 9', 
//     description: 'Last class attended in previous school' 
//   })
//   @IsString()
//   @IsOptional()
//   previousClass?: string;

//   @ApiPropertyOptional({ 
//     example: 85.5, 
//     description: 'Percentage or grade in previous class' 
//   })
//   @IsNumber()
//   @IsOptional()
//   @Min(0)
//   previousPercentage?: number;

//   @ApiPropertyOptional({ 
//     example: 'TC123456', 
//     description: 'Transfer certificate number from previous school' 
//   })
//   @IsString()
//   @IsOptional()
//   tcNumber?: string;

//   @ApiPropertyOptional({ 
//     example: '2023-12-31', 
//     description: 'Transfer certificate issue date' 
//   })
//   @IsDateString()
//   @IsOptional()
//   tcDate?: string;

//   // ==========================================
//   // HEALTH INFORMATION
//   // ==========================================

//   @ApiPropertyOptional({ 
//     example: 'Asthma', 
//     description: 'Any chronic medical conditions or health issues' 
//   })
//   @IsString()
//   @IsOptional()
//   medicalConditions?: string;

//   @ApiPropertyOptional({ 
//     example: 'Peanuts, Pollen', 
//     description: 'Known allergies (comma-separated)' 
//   })
//   @IsString()
//   @IsOptional()
//   allergies?: string;

//   @ApiPropertyOptional({ 
//     example: '+251922222222', 
//     description: 'Emergency contact number (if different from guardian)' 
//   })
//   @IsString()
//   @IsOptional()
//   @Matches(/^\+?[1-9]\d{1,14}$/)
//   emergencyContact?: string;

//   // ==========================================
//   // DOCUMENT URLS (After Upload)
//   // ==========================================

//   @ApiPropertyOptional({ 
//     example: 'uploads/photos/student_photo_123.jpg', 
//     description: 'URL/path to student photo' 
//   })
//   @IsString()
//   @IsOptional()
//   photoUrl?: string;

//   @ApiPropertyOptional({ 
//     example: 'uploads/docs/birth_certificate_123.pdf', 
//     description: 'URL/path to birth certificate document' 
//   })
//   @IsString()
//   @IsOptional()
//   birthCertificateUrl?: string;

//   @ApiPropertyOptional({ 
//     example: 'uploads/docs/transfer_certificate_123.pdf', 
//     description: 'URL/path to transfer certificate document' 
//   })
//   @IsString()
//   @IsOptional()
//   tcUrl?: string;

//   @ApiPropertyOptional({ 
//     example: 'uploads/docs/aadhar_123.pdf', 
//     description: 'URL/path to Aadhar or ID document' 
//   })
//   @IsString()
//   @IsOptional()
//   aadharUrl?: string;

//   // ==========================================
//   // STATUS
//   // ==========================================

//   @ApiPropertyOptional({ 
//     enum: StudentStatus, 
//     example: StudentStatus.ACTIVE, 
//     description: 'Student status (defaults to Active)' 
//   })
//   @IsEnum(StudentStatus)
//   @IsOptional()
//   status?: StudentStatus;
// }
import { 
  IsString, 
  IsEmail, 
  IsDateString, 
  IsOptional, 
  IsNumber, 
  IsBoolean,
  IsEnum,
  Min,
  Max,
  IsNotEmpty,
  ValidateNested,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

export class GuardianInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relation: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsNumber()
  @IsOptional()
  income?: number;

  @IsString()
  @IsOptional()
  address?: string;
}

export class EducationalBackgroundDto {
  @IsString()
  @IsOptional()
  previousSchool?: string;

  @IsString()
  @IsOptional()
  previousClass?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  previousPercentage?: number;

  @IsString()
  @IsOptional()
  tcNumber?: string;

  @IsDateString()
  @IsOptional()
  tcDate?: string;
}

export class HealthInfoDto {
  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;
}

export class DocumentDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'photo', 'birth_certificate', 'tc', 'aadhar', etc.

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  mimeType: string;
}

export class CreateStudentDto {
  // Account Information
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // Personal Information
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  nationality?: string = 'Ethiopian';

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  category?: string;

  // Contact Information
  @IsString()
  @IsOptional()
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

  // Admission Information
  @IsString()
  @IsNotEmpty()
  admissionNumber: string;

  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsString()
  @IsOptional()
  rollNumber?: string;

  // Guardian Information
  @ValidateNested()
  @Type(() => GuardianInfoDto)
  @IsNotEmpty()
  guardian: GuardianInfoDto;

  // Educational Background
  @ValidateNested()
  @Type(() => EducationalBackgroundDto)
  @IsOptional()
  educationalBackground?: EducationalBackgroundDto;

  // Health Information
  @ValidateNested()
  @Type(() => HealthInfoDto)
  @IsOptional()
  healthInfo?: HealthInfoDto;

  // Documents
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  @IsOptional()
  documents?: DocumentDto[];

  // Status
  @IsString()
  @IsOptional()
  status?: string = 'Active';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}