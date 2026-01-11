import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicSessionDto {
  @ApiProperty({
    example: '2024-2025',
    description: 'Unique academic session name (e.g., academic year range)',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2024-04-01',
    description: 'Academic session start date (YYYY-MM-DD)',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2025-03-31',
    description: 'Academic session end date (YYYY-MM-DD)',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Indicates whether this academic session is currently active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
