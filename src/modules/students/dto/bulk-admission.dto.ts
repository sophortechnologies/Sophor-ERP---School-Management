import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class BulkAdmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}
