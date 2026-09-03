import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsDecimal,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { AssetCategory, AssetStatus, DepreciationMethod } from '../enums/asset.enum';

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'Dell XPS 15' })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional({ enum: AssetCategory, example: 'IT' })
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @ApiPropertyOptional({ example: 'LAPTOP' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ enum: AssetStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 75000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseCost?: number;

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

  @ApiPropertyOptional({ example: 'Extended warranty included' })
  @IsOptional()
  @IsString()
  warrantyDetails?: string;

  @ApiPropertyOptional({ enum: DepreciationMethod, example: 'STRAIGHT_LINE' })
  @IsOptional()
  @IsEnum(DepreciationMethod)
  depreciationMethod?: DepreciationMethod;

  @ApiPropertyOptional({ example: 5, description: 'Useful life in years' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  usefulLifeYears?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValue?: number;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @ApiPropertyOptional({ example: 'Computer Lab 1, Rack 3' })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({ example: 'Room 201' })
  @IsOptional()
  @IsString()
  rackNumber?: string;

  @ApiPropertyOptional({ example: 'ICICI Lombard' })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiPropertyOptional({ example: 'POL-123456' })
  @IsOptional()
  @IsString()
  insurancePolicyNo?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceAmount?: number;

  @ApiPropertyOptional({ example: 90, description: 'Maintenance interval in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maintenanceInterval?: number;

  @ApiPropertyOptional({ example: 'Updated asset information' })
  @IsOptional()
  @IsString()
  notes?: string;
}