import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Existing user ID with STAFF role',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Job title or role (e.g. Accountant, HR Officer)',
  })
  @IsString()
  designation: string;

  @ApiPropertyOptional({
    description: 'Employment type',
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
  })
  @IsOptional()
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT'])
  employmentType?: string;

  @ApiPropertyOptional({
    description: 'Joining date (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
  })
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
