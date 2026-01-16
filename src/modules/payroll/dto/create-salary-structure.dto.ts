import { IsBoolean, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryStructureDto {
  @ApiProperty({
    example: 1,
    description: 'User ID of the staff member for whom the salary structure is created',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 45000,
    description: 'Base monthly salary amount before allowances and deductions',
  })
  @IsNumber()
  basePay: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indicates whether this salary structure is active. Defaults to true if not provided.',
  })
  @IsBoolean()
  isActive?: boolean;
}
