import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class StudentQueryDto {
  /* =========================
     PAGINATION
  ========================= */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  /* =========================
     FILTERS
  ========================= */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  classId?: number;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
