import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Unique identifier of the student making the payment',
    example: 101,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'Unique identifier of the bill being paid',
    example: 55,
  })
  @IsInt()
  billId: number;

  @ApiProperty({
    description: 'Amount paid by the student',
    example: 2500,
  })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({
    description: 'Payment method used (e.g. CASH, BANK_TRANSFER, MOBILE_MONEY)',
    example: 'CASH',
  })
  @IsString()
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
  })
  @IsOptional()
  @IsString()
  status?: string; // SUCCESS | FAILED | PENDING
}
