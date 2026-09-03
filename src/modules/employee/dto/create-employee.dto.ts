// src/modules/employee/dto/create-employee.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { EmployeeType, EmployeeStatus, EmploymentType } from '../enums/employee.enum';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: EmployeeType, example: 'TEACHER' })
  @IsEnum(EmployeeType)
  employeeType: EmployeeType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiProperty({ example: 'Mathematics Teacher' })
  @IsString()
  designation: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  joiningDate: string;

  @ApiProperty({ enum: EmploymentType, example: 'PERMANENT' })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ enum: EmployeeStatus, example: 'ACTIVE' })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  salaryStructureId?: number;
}