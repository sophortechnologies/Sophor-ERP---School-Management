import {
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
  IsInt,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
  })
  @IsOptional()
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT'])
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;
}
