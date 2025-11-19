// import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
// import { IsEnum, IsOptional } from 'class-validator';
// import { CreateStudentDto, StudentStatus } from './create-student.dto';

// export class UpdateStudentDto extends PartialType(
//   OmitType(CreateStudentDto, ['password', 'username'] as const)
// ) {
//   @ApiPropertyOptional({ 
//     enum: StudentStatus, 
//     example: StudentStatus.ACTIVE,
//     description: 'Student status (Active, Inactive, Passed Out, Transferred)'
//   })
//   @IsEnum(StudentStatus)
//   @IsOptional()
//   status?: StudentStatus;
// }

import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional, IsNumber, IsBoolean, IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GuardianInfoDto, EducationalBackgroundDto, HealthInfoDto, DocumentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Add the missing properties that are causing errors
  @IsDateString()
  @IsOptional()
  tcDate?: string;

  @IsNumber()
  @IsOptional()
  guardianIncome?: number;

  @IsNumber()
  @IsOptional()
  previousPercentage?: number;

  // Ensure nested objects are properly typed
  @ValidateNested()
  @Type(() => GuardianInfoDto)
  @IsOptional()
  guardian?: GuardianInfoDto;

  @ValidateNested()
  @Type(() => EducationalBackgroundDto)
  @IsOptional()
  educationalBackground?: EducationalBackgroundDto;

  @ValidateNested()
  @Type(() => HealthInfoDto)
  @IsOptional()
  healthInfo?: HealthInfoDto;
}