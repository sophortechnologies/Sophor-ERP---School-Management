import { IsInt, IsOptional, Min, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStaffLeavesDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page must be a valid integer' })
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit must be a valid integer' })
  @Min(1, { message: 'limit must be greater than or equal to 1' })
  limit: number = 20;

  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: string;
}
