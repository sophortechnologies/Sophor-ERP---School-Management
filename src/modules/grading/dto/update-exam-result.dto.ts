import { IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExamResultDto {
  @ApiPropertyOptional({
    description: 'Marks obtained in the theory component',
    example: 65,
  })
  @IsOptional()
  @IsNumber()
  theoryMarks?: number;

  @ApiPropertyOptional({
    description: 'Marks obtained in the practical component',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  practicalMarks?: number;

  @ApiPropertyOptional({
    description: 'Indicates whether the student was absent for this exam',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @ApiPropertyOptional({
    description: 'Remarks or comments about the exam result',
    example: 'Absent due to medical reasons',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the exam result has been verified by an authorized user',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
