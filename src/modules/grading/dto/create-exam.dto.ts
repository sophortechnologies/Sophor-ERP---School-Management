import {
  IsString,
  IsInt,
  IsDate,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({
    description: 'Name of the exam',
    example: 'Midterm Examination',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Exam type ID (e.g. Midterm, Final, Quiz)',
    example: 1,
  })
  @IsInt()
  examTypeId: number;

  @ApiProperty({
    description: 'Class ID for which the exam is conducted',
    example: 3,
  })
  @IsInt()
  classId: number;

  @ApiProperty({
    description: 'Academic session ID the exam belongs to',
    example: 1,
  })
  @IsInt()
  academicSessionId: number;

  @ApiProperty({
    description: 'Academic year of the exam',
    example: '2025-2026',
  })
  @IsString()
  academicYear: string;

  @ApiProperty({
    description: 'Academic term or semester',
    example: 'Term 1',
  })
  @IsString()
  term: string;

  @ApiProperty({
    description: 'Exam start date (ISO format)',
    example: '2026-02-10T08:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Exam end date (ISO format)',
    example: '2026-02-20T17:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Additional description or notes about the exam',
    example: 'Covers chapters 1 to 5',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the exam is published and visible to students',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Total weightage or percentage of this exam',
    example: 40,
  })
  @IsOptional()
  @IsNumber()
  totalWeightage?: number;

  @ApiPropertyOptional({
    description: 'Passing criteria or minimum score required',
    example: 'Minimum 40% to pass',
  })
  @IsOptional()
  @IsString()
  passingCriteria?: string;

  @ApiPropertyOptional({
    description: 'Special instructions for students',
    example: 'Bring your ID card and arrive 15 minutes early',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
