import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimetableDto {
  @ApiProperty({
    example: 5,
    description: 'ID of the class section for which the timetable is being created',
  })
  @IsInt()
  sectionId: number;

  @ApiProperty({
    example: 12,
    description: 'ID of the subject scheduled for this time slot',
  })
  @IsInt()
  subjectId: number;

  @ApiProperty({
    example: 8,
    description: 'ID of the teacher assigned to teach this subject',
  })
  @IsInt()
  teacherId: number;

  @ApiProperty({
    example: 1,
    description: 'Day of the week (1 = Monday, 2 = Tuesday, …, 7 = Sunday)',
  })
  @IsInt()
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday

  @ApiProperty({
    example: '08:30',
    description: 'Class start time in HH:mm format (24-hour clock)',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '09:30',
    description: 'Class end time in HH:mm format (24-hour clock)',
  })
  @IsString()
  endTime: string;
}
