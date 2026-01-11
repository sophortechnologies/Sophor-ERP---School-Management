import { IsString } from 'class-validator';

export class UpdateBillStatusDto {
  @IsString()
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
}
