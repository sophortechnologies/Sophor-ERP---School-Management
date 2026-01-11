import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStaffLeavesDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  status?: string;
}