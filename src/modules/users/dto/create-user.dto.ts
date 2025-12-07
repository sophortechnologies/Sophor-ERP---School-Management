// import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

// export class CreateUserDto {
//   @IsString()
//   @IsNotEmpty()
//   firstName: string;

//   @IsString()
//   @IsNotEmpty()
//   lastName: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   phone: string;

//   @IsString()
//   passwordHash: string;

//   @IsString()
//   @IsNotEmpty()
//   username: string;

//   @IsNumber()
//   roleId: number;
// }


import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Already hashed password' })
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @ApiProperty()
  @IsNumber()
  roleId: number;
}
