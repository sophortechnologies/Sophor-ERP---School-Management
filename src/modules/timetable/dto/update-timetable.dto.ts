// dto/update-timetable.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTimetableDto } from './create-timetable.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateTimetableDto extends PartialType(CreateTimetableDto) {
  @ApiPropertyOptional({
    example: 5,
    description: 'Updated section ID for this timetable entry',
  })
  @IsOptional()
  @IsInt()
  sectionId?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Updated subject ID for this timetable slot',
  })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Updated teacher ID assigned to this timetable entry',
  })
  @IsOptional()
  @IsInt()
  teacherId?: number;
}
