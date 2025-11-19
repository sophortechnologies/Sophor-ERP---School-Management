// // import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';
// // import { ApiProperty } from '@nestjs/swagger';

// // export class UpdateProfileDto {
// //   @ApiProperty({ 
// //     example: 'john.doe@newschool.edu', 
// //     required: false 
// //   })
// //   @IsEmail()
// //   @IsOptional()
// //   email?: string;

// //   @ApiProperty({ 
// //     example: 'John', 
// //     required: false 
// //   })
// //   @IsString()
// //   @IsOptional()
// //   firstName?: string;

// //   @ApiProperty({ 
// //     example: 'Doe', 
// //     required: false 
// //   })
// //   @IsString()
// //   @IsOptional()
// //   lastName?: string;

// //   @ApiProperty({ 
// //     example: '+1234567890', 
// //     required: false 
// //   })
// //   @IsString()
// //   @IsOptional()
// //   phone?: string;

// //   @ApiProperty({ 
// //     example: 'avatar.png', 
// //     required: false 
// //   })
// //   @IsString()
// //   @IsOptional()
// //   avatar?: string;
// // }

// import { IsString, IsEmail, IsOptional } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class UpdateProfileDto {
//   @ApiProperty({ 
//     example: 'john.doe@newschool.edu', 
//     required: false 
//   })
//   @IsEmail()
//   @IsOptional()
//   email?: string;

//   @ApiProperty({ 
//     example: 'John', 
//     required: false 
//   })
//   @IsString()
//   @IsOptional()
//   firstName?: string;

//   @ApiProperty({ 
//     example: 'Doe', 
//     required: false 
//   })
//   @IsString()
//   @IsOptional()
//   lastName?: string;

//   @ApiProperty({ 
//     example: '+1234567890', 
//     required: false 
//   })
//   @IsString()
//   @IsOptional()
//   phone?: string;

//   @ApiProperty({ 
//     example: 'avatar.png', 
//     required: false 
//   })
//   @IsString()
//   @IsOptional()
//   avatar?: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'john@school.edu', description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'avatar_url', description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}