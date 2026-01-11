// src/modules/auth/dto/send-email.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Recipient email address',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 'Password Reset Request',
    description: 'Subject line of the email',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'reset-password',
    description: 'Email template name to be used for rendering the email',
  })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiPropertyOptional({
    example: { name: 'John', resetLink: 'https://example.com/reset' },
    description: 'Dynamic data passed to the email template',
  })
  @IsOptional()
  context?: Record<string, any>;
}
