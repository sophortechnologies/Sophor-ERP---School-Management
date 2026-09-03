// src/modules/students/dto/student-login.dto.ts
import { IsString, MinLength, IsOptional } from 'class-validator';

export class StudentLoginDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;
}