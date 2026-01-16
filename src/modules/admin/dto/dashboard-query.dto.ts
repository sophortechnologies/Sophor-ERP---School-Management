import { IsOptional, IsNumberString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional() @IsNumberString() sessionId?: string;
  @IsOptional() @IsNumberString() month?: string; 
  @IsOptional() @IsNumberString() year?: string;
}
