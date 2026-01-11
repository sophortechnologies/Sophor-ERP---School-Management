import { IsString, MinLength } from 'class-validator';

export class ActivateStudentDto {
  @IsString()
  @MinLength(6)
  password: string;
}
