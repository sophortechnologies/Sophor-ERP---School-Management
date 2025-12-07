// // import { IsEmail, IsOptional, IsString, IsInt } from 'class-validator';

// // export class UpdateUserDto {
// //   @IsOptional()
// //   @IsString()
// //   firstName?: string;

// //   @IsOptional()
// //   @IsString()
// //   lastName?: string;

// //   @IsOptional()
// //   @IsEmail()
// //   email?: string;

// //   @IsOptional()
// //   phone?: string;

// //   @IsOptional()
// //   @IsInt()
// //   roleId?: number;

// //   // IMPORTANT: NO PASSWORD HERE
// // }


// // src/modules/users/dto/update-user.dto.ts

// import { IsEmail, IsOptional, IsString, IsInt } from 'class-validator';

// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   firstName?: string;

//   @IsOptional()
//   @IsString()
//   lastName?: string;

//   @IsOptional()
//   @IsEmail()
//   email?: string;

//   @IsOptional()
//   @IsString()
//   phone?: string;

//   @IsOptional()
//   @IsInt()
//   roleId?: number;

// }


import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  roleId?: number;
}
