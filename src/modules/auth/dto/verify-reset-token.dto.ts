// src/modules/auth/dto/verify-reset-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetTokenDto {
  @ApiProperty({
    example: 'e3f1c9a0-8d4a-4c2a-9b7e-123456789abc',
    description: 'Password reset token to verify its validity and expiration',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
