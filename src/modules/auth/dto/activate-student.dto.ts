import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateStudentDto {
  @ApiProperty({
    description: 'New password to activate the student account. Must be at least 6 characters long.',
    example: 'StrongPass123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
