import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    description: 'Name of the class',
    example: 'Grade 10 - Science',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Grade level of the class',
    example: '10',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Section identifier of the class',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of students allowed in this class',
    example: 40,
  })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Academic session ID this class belongs to',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  academicSessionId?: number;
}
