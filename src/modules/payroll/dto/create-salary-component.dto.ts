import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateSalaryComponentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;  // EARNING or DEDUCTION

  @ApiPropertyOptional({ default: 'FIXED' })
  @IsOptional()
  @IsString()
  calculationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;  // For backward compatibility

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dependsOn?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @ApiProperty()
  @IsNumber()
  structureId: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}