import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
