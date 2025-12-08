import { IsOptional, IsNumberString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional() @IsNumberString() sessionId?: string;
  @IsOptional() @IsNumberString() month?: string; // month number
  @IsOptional() @IsNumberString() year?: string;
}
