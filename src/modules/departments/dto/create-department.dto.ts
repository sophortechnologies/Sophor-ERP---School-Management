import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Official name of the department',
    example: 'Computer Science',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Short unique code for the department',
    example: 'CS101',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the department',
    example: 'Department of Computer Science and Engineering',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'User ID of the department head (e.g. teacher or staff)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  headId?: number;

  @ApiPropertyOptional({
    description: 'Indicates whether the department is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
