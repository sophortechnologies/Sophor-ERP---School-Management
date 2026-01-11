import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectQueryDto {
  @ApiPropertyOptional({
    example: 'Math',
    description: 'Search keyword to filter subjects by name or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (default is 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records per page (default is 10)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
