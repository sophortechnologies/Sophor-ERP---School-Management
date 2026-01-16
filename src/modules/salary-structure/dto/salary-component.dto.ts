import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class SalaryComponentDto {
  @ApiProperty({
    description: 'Name of the salary component, such as an allowance, bonus, or deduction',
    example: 'Housing Allowance',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of salary component (e.g., ALLOWANCE, DEDUCTION, BONUS)',
    example: 'ALLOWANCE',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Monetary value of the salary component',
    example: 5000,
  })
  @IsNumber()
  amount: number;
}
