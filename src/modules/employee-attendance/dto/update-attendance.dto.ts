import { PartialType } from '@nestjs/swagger';
import { MarkAttendanceDto } from './mark-attendance.dto';

export class UpdateAttendanceDto extends PartialType(MarkAttendanceDto) {}