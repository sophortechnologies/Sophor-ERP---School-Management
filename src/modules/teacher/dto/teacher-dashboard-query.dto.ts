import { IsOptional, IsNumberString } from 'class-validator';

export class TeacherDashboardQueryDto {
  @IsOptional() @IsNumberString() classId?: string;
  @IsOptional() @IsNumberString() sessionId?: string;
}
