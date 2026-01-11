import { IsInt, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ComponentType {
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
}

export class CreateSalaryComponentDto {
  @ApiProperty({
    example: 5,
    description: 'Salary structure ID to which this component belongs',
  })
  @IsInt()
  structureId: number;

  @ApiProperty({
    example: 'House Rent Allowance',
    description: 'Name of the salary component (e.g., allowance or deduction)',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: ComponentType,
    example: ComponentType.ALLOWANCE,
    description: 'Type of salary component: ALLOWANCE adds to salary, DEDUCTION subtracts from salary',
  })
  @IsEnum(ComponentType)
  type: ComponentType;

  @ApiProperty({
    example: 8000.0,
    description: 'Fixed amount for this salary component',
  })
  @IsNumber()
  amount: number;
}
