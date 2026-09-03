import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsInt,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { BudgetCategory, BudgetType, BudgetStatus } from '../enums/budget.enum';

export class UpdateBudgetDto {
  @ApiPropertyOptional({ example: 'BUD-2025-ACADEMICS-001' })
  @IsOptional()
  @IsString()
  budgetCode?: string;

  @ApiPropertyOptional({ example: '2025-2026' })
  @IsOptional()
  @IsString()
  fiscalYear?: string;

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

  @ApiPropertyOptional({ enum: BudgetCategory, example: 'OPERATIONAL' })
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @ApiPropertyOptional({ example: 'TEACHING_MATERIALS' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ enum: BudgetType, example: 'ANNUAL' })
  @IsOptional()
  @IsEnum(BudgetType)
  budgetType?: BudgetType;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedAmount?: number;

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

  @ApiPropertyOptional({ enum: BudgetStatus, example: 'APPROVED' })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @ApiPropertyOptional({ example: 'Updated budget notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}