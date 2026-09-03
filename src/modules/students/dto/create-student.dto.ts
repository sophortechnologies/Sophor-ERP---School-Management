import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsNumber, 
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
  IsBoolean,
  IsNumberString,
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class 
CreateStudentDto {
  // Personal Information - FR1.2
  @ApiProperty({ example: 'John', description: 'Student first name' })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Student last name' })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiProperty({ example: '2010-05-15', description: 'Date of birth (must be in past)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  // Unique Identification
  @ApiPropertyOptional({ example: '1234-5678-9012', description: 'Aadhar number or equivalent ID' })
  @IsOptional()
  @IsString()
  identificationNumber?: string;

  // Address Information
  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode?: string;

  @ApiPropertyOptional({ example: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  // Guardian Information 
  @ApiProperty({ example: 'Robert Doe', description: 'Guardian full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  guardianName: string;

  @ApiProperty({ example: '+919876543210', description: 'Guardian phone number' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid guardian phone number format' })
  guardianPhone: string;

  @ApiPropertyOptional({ example: 'robert.doe@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid guardian email format' })
  guardianEmail?: string;

  @ApiProperty({ example: 'FATHER', enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'] })
  @IsEnum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'])
  guardianRelation: string;

  @ApiPropertyOptional({ example: 'Business' })
  @IsOptional()
  @IsString()
  guardianOccupation?: string;

  @ApiPropertyOptional({ example: '123 Guardian Street' })
  @IsOptional()
  @IsString()
  guardianAddress?: string;

  // Educational Background 
  @ApiPropertyOptional({ example: 'ABC High School', description: 'Previous school name' })
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiPropertyOptional({ example: '9th Grade', description: 'Last completed grade/class' })
  @IsOptional()
  @IsString()
  lastGradeCompleted?: string;

  @ApiPropertyOptional({ example: '2023-2024', description: 'Previous academic year' })
  @IsOptional()
  @IsString()
  previousAcademicYear?: string;

  @ApiPropertyOptional({ example: '85.5', description: 'Percentage/CGPA in last grade' })
  @IsOptional()
  @IsString()
  lastGradeMarks?: string;

  // Admission Test Details - FR1.3
  @ApiPropertyOptional({ example: '2024-06-15', description: 'Admission test date' })
  @IsOptional()
  @IsDateString()
  admissionTestDate?: string;

  @ApiPropertyOptional({ example: 85, description: 'Admission test score' })
  @IsOptional()
  @IsNumber()
  admissionTestScore?: number;

  @ApiPropertyOptional({ example: 'PASS', enum: ['PASS', 'FAIL', 'PENDING'], description: 'Admission test result' })
  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'PENDING'])
  admissionTestResult?: string;

  @ApiPropertyOptional({ example: 'Good performance in mathematics', description: 'Remarks from admission test' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  admissionRemarks?: string;

  // Academic Information - FR1.1, FR1.7
  @ApiProperty({ example: 1, description: 'Academic session ID' })
  @IsNumber()
  sessionId: number;

  @ApiPropertyOptional({ example: 5, description: 'Class ID for assignment' })
  @IsOptional()
  @IsNumber()
  classId?: number;

  @ApiPropertyOptional({ example: 'A', description: 'Section assignment' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  section?: string;

  // Admission Category
  @ApiPropertyOptional({ 
    example: 'GENERAL', 
    enum: ['GENERAL', 'MANAGEMENT', 'NRI', 'SPORTS', 'OTHER'],
    description: 'Admission category/quota'
  })
  @IsOptional()
  @IsEnum(['GENERAL', 'MANAGEMENT', 'NRI', 'SPORTS', 'OTHER'])
  admissionCategory?: string;

  // Terms Acceptance - FR1.5
  @ApiProperty({ example: true, description: 'Must accept terms and conditions' })
  @IsBoolean()
  termsAccepted: boolean;
}
