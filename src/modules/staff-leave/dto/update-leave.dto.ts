import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffLeaveDto } from './create-leave.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '@prisma/client';

export class UpdateStaffLeaveDto extends PartialType(CreateStaffLeaveDto) {
  @ApiPropertyOptional({
    description: 'Current status of the leave request',
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({
    description: 'Admin or reviewer notes regarding the leave request',
    example: 'Approved after document verification',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
