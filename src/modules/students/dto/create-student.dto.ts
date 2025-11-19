import { IsString, IsDate, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  // Required fields from your schema
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  guardianName: string;

  @IsString()
  guardianRelation: string;

  @IsString()
  guardianPhone: string;

  // Additional fields
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsString()
  gender: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianRelation?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}