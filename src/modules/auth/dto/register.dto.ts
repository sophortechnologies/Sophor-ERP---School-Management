import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsInt, 
  IsOptional,
  IsPhoneNumber 
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
    description: 'Account password (minimum 6 characters)',
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
    description: 'Role ID assigned to the user (e.g., Admin, Teacher, Student)',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiPropertyOptional({
    example: '+251912345678',
    description: 'Optional Ethiopian phone number (ET format)',
  })
  @IsOptional()
  @IsPhoneNumber('ET')
  phone?: string;
}
