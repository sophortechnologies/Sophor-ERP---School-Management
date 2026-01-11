import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Name or label of the section',
    example: 'A',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID of the class this section belongs to',
    example: 3,
  })
  @IsInt()
  classId: number;

  @ApiPropertyOptional({
    description: 'Maximum number of students allowed in this section',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
