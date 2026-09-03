import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsEnum, IsString, IsOptional, Min, Max } from 'class-validator';
import { LeaveType } from '../enums/leave-type.enum';

export class ApplyLeaveDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  employeeId: number;

  @ApiProperty({ enum: LeaveType, example: 'ANNUAL' })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'FIRST_HALF' })
  @IsOptional()
  @IsString()
  halfDay?: string;

  @ApiPropertyOptional({ example: 'Family vacation' })
  @IsOptional()
  @IsString()
  reason?: string;
}