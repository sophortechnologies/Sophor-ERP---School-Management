// // // import { IsString, IsNotEmpty, MinLength } from 'class-validator';
// // // import { ApiProperty } from '@nestjs/swagger';

// // // export class LoginDto {
// // //   @ApiProperty({ 
// // //     example: 'superadmin', 
// // //     description: 'Username or email address' 
// // //   })
// // //   @IsString()
// // //   @IsNotEmpty()
// // //   username: string;

// // //   @ApiProperty({ 
// // //     example: 'Admin123!', 
// // //     description: 'User password' 
// // //   })
// // //   @IsString()
// // //   @IsNotEmpty()
// // //   @MinLength(6)
// // //   password: string;
// // // }

// // import { ApiProperty } from '@nestjs/swagger';
// // import { IsEmail, IsString, MinLength } from 'class-validator';

// // export class LoginDto {
// //   @ApiProperty({
// //     description: 'Registered email address',
// //     example: 'admin@sophorerp.edu',
// //     required: true,
// //   })
// //   @IsEmail()
// //   email: string;

// //   @ApiProperty({
// //     description: 'User password (min 6 characters)',
// //     example: 'password123',
// //     minLength: 6,
// //     required: true,
// //   })
// //   @IsString()
// //   @MinLength(6)
// //   password: string;
// // }

// import { ApiProperty } from '@nestjs/swagger';
// import { IsString, MinLength, IsNotEmpty } from 'class-validator';

// export class LoginDto {
//   @ApiProperty({
//     description: 'Username (can be email, phone, or custom username)',
//     example: 'admin',
//     required: true,
//   })
//   @IsString()
//   @IsNotEmpty()
//   username: string;

//   @ApiProperty({
//     description: 'User password (min 6 characters)',
//     example: 'admin123',
//     minLength: 6,
//     required: true,
//   })
//   @IsString()
//   @MinLength(6)
//   password: string;
// }
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password (min 6 characters)',
    example: 'admin123',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;
}