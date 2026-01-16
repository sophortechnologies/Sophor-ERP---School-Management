import {
  IsDateString,
  IsInt,
  IsString,
  IsIn,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AttendanceRecordDto {
  @ApiProperty({
    description: 'Unique identifier of the student',
    example: 101,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'Attendance status of the student',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
    example: 'PRESENT',
  })
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'])
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

  @ApiPropertyOptional({
    description: 'Optional remarks about the student attendance',
    example: 'Arrived 10 minutes late',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({
    description: 'Unique identifier of the class',
    example: 5,
  })
  @IsInt()
  classId: number;

  @ApiProperty({
    description: 'Attendance date (ISO 8601 format)',
    example: '2025-02-15',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Optional subject identifier for subject-based attendance',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiProperty({
    description: 'List of attendance records for students',
    type: [AttendanceRecordDto],
    example: [
      {
        studentId: 101,
        status: 'PRESENT',
        remarks: 'On time',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  attendanceRecords: AttendanceRecordDto[];
}
