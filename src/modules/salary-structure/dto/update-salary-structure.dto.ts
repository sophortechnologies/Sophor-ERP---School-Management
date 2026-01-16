import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, ValidateNested, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SalaryComponentDto } from './salary-component.dto';

export class UpdateSalaryStructureDto {
  @ApiPropertyOptional({
    description: 'Updated base salary amount (before allowances or deductions)',
    example: 30000,
  })
  @IsOptional()
  @IsNumber()
  basePay?: number;

  @ApiPropertyOptional({
    description: 'Updated list of salary components such as allowances, bonuses, or deductions',
    type: [SalaryComponentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryComponentDto)
  components?: SalaryComponentDto[];

  @ApiPropertyOptional({
    description: 'Indicates whether the salary structure is active or inactive',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
