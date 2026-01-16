import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    description: 'Updated attendance status of the student',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
    example: 'ABSENT',
  })
  @IsOptional()
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'])
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

  @ApiPropertyOptional({
    description: 'Optional remarks explaining the attendance update',
    example: 'Left early due to illness',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
