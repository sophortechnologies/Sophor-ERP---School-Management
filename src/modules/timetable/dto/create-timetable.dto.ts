import {
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export enum DayOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
}


export class CreateTimetableDto {
  @ApiProperty({
    example: 5,
    description: 'Unique identifier of the class section (e.g. Grade 10 - Section A)',
  })
  @IsInt()
  sectionId: number;

  @ApiProperty({
    example: 12,
    description: 'Unique identifier of the subject being taught (e.g. Mathematics, Physics)',
  })
  @IsInt()
  subjectId: number;

  @ApiProperty({
    example: 8,
    description: 'Unique identifier of the teacher assigned to this class session',
  })
  @IsInt()
  teacherId: number;

  @ApiProperty({
    example: DayOfWeek.MON,
    enum: DayOfWeek,
    description: 'Day of the week when the class takes place',
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description:
      'Class start time in ISO 8601 format (UTC). Represents when the class begins.',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2026-01-15T09:30:00.000Z',
    description:
      'Class end time in ISO 8601 format (UTC). Must be later than startTime.',
  })
  @IsDateString()
  endTime: string;
}
