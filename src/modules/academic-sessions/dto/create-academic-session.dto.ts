
import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAcademicSessionDto {
  @IsString()
  name: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAcademicSessionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}