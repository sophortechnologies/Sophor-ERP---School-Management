// src/modules/asset/dto/assign-asset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class AssignAssetDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ example: 'Room 201, Science Lab' })
  @IsOptional()
  @IsString()
  location?: string;
}