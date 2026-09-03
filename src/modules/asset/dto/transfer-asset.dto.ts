// src/modules/asset/dto/transfer-asset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class TransferAssetDto {
  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  toUserId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  toDepartmentId?: number;

  @ApiPropertyOptional({ example: 'Admin Building, Room 101' })
  @IsOptional()
  @IsString()
  toLocation?: string;

  @ApiProperty({ example: 'Department transfer' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'GOOD' })
  @IsOptional()
  @IsString()
  condition?: string;
}