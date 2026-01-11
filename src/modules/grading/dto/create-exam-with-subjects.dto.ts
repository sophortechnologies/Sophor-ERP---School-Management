import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
  IsDate,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExamSubjectDto {
  @ApiProperty({
    description: 'Subject ID for which the exam is scheduled',
    example: 5,
  })
  @IsInt()
  subjectId: number;

  @ApiProperty({
    description: 'Date of the subject exam (ISO format)',
    example: '2026-03-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  examDate: Date;

  @ApiProperty({
    description: 'Exam start time (HH:mm format)',
    example: '09:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Exam end time (HH:mm format)',
    example: '12:00',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Duration of the exam in minutes',
    example: 180,
  })
  @IsInt()
  duration: number;

  @ApiProperty({
    description: 'Maximum marks for this subject',
    example: 100,
  })
  @IsInt()
  maxMarks: number;

  @ApiProperty({
    description: 'Minimum marks required to pass this subject',
    example: 40,
  })
  @IsInt()
  minMarks: number;

  @ApiPropertyOptional({
    description: 'Indicates if the exam has a theory component',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTheory?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if the exam has a practical component',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPractical?: boolean;

  @ApiPropertyOptional({
    description: 'Marks allocated for the practical exam',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  practicalMarks?: number;

  @ApiPropertyOptional({
    description: 'Marks allocated for the theory exam',
    example: 70,
  })
  @IsOptional()
  @IsInt()
  theoryMarks?: number;

  @ApiPropertyOptional({
    description: 'Room number where the exam will take place',
    example: 'Room 204',
  })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({
    description: 'Special instructions for this subject exam',
    example: 'No calculators allowed',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateExamWithSubjectsDto {
  @ApiProperty({
    description: 'Name of the exam',
    example: 'Final Examination',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Exam type ID (e.g. Midterm, Final)',
    example: 2,
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
    description: 'Academic session ID this exam belongs to',
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
    example: 'Term 2',
  })
  @IsString()
  term: string;

  @ApiProperty({
    description: 'Overall exam start date',
    example: '2026-03-10T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Overall exam end date',
    example: '2026-03-25T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'General description of the exam',
    example: 'Final exams for all subjects',
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
    description: 'Total weightage of this exam',
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  totalWeightage?: number;

  @ApiPropertyOptional({
    description: 'Passing criteria for the exam',
    example: 'Minimum 40% overall',
  })
  @IsOptional()
  @IsString()
  passingCriteria?: string;

  @ApiPropertyOptional({
    description: 'General instructions for all subjects',
    example: 'Students must carry their ID cards',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'List of subjects included in this exam',
    type: [ExamSubjectDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubjectDto)
  subjects: ExamSubjectDto[];
}
