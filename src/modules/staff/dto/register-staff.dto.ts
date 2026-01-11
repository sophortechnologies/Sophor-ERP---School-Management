import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterStaffDto {
  // ─────────────── User fields ───────────────

  @ApiProperty({
    description: 'Unique username used by the staff member to log in',
    example: 'staff_jane01',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Official email address of the staff member',
    example: 'jane.doe@school.edu',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the staff account',
    example: 'StrongPassword@123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'First name of the staff member',
    example: 'Jane',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the staff member',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+251911223344',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // ─────────────── Staff fields ───────────────

  @ApiProperty({
    description: 'Job title or designation of the staff member',
    example: 'Accountant',
  })
  @IsString()
  designation: string;

  @ApiPropertyOptional({
    description: 'Employment type of the staff member',
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
    example: 'FULL_TIME',
  })
  @IsOptional()
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT'])
  employmentType?: string;

  @ApiPropertyOptional({
    description: 'Date the staff member joined the organization (ISO format)',
    example: '2025-09-01',
  })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({
    description: 'Department ID the staff member belongs to',
    example: 3,
  })
  @IsOptional()
  departmentId?: number;
}
