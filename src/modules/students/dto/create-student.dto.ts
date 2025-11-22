// // // // import { IsString, IsDate, IsEmail, IsOptional, IsBoolean } from 'class-validator';
// // // // import { Type } from 'class-transformer';

// // // // export class CreateStudentDto {
// // // //   // Required fields from your schema
// // // //   @IsString()
// // // //   firstName: string;

// // // //   @IsString()
// // // //   lastName: string;

// // // //   @IsString()
// // // //   guardianName: string;

// // // //   @IsString()
// // // //   guardianRelation: string;

// // // //   @IsString()
// // // //   guardianPhone: string;

// // // //   // Additional fields
// // // //   @IsDate()
// // // //   @Type(() => Date)
// // // //   dateOfBirth: Date;

// // // //   @IsString()
// // // //   gender: string;

// // // //   @IsEmail()
// // // //   @IsOptional()
// // // //   email?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   phone?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   address?: string;

// // // //   @IsBoolean()
// // // //   @IsOptional()
// // // //   isActive?: boolean;
// // // // }

// // // // export class UpdateStudentDto {
// // // //   @IsString()
// // // //   @IsOptional()
// // // //   firstName?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   lastName?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   guardianName?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   guardianRelation?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   guardianPhone?: string;

// // // //   @IsDate()
// // // //   @Type(() => Date)
// // // //   @IsOptional()
// // // //   dateOfBirth?: Date;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   gender?: string;

// // // //   @IsEmail()
// // // //   @IsOptional()
// // // //   email?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   phone?: string;

// // // //   @IsString()
// // // //   @IsOptional()
// // // //   address?: string;

// // // //   @IsBoolean()
// // // //   @IsOptional()
// // // //   isActive?: boolean;
// // // // }


// // // import { 
// // //   IsString, 
// // //   IsEmail, 
// // //   IsDate, 
// // //   IsOptional, 
// // //   IsBoolean, 
// // //   IsEnum,
// // //   IsArray,
// // //   ValidateNested
// // // } from 'class-validator';
// // // import { Type } from 'class-transformer';
// // // import { ApiProperty } from '@nestjs/swagger';

// // // export class GuardianDto {
// // //   @ApiProperty()
// // //   @IsString()
// // //   firstName: string;

// // //   @ApiProperty()
// // //   @IsString()
// // //   lastName: string;

// // //   @ApiProperty({ enum: ['FATHER', 'MOTHER', 'GUARDIAN'] })
// // //   @IsEnum(['FATHER', 'MOTHER', 'GUARDIAN'])
// // //   relationship: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   occupation?: string;

// // //   @ApiProperty()
// // //   @IsString()
// // //   phone: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsEmail()
// // //   email?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   address?: string;

// // //   @ApiProperty({ default: false })
// // //   @IsBoolean()
// // //   isPrimary: boolean;
// // // }

// // // export class CreateStudentDto {
// // //   @ApiProperty()
// // //   @IsString()
// // //   firstName: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   middleName?: string;

// // //   @ApiProperty()
// // //   @IsString()
// // //   lastName: string;

// // //   @ApiProperty()
// // //   @Type(() => Date)
// // //   @IsDate()
// // //   dateOfBirth: Date;

// // //   @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
// // //   @IsEnum(['MALE', 'FEMALE', 'OTHER'])
// // //   gender: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   nationality?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   address?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   city?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   state?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   phone?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   classId?: string;

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   sectionId?: string;

// // //   @ApiProperty()
// // //   @Type(() => Date)
// // //   @IsDate()
// // //   admissionDate: Date;

// // //   @ApiProperty({ type: [GuardianDto] })
// // //   @IsArray()
// // //   @ValidateNested({ each: true })
// // //   @Type(() => GuardianDto)
// // //   guardians: GuardianDto[];

// // //   @ApiProperty({ required: false })
// // //   @IsOptional()
// // //   @IsString()
// // //   profilePhotoUrl?: string;
// // // }

// // import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
// // import { Type } from 'class-transformer';
// // import { ApiProperty } from '@nestjs/swagger';

// // export class CreateStudentDto {
// //   @ApiProperty()
// //   @IsString()
// //   firstName: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   middleName?: string;

// //   @ApiProperty()
// //   @IsString()
// //   lastName: string;

// //   @ApiProperty()
// //   @Type(() => Date)
// //   @IsDate()
// //   dateOfBirth: Date;

// //   @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
// //   @IsEnum(['MALE', 'FEMALE', 'OTHER'])
// //   gender: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   nationality?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   address?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   city?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   state?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   phone?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   classId?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   sectionId?: string;

// //   @ApiProperty()
// //   @Type(() => Date)
// //   @IsDate()
// //   admissionDate: Date;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   profilePhotoUrl?: string;
// // }

// import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
// import { Type } from 'class-transformer';
// import { ApiProperty } from '@nestjs/swagger';

// export class CreateStudentDto {
//   @ApiProperty()
//   @IsString()
//   firstName: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   middleName?: string;

//   @ApiProperty()
//   @IsString()
//   lastName: string;

//   @ApiProperty()
//   @Type(() => Date)
//   @IsDate()
//   dateOfBirth: Date;

//   @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
//   @IsEnum(['MALE', 'FEMALE', 'OTHER'])
//   gender: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   nationality?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   address?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   city?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   state?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   phone?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   classId?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   sectionId?: string;

//   @ApiProperty()
//   @Type(() => Date)
//   @IsDate()
//   admissionDate: Date;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   profilePhotoUrl?: string;
// }


// src/modules/students/dto/create-student.dto.ts

