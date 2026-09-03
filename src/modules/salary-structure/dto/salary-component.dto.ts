// src/modules/salary-structure/dto/salary-component.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class SalaryComponentDto {
  @ApiProperty({ example: 'HRA' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['EARNING', 'DEDUCTION'], example: 'EARNING' })
  @IsString()
  type: string;

  @ApiProperty({ enum: ['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS'], example: 'PERCENTAGE_OF_BASIC' })
  @IsString()
  calculationType: string;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 'BASIC' })
  @IsOptional()
  @IsString()
  dependsOn?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;
}