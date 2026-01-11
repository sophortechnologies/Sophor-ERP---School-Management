import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyExamResultDto {
  @ApiProperty({
    description: 'ID of the exam whose results are being verified',
    example: 4,
  })
  @IsInt()
  examId: number;

  @ApiProperty({
    description: 'ID of the student whose exam result is being verified',
    example: 15,
  })
  @IsInt()
  studentId: number;
}
