import { IsOptional, IsNumber, IsArray, IsString } from 'class-validator';

export class UpdateBillConfigDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsArray()
  paymentMethodOptions?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
