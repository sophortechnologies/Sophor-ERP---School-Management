import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishReportCardDto {
  @ApiProperty({
    description: 'ID of the exam for which report cards will be published',
    example: 4,
  })
  @IsInt()
  examId: number;
}
