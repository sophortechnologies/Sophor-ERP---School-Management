// // // // import { ApiPropertyOptional } from '@nestjs/swagger';
// // // // import { Type } from 'class-transformer';
// // // // import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
// // // // import { StudentStatus, Gender } from './create-student.dto';

// // // // export class QueryStudentDto {
// // // //   @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1 })
// // // //   @IsOptional()
// // // //   @Type(() => Number)
// // // //   @IsInt()
// // // //   @Min(1)
// // // //   page?: number = 1;

// // // //   @ApiPropertyOptional({ example: 10, description: 'Items per page', minimum: 1 })
// // // //   @IsOptional()
// // // //   @Type(() => Number)
// // // //   @IsInt()
// // // //   @Min(1)
// // // //   limit?: number = 10;

// // // //   @ApiPropertyOptional({ example: 'john', description: 'Search by name, admission number, or student ID' })
// // // //   @IsOptional()
// // // //   @IsString()
// // // //   search?: string;

// // // //   @ApiPropertyOptional({ example: 1, description: 'Filter by class ID' })
// // // //   @IsOptional()
// // // //   @Type(() => Number)
// // // //   @IsInt()
// // // //   classId?: number;

// // // //   @ApiPropertyOptional({ example: 1, description: 'Filter by session ID' })
// // // //   @IsOptional()
// // // //   @Type(() => Number)
// // // //   @IsInt()
// // // //   sessionId?: number;

// // // //   @ApiPropertyOptional({ enum: Gender, example: Gender.MALE, description: 'Filter by gender' })
// // // //   @IsOptional()
// // // //   @IsEnum(Gender)
// // // //   gender?: Gender;

// // // //   @ApiPropertyOptional({ enum: StudentStatus, example: StudentStatus.ACTIVE, description: 'Filter by status' })
// // // //   @IsOptional()
// // // //   @IsEnum(StudentStatus)
// // // //   status?: StudentStatus;

// // // //   @ApiPropertyOptional({ example: 10, description: 'Filter by grade (1-12)' })
// // // //   @IsOptional()
// // // //   @Type(() => Number)
// // // //   @IsInt()
// // // //   @Min(1)
// // // //   grade?: number;

// // // //   @ApiPropertyOptional({ example: 'A', description: 'Filter by section' })
// // // //   @IsOptional()
// // // //   @IsString()
// // // //   section?: string;
// // // // }
// // // import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
// // // import { Type } from 'class-transformer';

// // // export class QueryStudentDto {
// // //   @IsOptional()
// // //   @Type(() => Number)
// // //   @IsNumber()
// // //   page?: number = 1;

// // //   @IsOptional()
// // //   @Type(() => Number)
// // //   @IsNumber()
// // //   limit?: number = 10;

// // //   @IsOptional()
// // //   @IsString()
// // //   search?: string;

// // //   @IsOptional()
// // //   @Type(() => Number)
// // //   @IsNumber()
// // //   classId?: number;

// // //   @IsOptional()
// // //   @Type(() => Number)
// // //   @IsNumber()
// // //   sessionId?: number;

// // //   @IsOptional()
// // //   @IsString()
// // //   gender?: string;

// // //   @IsOptional()
// // //   @IsString()
// // //   status?: string;

// // //   @IsOptional()
// // //   @Type(() => Number)
// // //   @IsNumber()
// // //   grade?: number;

// // //   @IsOptional()
// // //   @IsString()
// // //   section?: string;

// // //   @IsOptional()
// // //   @IsString()
// // //   admissionNumber?: string;

// // //   @IsOptional()
// // //   @IsString()
// // //   studentId?: string;
// // // }


// // import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
// // import { ApiProperty } from '@nestjs/swagger';
// // import { Type } from 'class-transformer';

// // export class QueryStudentDto {
// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   search?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   classId?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   sectionId?: string;

// //   @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'], required: false })
// //   @IsOptional()
// //   @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'])
// //   status?: string;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   gender?: string;

// //   @ApiProperty({ default: 1 })
// //   @Type(() => Number)
// //   @IsNumber()
// //   @Min(1)
// //   page: number = 1;

// //   @ApiProperty({ default: 10 })
// //   @Type(() => Number)
// //   @IsNumber()
// //   @Min(1)
// //   limit: number = 10;

// //   @ApiProperty({ required: false })
// //   @IsOptional()
// //   @IsString()
// //   sortBy?: string;

// //   @ApiProperty({ enum: ['asc', 'desc'], required: false })
// //   @IsOptional()
// //   @IsEnum(['asc', 'desc'])
// //   sortOrder?: 'asc' | 'desc';
// // }

// import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';

// export class QueryStudentDto {
//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   search?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   classId?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   sectionId?: string;

//   @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'], required: false })
//   @IsOptional()
//   @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'])
//   status?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   gender?: string;

//   @ApiProperty({ default: 1 })
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   page: number = 1;

//   @ApiProperty({ default: 10 })
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   limit: number = 10;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   sortBy?: string;

//   @ApiProperty({ enum: ['asc', 'desc'], required: false })
//   @IsOptional()
//   @IsEnum(['asc', 'desc'])
//   sortOrder?: 'asc' | 'desc';
// }

import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'], required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}