import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsNotEmpty, MaxLength, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new student record
 * Implements FR1.2: Entry of student personal details
 * Implements FR1.3: Record educational background and admission test details
 * Implements FR1.6: Allow attaching scanned documents
 */

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-'
}

export enum AdmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED'
}

// Guardian Information Sub-DTO
export class GuardianDto {
  @ApiProperty({ description: 'Guardian full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ description: 'Relationship to student (e.g., Father, Mother, Guardian)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  relationship: string;

  @ApiProperty({ description: 'Guardian phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'Phone number must be valid'
  })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Guardian email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Guardian occupation' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ description: 'Guardian address' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}

// Previous Education Sub-DTO
export class PreviousEducationDto {
  @ApiProperty({ description: 'Name of previous school/institution' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institutionName: string;

  @ApiProperty({ description: 'Class/Grade completed' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  classCompleted: string;

  @ApiProperty({ description: 'Year of completion' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'Year must be in YYYY format' })
  yearCompleted: string;

  @ApiPropertyOptional({ description: 'Percentage/Grade obtained' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  gradeObtained?: string;

  @ApiPropertyOptional({ description: 'Board/University name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  board?: string;
}

// Admission Test Details Sub-DTO
export class AdmissionTestDto {
  @ApiProperty({ description: 'Test date' })
  @IsDateString()
  testDate: string;

  @ApiProperty({ description: 'Marks obtained in test' })
  @IsString()
  @IsNotEmpty()
  marksObtained: string;

  @ApiProperty({ description: 'Total marks of the test' })
  @IsString()
  @IsNotEmpty()
  totalMarks: string;

  @ApiPropertyOptional({ description: 'Test result (Pass/Fail/Grade)' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ description: 'Remarks or notes from the test' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

// Document Attachment Sub-DTO
export class DocumentDto {
  @ApiProperty({ description: 'Document type (e.g., ID_PROOF, TRANSCRIPT, BIRTH_CERTIFICATE)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentType: string;

  @ApiProperty({ description: 'Document file name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fileName: string;

  @ApiProperty({ description: 'Document file path or URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filePath: string;

  @ApiPropertyOptional({ description: 'Document file size in bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Upload date' })
  @IsDateString()
  @IsOptional()
  uploadDate?: string;
}

// Main Create Student DTO
export class CreateStudentDto {
  // Personal Information (FR1.2)
  @ApiProperty({ description: 'Student first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Student middle name', example: 'Michael' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  middleName?: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '2010-05-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ description: 'Gender', enum: Gender })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ description: 'Blood group', enum: BloodGroup })
  @IsEnum(BloodGroup)
  @IsOptional()
  bloodGroup?: BloodGroup;

  @ApiProperty({ description: 'Nationality', example: 'Ethiopian' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nationality: string;

  @ApiPropertyOptional({ description: 'Religion', example: 'Christianity' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  religion?: string;

  // Contact Information
  @ApiProperty({ description: 'Student email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Student phone number' })
  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
  phoneNumber?: string;

  @ApiProperty({ description: 'Current residential address' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  currentAddress: string;

  @ApiPropertyOptional({ description: 'Permanent residential address' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  permanentAddress?: string;

  // Guardian Information (FR1.2)
  @ApiProperty({ description: 'Primary guardian details', type: GuardianDto })
  @ValidateNested()
  @Type(() => GuardianDto)
  @IsNotEmpty()
  primaryGuardian: GuardianDto;

  @ApiPropertyOptional({ description: 'Secondary guardian details', type: GuardianDto })
  @ValidateNested()
  @Type(() => GuardianDto)
  @IsOptional()
  secondaryGuardian?: GuardianDto;

  // Academic Information
  @ApiProperty({ description: 'Academic session ID for admission' })
  @IsString()
  @IsNotEmpty()
  academicSessionId: string;

  @ApiProperty({ description: 'Class/Grade applying for' })
  @IsString()
  @IsNotEmpty()
  classAppliedFor: string;

  @ApiPropertyOptional({ description: 'Section preference' })
  @IsString()
  @IsOptional()
  sectionPreference?: string;

  // Educational Background (FR1.3)
  @ApiPropertyOptional({ description: 'Previous education history', type: [PreviousEducationDto] })
  @ValidateNested({ each: true })
  @Type(() => PreviousEducationDto)
  @IsArray()
  @IsOptional()
  previousEducation?: PreviousEducationDto[];

  // Admission Test Details (FR1.3)
  @ApiPropertyOptional({ description: 'Admission test details', type: AdmissionTestDto })
  @ValidateNested()
  @Type(() => AdmissionTestDto)
  @IsOptional()
  admissionTest?: AdmissionTestDto;

  // Documents (FR1.6)
  @ApiPropertyOptional({ description: 'Attached documents', type: [DocumentDto] })
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  @IsArray()
  @IsOptional()
  documents?: DocumentDto[];

  // Identification
  @ApiPropertyOptional({ description: 'National ID or Passport number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Birth certificate number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  birthCertificateNumber?: string;

  // Additional Information
  @ApiPropertyOptional({ description: 'Medical conditions or allergies' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  medicalInfo?: string;

  @ApiPropertyOptional({ description: 'Special needs or accommodations required' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  specialNeeds?: string;

  @ApiPropertyOptional({ description: 'Emergency contact number' })
  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Additional remarks or notes' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  remarks?: string;

  // Admission Status
  @ApiPropertyOptional({ description: 'Admission status', enum: AdmissionStatus, default: AdmissionStatus.PENDING })
  @IsEnum(AdmissionStatus)
  @IsOptional()
  admissionStatus?: AdmissionStatus;

  @ApiPropertyOptional({ description: 'Date of admission application' })
  @IsDateString()
  @IsOptional()
  applicationDate?: string;
}