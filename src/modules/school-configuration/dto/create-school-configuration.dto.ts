import { IsString, IsEmail, IsOptional, IsDateString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchoolConfigurationDto {
  @ApiProperty({ example: 'Springfield High School' })
  @IsString()
  @MaxLength(255)
  schoolName: string;

  @ApiPropertyOptional({ example: '123 Main Street, Springfield' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'info@springfield.edu' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://springfield.edu' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: '2024-2025' })
  @IsString()
  @MaxLength(50)
  academicYear: string;

  @ApiProperty({ example: '2024-09-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-06-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ example: 'Excellence in Education' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  motto?: string;

  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  principalName?: string;
}