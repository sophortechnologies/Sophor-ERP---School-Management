import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Registered email address used to receive the password reset link or OTP',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
