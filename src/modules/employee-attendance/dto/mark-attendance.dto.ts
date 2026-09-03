import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsEnum, IsString, IsOptional, Min, Max } from 'class-validator';
import { AttendanceStatus } from '../enums/attendance-status.enum';

export class MarkAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  employeeId: number;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus, example: 'PRESENT' })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: '2026-04-30T09:00:00Z' })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-04-30T17:00:00Z' })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @Min(0)
  @Max(480)
  lateMinutes?: number;

  @ApiPropertyOptional({ example: 'Arrived late due to traffic' })
  @IsOptional()
  @IsString()
  remarks?: string;
}