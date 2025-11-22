// // // import { IsString, IsDate, IsEmail, IsOptional, IsBoolean } from 'class-validator';
// // // import { Type } from 'class-transformer';

// // // export class UpdateStudentDto {
// // //   @IsString()
// // //   @IsOptional()
// // //   firstName?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   lastName?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   guardianName?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   guardianRelation?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   guardianPhone?: string;

// // //   @IsDate()
// // //   @Type(() => Date)
// // //   @IsOptional()
// // //   dateOfBirth?: Date;

// // //   @IsString()
// // //   @IsOptional()
// // //   gender?: string;

// // //   @IsEmail()
// // //   @IsOptional()
// // //   email?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   phone?: string;

// // //   @IsString()
// // //   @IsOptional()
// // //   address?: string;

// // //   @IsBoolean()
// // //   @IsOptional()
// // //   isActive?: boolean;
// // // }


// // import { PartialType } from '@nestjs/swagger';
// // import { CreateStudentDto } from './create-student.dto';

// // export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

// import { PartialType } from '@nestjs/swagger';
// import { CreateStudentDto } from './create-student.dto';

// export class UpdateStudentDto extends PartialType(CreateStudentDto) {}


import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}