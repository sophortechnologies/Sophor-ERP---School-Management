// import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// export class FilterUserDto {
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   page: number = 1;

//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   limit: number = 10;

//   @IsOptional()
//   @IsString()
//   search?: string;

//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   role?: number;

//   @IsOptional()
//   @IsString()
//   status?: string;
// }


import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page_size?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  role?: string;
}
