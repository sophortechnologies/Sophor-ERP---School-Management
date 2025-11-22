import { IsString, IsOptional, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdvancedSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'], required: false })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'], required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  admissionDateFrom?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  admissionDateTo?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasDocuments?: boolean;
}