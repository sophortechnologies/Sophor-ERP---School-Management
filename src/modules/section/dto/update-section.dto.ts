import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({
    description: 'Updated name or label of the section',
    example: 'B',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated maximum number of students allowed in this section',
    example: 35,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
