// src/modules/asset/dto/dispose-asset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { DisposalType } from '../enums/asset.enum';

export class DisposeAssetDto {
  @ApiProperty({ enum: DisposalType, example: 'SOLD' })
  @IsEnum(DisposalType)
  disposalType: DisposalType;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saleAmount?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  disposalCost?: number;

  @ApiPropertyOptional({ example: 'ABC Corp' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ example: 'Asset obsolete, replaced with new model' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Disposal certificate attached' })
  @IsOptional()
  @IsString()
  notes?: string;
}