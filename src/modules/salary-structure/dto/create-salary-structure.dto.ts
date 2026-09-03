// src/modules/salary-structure/dto/create-salary-structure.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SalaryComponentDto } from './salary-component.dto';

export class CreateSalaryStructureDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  basePay: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [SalaryComponentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryComponentDto)
  components: SalaryComponentDto[];
}