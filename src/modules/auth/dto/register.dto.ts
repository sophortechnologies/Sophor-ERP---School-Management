// import { IsString, IsEmail, IsNotEmpty, MinLength, IsInt, IsOptional, Matches } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class RegisterDto {
//   @ApiProperty({ 
//     example: 'john.doe', 
//     description: 'Unique username' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
//   username: string;

//   // @ApiProperty({ 
//   //   example: 'john.doe@school.edu', 
//   //   description: 'Valid email address' 
//   // })
//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @ApiProperty({ 
//     example: 'SecurePassword123!', 
//     description: 'Strong password (min 8 characters with uppercase, lowercase, number and special character)' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
//   })
//   password: string;

//   @ApiProperty({ 
//     example: 'John', 
//     description: 'First name' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   firstName: string;

//   @ApiProperty({ 
//     example: 'Doe', 
//     description: 'Last name' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   lastName: string;

//   @ApiProperty({ 
//     example: '+1234567890', 
//     description: 'Phone number', 
//     required: false 
//   })
//   @IsString()
//   @IsOptional()
//   phone?: string;

//   @ApiProperty({ 
//     example: 3, 
//     description: 'Role ID (2=admin, 3=teacher, 4=student, etc.)' 
//   })
//   @IsInt()
//   @IsNotEmpty()
//   roleId: number;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'john@school.edu', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    example: 3, 
    description: 'Role ID (3=teacher, 4=student, 5=parent, 6=accountant, 7=librarian)' 
  })
  @IsNumber()
  roleId: number;
}