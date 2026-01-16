import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { CreateTimetableDto, DayOfWeek } from './create-timetable.dto';

/**
 * DTO for updating an existing timetable slot.
 * All fields are optional, allowing partial updates.
 * Only the provided fields will be modified.
 */
export class UpdateTimetableDto extends PartialType(CreateTimetableDto) {
  @ApiPropertyOptional({
    example: 5,
    description:
      'Updated section ID. Use this if the class is moved to another section.',
  })
  @IsOptional()
  @IsInt()
  sectionId?: number;

  @ApiPropertyOptional({
    example: 12,
    description:
      'Updated subject ID. Use this if the subject assigned to this slot changes.',
  })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    example: 8,
    description:
      'Updated teacher ID. Use this if a different teacher is assigned.',
  })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @ApiPropertyOptional({
    example: DayOfWeek.TUE,
    enum: DayOfWeek,
    description:
      'Updated day of the week on which the class is scheduled.',
  })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({
    example: '2026-01-15T10:00:00.000Z',
    description:
      'Updated class start time in ISO 8601 format (UTC). Must be earlier than endTime.',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    example: '2026-01-15T11:00:00.000Z',
    description:
      'Updated class end time in ISO 8601 format (UTC). Must be later than startTime.',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
