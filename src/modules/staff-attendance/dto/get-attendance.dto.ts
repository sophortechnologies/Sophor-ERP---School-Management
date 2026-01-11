import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStaffAttendanceDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 31;
}