// src/modules/budget/dto/budget-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { BudgetCategory, BudgetStatus } from '../enums/budget.enum';
import { PaginationDto } from '../../../common/pagination/pagination.dto';

export class BudgetQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '2025-2026' })
  @IsOptional()
  @IsString()
  fiscalYear?: string;

  @ApiPropertyOptional({ enum: BudgetCategory })
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @ApiPropertyOptional({ enum: BudgetStatus })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  showOnlyActive?: boolean;
}