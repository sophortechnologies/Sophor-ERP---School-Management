import { IsInt, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsInt()
  examId?: number;

  @IsOptional()
  @IsInt()
  classId?: number;
}
