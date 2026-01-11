import {
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'ID of the student whose attendance is being recorded',
    example: 12,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'ID of the class in which the attendance is recorded',
    example: 3,
  })
  @IsInt()
  classId: number;

  @ApiProperty({
    description: 'Attendance date in ISO format (YYYY-MM-DD)',
    example: '2026-01-03',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Attendance status of the student',
    example: 'PRESENT',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
  })
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'])
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

  @ApiPropertyOptional({
    description: 'Subject ID if attendance is subject-specific',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    description: 'Additional remarks about the attendance',
    example: 'Arrived 10 minutes late due to traffic',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'User ID (teacher/admin) who recorded the attendance',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  recordedBy?: number;
}
