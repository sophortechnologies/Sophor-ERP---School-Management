import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionSubjectDto {
  @ApiProperty({
    description: 'ID of the section to which the subject is assigned',
    example: 2,
  })
  @IsInt()
  sectionId: number;

  @ApiProperty({
    description: 'ID of the subject being assigned to the section',
    example: 5,
  })
  @IsInt()
  subjectId: number;

  @ApiProperty({
    description: 'ID of the teacher assigned to teach this subject in the section',
    example: 8,
  })
  @IsInt()
  teacherId: number;
}
