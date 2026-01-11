import { IsInt, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryStructureDto {
  @ApiProperty({
    example: 42,
    description: 'User ID (teacher or staff) for whom the salary structure is being created',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 45000.0,
    description: 'Base monthly salary amount before allowances and deductions',
  })
  @IsNumber()
  basePay: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates whether this salary structure is currently active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
