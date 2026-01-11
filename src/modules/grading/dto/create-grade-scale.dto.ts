import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeScaleDto {
  @ApiProperty({
    description: 'Letter grade or grade label',
    example: 'A',
  })
  @IsString()
  grade: string;

  @ApiProperty({
    description: 'Minimum percentage required for this grade',
    example: 85,
  })
  @IsNumber()
  minPercent: number;

  @ApiProperty({
    description: 'Maximum percentage allowed for this grade',
    example: 100,
  })
  @IsNumber()
  maxPercent: number;

  @ApiProperty({
    description: 'Grade point value associated with this grade',
    example: 4.0,
  })
  @IsNumber()
  gradePoint: number;

  @ApiPropertyOptional({
    description: 'Optional description or remarks for the grade',
    example: 'Excellent performance',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Indicates whether this grade scale is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
