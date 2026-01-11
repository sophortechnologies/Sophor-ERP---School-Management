import { IsInt, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignParentDto {
  @ApiProperty({
    example: 10,
    description: 'ID of the parent being assigned to the student',
  })
  @IsInt()
  parentId: number;

  @ApiProperty({
    example: 25,
    description: 'ID of the student to whom the parent is being assigned',
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    example: 'father',
    enum: ['father', 'mother', 'guardian'],
    description: 'Relationship type between the parent and the student',
  })
  @IsString()
  @IsIn(['father', 'mother', 'guardian'])
  relation: string;
}
