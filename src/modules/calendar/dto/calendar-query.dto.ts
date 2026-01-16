import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarQueryDto {
  @ApiPropertyOptional({
    example: '2026-03-01',
    description: 'Filter events from this date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    description: 'Filter events until this date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
