import { CreateStudentAdmissionDto } from './create-student-admission.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkAdmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentAdmissionDto)
  students: CreateStudentAdmissionDto[];
}