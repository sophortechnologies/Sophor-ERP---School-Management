import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({
    description: 'ID of the student receiving the grade',
    example: 15,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'ID of the exam for which the grade is recorded',
    example: 4,
  })
  @IsInt()
  examId: number;

  @ApiProperty({
    description: 'ID of the subject related to this grade',
    example: 7,
  })
  @IsInt()
  subjectId: number;

  @ApiProperty({
    description: 'Marks obtained by the student in the subject',
    example: 78,
  })
  @IsNumber()
  marksObtained: number;

  @ApiProperty({
    description: 'Maximum marks possible for the subject',
    example: 100,
  })
  @IsNumber()
  maxMarks: number;

  @ApiPropertyOptional({
    description: 'Calculated grade based on grading scale (optional)',
    example: 'B+',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Additional remarks or feedback',
    example: 'Good improvement compared to last exam',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
