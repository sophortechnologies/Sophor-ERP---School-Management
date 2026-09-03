import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Unique identifier of the student making the payment',
    example: 101,
  })
  @IsInt()
  @Min(1)
  studentId: number;

  @ApiProperty({
    description: 'Unique identifier of the bill being paid',
    example: 55,
  })
  @IsInt()
  @Min(1)
  billId: number;

  @ApiProperty({
    description: 'Amount paid by the student',
    example: 2500,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amountPaid: number;

  @ApiProperty({
    description: 'Payment method used',
    example: 'CASH',
    enum: ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD', 'CHEQUE'],
  })
  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD', 'CHEQUE'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Date the payment was made (ISO 8601 format)',
    example: '2025-02-20',
  })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    example: 'SUCCESS',
    enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Transaction ID for online/bank payments',
    example: 'TXN123456789',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the payment',
    example: 'Payment for March tuition fee',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}