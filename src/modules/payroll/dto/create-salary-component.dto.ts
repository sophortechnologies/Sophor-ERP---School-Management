import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SalaryComponentType {
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
}

export class CreateSalaryComponentDto {
  @ApiProperty({
    example: 1,
    description: 'Salary structure ID this component belongs to',
  })
  @IsInt()
  structureId: number;

  @ApiProperty({
    example: 'Housing Allowance',
    description: 'Name of the salary component',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: SalaryComponentType.ALLOWANCE,
    enum: SalaryComponentType,
    description: 'Component type: ALLOWANCE increases salary, DEDUCTION reduces salary',
  })
  @IsEnum(SalaryComponentType)
  type: SalaryComponentType;

  @ApiProperty({
    example: 5000,
    description: 'Amount for this salary component',
  })
  @IsNumber()
  amount: number;
}
