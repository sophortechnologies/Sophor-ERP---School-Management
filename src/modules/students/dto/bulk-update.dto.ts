import { IsArray, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateDto {
  @ApiProperty({
    type: [String],
    description: 'Array of student IDs to update',
  })
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'],
    description: 'New status for the students',
  })
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'])
  status: string;
}