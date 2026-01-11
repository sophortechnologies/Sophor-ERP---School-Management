import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignClassDto {
  @ApiProperty({
    description: 'Unique identifier of the class to which the entity is being assigned',
    example: 3,
  })
  @IsInt()
  classId: number;

  @ApiPropertyOptional({
    description: 'Section within the class (e.g., A, B, Science, Arts)',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({
    description: 'Additional remarks or notes related to the class assignment',
    example: 'Assigned due to schedule adjustment',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
