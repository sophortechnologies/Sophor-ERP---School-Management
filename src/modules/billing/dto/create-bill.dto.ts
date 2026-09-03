import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsArray, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a bill for a student based on one or more billing configurations.
 */
export class CreateBillDto {
  @ApiProperty({
    description: 'Unique ID of the student for whom the bill is created',
    example: 101,
    minimum: 1,
  })
  @IsInt({ message: 'studentId must be an integer' })
  @Min(1, { message: 'studentId must be a positive number' })
  @Type(() => Number)
  studentId: number;

  @ApiPropertyOptional({
    description: 'ID of a single billing configuration (use either billConfigId or billConfigIds)',
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'billConfigId must be an integer' })
  @Min(1, { message: 'billConfigId must be a positive number' })
  @Type(() => Number)
  billConfigId?: number;

  @ApiPropertyOptional({
    description: 'Array of billing configuration IDs (use either billConfigId or billConfigIds)',
    example: [5, 6, 7],
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'billConfigIds must be an array' })
  @IsInt({ each: true, message: 'Each billConfigId must be an integer' })
  @Min(1, { each: true, message: 'Each billConfigId must be a positive number' })
  billConfigIds?: number[];

  @ApiProperty({
    description: 'Payment due date in ISO 8601 format (YYYY-MM-DD)',
    example: '2026-01-31',
  })
  @IsDateString({}, { message: 'dueDate must be a valid ISO date string' })
  dueDate: string;
}