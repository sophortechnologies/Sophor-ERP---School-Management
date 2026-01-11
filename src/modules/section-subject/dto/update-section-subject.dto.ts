import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionSubjectDto {
  @ApiPropertyOptional({
    description: 'Updated teacher ID assigned to this section–subject mapping',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  teacherId?: number;
}
