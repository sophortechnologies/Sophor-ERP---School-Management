import { PartialType } from '@nestjs/mapped-types';
import { MarkStaffAttendanceDto } from './mark-attendance.dto';

export class UpdateStaffAttendanceDto extends PartialType(MarkStaffAttendanceDto) {}