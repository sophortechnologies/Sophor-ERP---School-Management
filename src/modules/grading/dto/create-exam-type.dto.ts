import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateExamTypeDto {
  @ApiProperty({
    example: 'Midterm',
    description: 'Unique name of the exam type',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Mid-semester examination',
    description: 'Optional description of the exam type',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 30.0,
    description: 'Weightage percentage of this exam type',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weightage: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order for exam types',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the exam type is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
