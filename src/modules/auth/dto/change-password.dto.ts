// import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class ChangePasswordDto {
//   @ApiProperty({ 
//     example: 'OldPassword123!', 
//     description: 'Current password' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   currentPassword: string;

//   @ApiProperty({ 
//     example: 'NewSecurePassword123!', 
//     description: 'New password (min 8 characters with uppercase, lowercase, number and special character)' 
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
//   })
//   newPassword: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}