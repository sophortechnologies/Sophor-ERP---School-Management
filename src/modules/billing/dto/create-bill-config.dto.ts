import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsPositive,
  Min,
  IsIn,
  ArrayMinSize,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

// Valid fee types
export const VALID_FEE_TYPES = [
  'TUITION',
  'REGISTRATION',
  'EXAM',
  'TRANSPORT',
  'LIBRARY',
  'HOSTEL',
  'LABORATORY',
  'SPORTS',
  'DEVELOPMENT',
  'LATE_FEE',
  'OTHER',
] as const;

export type FeeType = typeof VALID_FEE_TYPES[number];

// Valid payment methods
export const VALID_PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CARD',
  'CHEQUE',
] as const;

export type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

/**
 * DTO for creating a billing configuration for a class.
 */
export class CreateBillConfigDto {
  @ApiProperty({
    description: 'ID of the class this billing configuration belongs to',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'classId must be an integer' })
  @IsPositive({ message: 'classId must be a positive number' })
  @Type(() => Number)
  classId: number;

  @ApiProperty({
    description: 'Type of fee to be charged',
    example: 'TUITION',
    enum: VALID_FEE_TYPES,
  })
  @IsString({ message: 'feeType must be a string' })
  @IsIn(VALID_FEE_TYPES, {
    message: `feeType must be one of: ${VALID_FEE_TYPES.join(', ')}`,
  })
  feeType: string;

  @ApiProperty({
    description: 'Amount to be charged for the selected fee type',
    example: 1500,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false }, { message: 'amount must be a number' })
  @Min(0, { message: 'amount cannot be negative' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Allowed payment methods for this billing configuration',
    example: ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY'],
    enum: VALID_PAYMENT_METHODS,
    isArray: true,
  })
  @IsArray({ message: 'paymentMethodOptions must be an array' })
  @ArrayMinSize(1, { message: 'At least one payment method is required' })
  @IsIn(VALID_PAYMENT_METHODS, {
    each: true,
    message: `Each payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
  })
  paymentMethodOptions: string[];

  @ApiPropertyOptional({
    description: 'Additional notes or description for this billing configuration',
    example: 'Monthly tuition fee for Grade 10 students',
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this configuration is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}