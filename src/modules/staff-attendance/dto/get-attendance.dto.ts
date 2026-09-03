// import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';
// import { Transform } from 'class-transformer';

// export class GetStaffAttendanceDto {
//   @IsInt()
//   userId: number;

//   @IsOptional()
//   @IsDateString()
//   startDate?: string;

//   @IsOptional()
//   @IsDateString()
//   endDate?: string;

//   @IsOptional()
//   @Transform(({ value }) => parseInt(value))
//   @IsInt()
//   @Min(1)
//   page?: number = 1;

//   @IsOptional()
//   @Transform(({ value }) => parseInt(value))
//   @IsInt()
//   @Min(1)
//   limit?: number = 31;
// }

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class GetStaffAttendanceDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // ADD THIS FIELD
  @ApiPropertyOptional({ example: 'PRESENT', enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}