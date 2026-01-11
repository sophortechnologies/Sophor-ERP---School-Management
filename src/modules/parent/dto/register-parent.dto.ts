import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterParentDto {
  // User fields

  @ApiProperty({
    description: 'Unique username for the parent account',
    example: 'parent_john01',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email address of the parent',
    example: 'parent@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the parent account',
    example: 'StrongPassword@123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'First name of the parent',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the parent',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the parent',
    example: '+251912345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // Parent fields

  @ApiPropertyOptional({
    description: 'Indicates whether the parent account is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
