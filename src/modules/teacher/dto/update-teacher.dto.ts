import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Gender,
  Qualification,
  EmploymentType,
  TeacherStatus,
} from '@prisma/client';

export class UpdateTeacherDto {
  /* =========================
     USER TABLE (OPTIONAL)
     ========================= */

  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Updated username for teacher login',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Updated email address of the teacher',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPassword@123',
    description: 'New account password (minimum 8 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Updated first name',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Updated last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Updated phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates whether the user account is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /* =========================
     TEACHER TABLE (OPTIONAL)
     ========================= */

  @ApiPropertyOptional({
    example: '1995-06-12',
    description: 'Updated date of birth (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: Gender,
    description: 'Updated gender of the teacher',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'Addis Ababa',
    description: 'Updated residential address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    enum: Qualification,
    description: 'Updated highest educational qualification',
  })
  @IsOptional()
  @IsEnum(Qualification)
  qualification?: Qualification;

  @ApiPropertyOptional({
    example: 'Mathematics',
    description: 'Updated subject specialization',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    enum: EmploymentType,
    description: 'Updated employment type (full-time, part-time, or contract)',
  })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    example: '2024-09-01',
    description: 'Updated joining date of the teacher',
  })
  @IsOptional()
  @IsDateString()
  dateOfJoining?: string;

  @ApiPropertyOptional({
    example: 12000,
    description: 'Updated monthly salary amount',
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiPropertyOptional({
    enum: TeacherStatus,
    description: 'Updated employment status of the teacher',
  })
  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;

  @ApiPropertyOptional({
    example: 'Brother',
    description: 'Updated emergency contact person or relationship',
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: '+251911111111',
    description: 'Updated emergency contact phone number',
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Updated department ID the teacher belongs to',
  })
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
