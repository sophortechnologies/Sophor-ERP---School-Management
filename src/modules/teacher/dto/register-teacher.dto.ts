import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsEnum,
  IsDateString,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterTeacherDto {
  /* =========================
     USER TABLE FIELDS
     ========================= */

  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username for teacher login',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Valid email address used for authentication and communication',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'Account password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Teacher first name',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Teacher last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Teacher phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  /* =========================
     TEACHER TABLE FIELDS
     ========================= */

  @ApiPropertyOptional({
    example: '1995-06-12',
    description: 'Teacher date of birth (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    enum: ['male', 'female', 'other'],
    description: 'Teacher gender',
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    example: 'Addis Ababa',
    description: 'Current residential address of the teacher',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'bachelor',
    enum: ['diploma', 'bachelor', 'master', 'phd'],
    description: 'Highest educational qualification',
  })
  @IsOptional()
  @IsEnum(['diploma', 'bachelor', 'master', 'phd'])
  qualification?: 'diploma' | 'bachelor' | 'master' | 'phd';

  @ApiPropertyOptional({
    example: 'mathematics',
    description: 'Area of academic specialization',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    example: 'full_time',
    enum: ['full_time', 'part_time', 'contract'],
    description: 'Employment type of the teacher',
  })
  @IsOptional()
  @IsEnum(['full_time', 'part_time', 'contract'])
  employmentType?: 'full_time' | 'part_time' | 'contract';

  @ApiPropertyOptional({
    example: '2024-09-01',
    description: 'Date the teacher joined the institution',
  })
  @IsOptional()
  @IsDateString()
  dateOfJoining?: string;

  @ApiPropertyOptional({
    example: 12000,
    description: 'Monthly salary of the teacher',
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
    description: 'Current employment status',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({
    example: 'Brother',
    description: 'Emergency contact person name or relationship',
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: '+251911111111',
    description: 'Emergency contact phone number',
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Associated department ID',
  })
  @IsOptional()
  @IsInt()
  departmentId?: number;


   @ApiPropertyOptional({ example: 'HDFC Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional({ example: '123456789012345' })
  @IsOptional()
  @IsString()
  uanNumber?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsString()
  esiNumber?: string;
}
