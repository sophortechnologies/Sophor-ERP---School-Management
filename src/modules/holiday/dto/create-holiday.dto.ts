import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HolidayType } from '@prisma/client';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Name of the holiday',
    example: 'New Year Holiday',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Date of the holiday in ISO format (YYYY-MM-DD)',
    example: '2026-01-07',
  })
  @IsDateString()
  date: string; // ISO date from client

  @ApiPropertyOptional({
  description: 'Type of holiday (e.g. PUBLIC, SCHOOL, NATIONAL)',
  enum: HolidayType,
  example: 'PUBLIC',
})
@IsEnum(HolidayType)
@IsOptional()
type?: HolidayType;


  @ApiPropertyOptional({
    description: 'Indicates whether the holiday is a half-day',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @ApiPropertyOptional({
    description: 'Academic session ID this holiday belongs to',
    example: 1,
  })
  @IsOptional()
  academicSessionId?: number;
}
