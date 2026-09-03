// src/modules/asset/dto/create-maintenance.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { MaintenanceType } from '../enums/asset.enum';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: 'PREVENTIVE' })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ example: 'Routine servicing and cleaning' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ example: 'Tech Solutions' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  technicianName?: string;

  @ApiPropertyOptional({ example: '2025-06-15' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiPropertyOptional({ example: 'INV-M-2025-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: 'Replaced cooling fan' })
  @IsOptional()
  @IsString()
  remarks?: string;
}