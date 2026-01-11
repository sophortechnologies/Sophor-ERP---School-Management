import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword@123',
    description: 'Current password of the user (used for verification)',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewStrongPassword@123',
    description: 'New password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
