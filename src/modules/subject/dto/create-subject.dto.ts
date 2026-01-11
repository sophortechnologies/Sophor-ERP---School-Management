import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubjectType {
  CORE = 'CORE',
  ELECTIVE = 'ELECTIVE',
  LAB = 'LAB',
}

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Mathematics',
    description: 'Name of the subject',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'MATH101',
    description: 'Unique subject code used for identification',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: SubjectType,
    example: SubjectType.CORE,
    description: 'Type of subject (Core, Elective, or Lab)',
  })
  @IsEnum(SubjectType)
  type: SubjectType;

  @ApiPropertyOptional({
    example: 'Basic mathematics for grade 9 students',
    description: 'Detailed description of the subject',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Identifier of the department offering this subject',
  })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates whether the subject is currently active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
