// src/modules/staff-attendance/dto/mark-attendance.dto.ts

import {
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

// Define valid attendance statuses as a const array
const STAFF_ATTENDANCE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'HALF_DAY',
  'LEAVE',
  'HOLIDAY',
  'WEEKEND',
  'WORK_FROM_HOME',
] as const;

// Optional: Create a type alias for better autocomplete and type safety
export type StaffAttendanceStatus = typeof STAFF_ATTENDANCE_STATUSES[number];

export class MarkStaffAttendanceDto {
  @IsInt()
  userId: number;

  @IsDateString({}, { message: 'date must be a valid ISO date (e.g., 2025-12-31)' })
  date: string; // Format: YYYY-MM-DD

  @IsEnum(STAFF_ATTENDANCE_STATUSES, {
    message: `status must be one of: ${STAFF_ATTENDANCE_STATUSES.join(', ')}`,
  })
  status: StaffAttendanceStatus;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'checkIn must be in 24-hour HH:MM format (e.g., 09:15)',
  })
  checkIn?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'checkOut must be in 24-hour HH:MM format (e.g., 17:30)',
  })
  checkOut?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}