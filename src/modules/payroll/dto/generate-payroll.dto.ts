import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePayrollDto {
  @ApiProperty({
    example: '2025-12',
    description: 'Salary month for payroll generation (format: YYYY-MM)',
  })
  @IsString()
  salaryMonth: string; // format YYYY-MM

  @ApiPropertyOptional({
    example: 45,
    description: 'Specific staff ID to generate payroll for; if omitted, payroll is generated for all eligible staff',
  })
  @IsOptional()
  @IsInt()
  staffId?: number; // if null → generate for all eligible staff
}
