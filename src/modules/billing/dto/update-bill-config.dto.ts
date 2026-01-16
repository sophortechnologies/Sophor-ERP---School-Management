import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsNumber,
  IsArray,
  IsString,
} from 'class-validator'

/**
 * DTO for updating an existing billing configuration.
 *
 * All fields are optional — only the provided fields
 * will be updated.
 */
export class UpdateBillConfigDto {
  @ApiPropertyOptional({
    description:
      'Updated fee amount. Provide only if the amount needs to be changed',
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiPropertyOptional({
    description:
      'Updated list of allowed payment methods',
    example: ['CASH', 'BANK', 'ONLINE'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  paymentMethodOptions?: string[]

  @ApiPropertyOptional({
    description:
      'Updated description or notes for this billing configuration',
    example: 'Updated tuition fee for Grade 11 students',
  })
  @IsOptional()
  @IsString()
  description?: string
}
