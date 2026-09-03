import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class RecordActualDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  budgetId: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'PAYMENT' })
  @IsString()
  referenceType: string;

  @ApiProperty({ example: 2001 })
  @IsInt()
  referenceId: number;

  @ApiProperty({ example: 'Computer payment' })
  @IsString()
  description: string;
}