import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator'

/**
 * DTO for creating a billing configuration for a class.
 */
export class CreateBillConfigDto {
  @ApiProperty({
    description: 'ID of the class this billing configuration belongs to',
    example: 1,
  })
  @IsInt()
  classId: number

  @ApiProperty({
    description:
      'Type of fee to be charged (e.g. TUITION, REGISTRATION, EXAM, LIBRARY)',
    example: 'TUITION',
  })
  @IsString()
  feeType: string

  @ApiProperty({
    description: 'Amount to be charged for the selected fee type',
    example: 1500,
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    description:
      'Allowed payment methods for this billing configuration',
    example: ['CASH', 'BANK', 'ONLINE'],
    isArray: true,
  })
  @IsArray()
  paymentMethodOptions: string[]

  @ApiPropertyOptional({
    description:
      'Additional notes or description for this billing configuration',
    example: 'Monthly tuition fee for Grade 10 students',
  })
  @IsOptional()
  @IsString()
  description?: string
}
