import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    required: false,
    example: 'User logged out manually',
    description: 'Optional reason for logout (for auditing or analytics purposes)',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
