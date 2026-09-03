// src/modules/budget/dto/budget-transfer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class BudgetTransferDto {
  @ApiProperty({ example: 100 })
  @IsInt()
  fromBudgetId: number;

  @ApiProperty({ example: 101 })
  @IsInt()
  toBudgetId: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Need additional funds for lab equipment' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Training budget has surplus' })
  @IsOptional()
  @IsString()
  justification?: string;
}