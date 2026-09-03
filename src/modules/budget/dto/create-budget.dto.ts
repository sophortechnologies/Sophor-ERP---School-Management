// src/modules/budget/dto/create-budget.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsInt,
  IsBoolean,
  IsEmail,
  Max
} from 'class-validator';
import { BudgetCategory, BudgetType } from '../enums/budget.enum';

export class CreateBudgetDto {
  @ApiProperty({ example: 'BUD-2025-ACADEMICS-001' })
  @IsString()
  budgetCode: string;

  @ApiProperty({ example: '2025-2026' })
  @IsString()
  fiscalYear: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ example: 'ACAD-001' })
  @IsOptional() 
  @IsString()
  costCenter?: string;

  @ApiProperty({ enum: BudgetCategory, example: 'OPERATIONAL' })
  @IsEnum(BudgetCategory)
  category: BudgetCategory;

  @ApiPropertyOptional({ example: 'TEACHING_MATERIALS' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ enum: BudgetType, example: 'ANNUAL' })
  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  softStopPercent?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  hardStopPercent?: number;

  @ApiPropertyOptional({ example: 'finance@school.com' })
  @IsOptional()
  @IsEmail()
  alertEmail?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allowRollover?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  rolloverToNextYear?: boolean;

  @ApiPropertyOptional({ example: 'Annual operating budget' })
  @IsOptional()
  @IsString()
  notes?: string;
}