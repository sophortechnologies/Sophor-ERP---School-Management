import { IsInt, IsDateString } from 'class-validator';

export class CreateBillDto {
  @IsInt()
  studentId: number;

  @IsInt()
  billConfigId: number;

  @IsDateString()
  dueDate: string;
}
