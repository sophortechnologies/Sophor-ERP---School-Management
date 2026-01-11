import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  studentId: number;

  @IsInt()
  billId: number;

  @IsNumber()
  amountPaid: number;

  @IsString()
  paymentMethod: string;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  status?: string; // SUCCESS | FAILED | PENDING
}
