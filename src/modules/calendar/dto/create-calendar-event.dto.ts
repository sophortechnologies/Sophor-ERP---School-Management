import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCalendarEventDto {
  @ApiProperty({
    example: 'Midterm Examination',
    description: 'Title of the calendar event',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Grade 10 mathematics midterm exam',
    description: 'Detailed description of the event',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-03-20T09:00:00.000Z',
    description: 'Date and time when the event occurs',
  })
  @IsDateString()
  eventDate: string;

  @ApiProperty({
    example: '2026-03-19T09:00:00.000Z',
    description: 'Date and time when reminder notification should be sent',
  })
  @IsDateString()
  notifyAt: string;
}
