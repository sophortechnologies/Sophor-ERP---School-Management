// import { IsString, IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

// export class CreateClassAssignmentRuleDto {
//   @IsString()
//   gradeLevel: string;

//   @IsString()
//   section: string;

//   @IsNumber()
//   capacity: number;

//   @IsBoolean()
//   @IsOptional()
//   autoAssign?: boolean;

//   @IsNumber()
//   @IsOptional()
//   priority?: number;

//   @IsObject()
//   @IsOptional()
//   conditions?: any;

//   @IsBoolean()
//   @IsOptional()
//   isActive?: boolean;
// }

// export class UpdateClassAssignmentRuleDto {
//   @IsString()
//   @IsOptional()
//   gradeLevel?: string;

//   @IsString()
//   @IsOptional()
//   section?: string;

//   @IsNumber()
//   @IsOptional()
//   capacity?: number;

//   @IsBoolean()
//   @IsOptional()
//   autoAssign?: boolean;

//   @IsNumber()
//   @IsOptional()
//   priority?: number;

//   @IsObject()
//   @IsOptional()
//   conditions?: any;

//   @IsBoolean()
//   @IsOptional()
//   isActive?: boolean;
// }


import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClassAssignmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sectionId?: string;
}