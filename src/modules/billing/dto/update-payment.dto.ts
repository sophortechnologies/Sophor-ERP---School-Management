import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    description: 'Updated bill identifier related to the payment',
    example: 55,
  })
  @IsOptional()
  @IsInt()
  billId?: number;

  @ApiPropertyOptional({
    description: 'Updated amount paid by the student',
    example: 3000,
  })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @ApiPropertyOptional({
    description: 'Updated payment method (e.g. CASH, BANK_TRANSFER, MOBILE_MONEY)',
    example: 'BANK_TRANSFER',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Updated payment date (ISO 8601 format)',
    example: '2025-02-22',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({
    description: 'Updated payment status',
    example: 'SUCCESS',
  })
  @IsOptional()
  @IsString()
  status?: string; // SUCCESS | FAILED | PENDING
}
