// src/modules/budget/dto/budget-commitment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class BudgetCommitmentDto {
  @ApiProperty({ example: 100 })
  @IsInt()
  budgetId: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'PURCHASE_ORDER' })
  @IsString()
  referenceType: string;

  @ApiProperty({ example: 1001 })
  @IsInt()
  referenceId: number;

  @ApiProperty({ example: 'Purchase of computers' })
  @IsString()
  description: string;
}