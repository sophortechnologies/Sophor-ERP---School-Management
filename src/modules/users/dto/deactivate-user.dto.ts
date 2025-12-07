// // src/modules/users/dto/deactivate-user.dto.ts

// import { ApiProperty } from '@nestjs/swagger';
// import { IsOptional, IsString } from 'class-validator';

// export class DeactivateUserDto {
//   @ApiProperty({ example: 'Violation of rules', required: false })
//   @IsOptional()
//   @IsString()
//   reason?: string;
// }


import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeactivateUserDto {
  @ApiProperty({ example: 'Violation of rules', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
