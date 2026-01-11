import { IsInt, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateBillConfigDto {
  @IsInt()
  classId: number;

  @IsString()
  feeType: string;

  @IsNumber()
  amount: number;

  @IsArray()
  paymentMethodOptions: string[]; // ["CASH", "BANK", "ONLINE"]

  @IsOptional()
  @IsString()
  description?: string;
}
