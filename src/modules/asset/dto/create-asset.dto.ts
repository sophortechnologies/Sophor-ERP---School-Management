// src/modules/asset/dto/create-asset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsDecimal,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory, DepreciationMethod, AssetStatus } from '../enums/asset.enum';

export class CreateAssetDto {
  @ApiProperty({ example: 'Dell XPS 15' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'XPS-15-9520' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'Dell' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: 'CN-12345-67890' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ enum: AssetCategory, example: 'IT' })
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @ApiPropertyOptional({ example: 'LAPTOP' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  @Min(0)
  purchaseCost: number;

  @ApiPropertyOptional({ example: 'Stationery Mart' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ example: 'INV-2024-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: '2026-01-14' })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiProperty({ enum: DepreciationMethod, example: 'STRAIGHT_LINE' })
  @IsEnum(DepreciationMethod)
  depreciationMethod: DepreciationMethod;

  @ApiProperty({ example: 5, description: 'Useful life in years' })
  @IsNumber()
  @Min(1)
  @Max(50)
  usefulLifeYears: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValue?: number;

  @ApiPropertyOptional({ example: 'Computer Lab 1, Rack 3' })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenanceInterval?: number;

  @ApiPropertyOptional({ example: 'New computer lab equipment' })
  @IsOptional()
  @IsString()
  notes?: string;
}