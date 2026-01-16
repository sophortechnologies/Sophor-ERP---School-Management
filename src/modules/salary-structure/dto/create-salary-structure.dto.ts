import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsArray } from 'class-validator';
import { SalaryComponentDto } from './salary-component.dto';

export class CreateSalaryStructureDto {
  @ApiProperty({
    description: 'Unique identifier of the user or employee to whom the salary structure belongs',
    example: 12,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Base salary amount before adding allowances or deductions',
    example: 25000,
  })
  @IsNumber()
  basePay: number;

  @ApiProperty({
    description: 'Indicates whether the salary structure is currently active',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'List of salary components such as allowances, bonuses, or deductions',
    type: [SalaryComponentDto],
  })
  @IsArray()
  components: SalaryComponentDto[];
}
