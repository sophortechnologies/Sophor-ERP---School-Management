import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterStaffDto {
  // ─────────────── User fields ───────────────

  @ApiProperty({ example: 'staff_jane01' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'jane.doe@school.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword@123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'Jane' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsOptional()
  @IsString()
  phone?: string;

  // ─────────────── Staff fields ───────────────

  @ApiProperty({ example: 'Accountant' })
  @IsString()
  designation: string;

  @ApiPropertyOptional({ enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'], example: 'FULL_TIME' })
  @IsOptional()
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT'])
  employmentType?: string;

  @ApiPropertyOptional({ example: '2025-09-01' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  // ─────────────── Banking fields (ADD THESE) ───────────────

  @ApiPropertyOptional({ example: 'Commercial Bank of Ethiopia' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '1000134567890' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'CBEBIR1234' })
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

  @ApiPropertyOptional({ example: 'ESI123456' })
  @IsOptional()
  @IsString()
  esiNumber?: string;
}