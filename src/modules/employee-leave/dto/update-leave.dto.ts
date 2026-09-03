import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { LeaveStatus } from '../enums/leave-status.enum';

export class UpdateLeaveDto {
  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({ example: 'Approved by manager' })
  @IsOptional()
  @IsString()
  notes?: string;
}