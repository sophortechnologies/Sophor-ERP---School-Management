import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType, HalfDayOption } from '@prisma/client';

export class CreateStaffLeaveDto {
  @ApiPropertyOptional({
    description:
      'User ID of the staff member. Required only when an admin applies leave on behalf of a staff member.',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: 'Type of leave requested',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({
    description: 'Leave start date (ISO format: YYYY-MM-DD)',
    example: '2026-01-10',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Leave end date (ISO format: YYYY-MM-DD)',
    example: '2026-01-12',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description:
      'Specify if the leave is a half-day (applicable only for certain leave types)',
    enum: HalfDayOption,
    example: HalfDayOption.FIRST_HALF,
  })
  @IsOptional()
  @IsEnum(HalfDayOption)
  halfDay?: HalfDayOption;

  @ApiProperty({
    description: 'Reason for the leave request',
    example: 'Medical appointment',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
