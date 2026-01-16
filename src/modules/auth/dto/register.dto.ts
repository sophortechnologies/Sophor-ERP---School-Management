import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username for the user (minimum 3 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Valid email address for account registration',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'Plain password (will be hashed before saving)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 2,
    description: 'Role ID assigned to the user',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Optional phone number (Ethiopia)',
  })
  @IsOptional()
  @IsPhoneNumber('ET')
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/profile.jpg',
    description: 'Optional profile image URL',
  })
  @IsOptional()
  @IsUrl()
  profileImage?: string;
}
