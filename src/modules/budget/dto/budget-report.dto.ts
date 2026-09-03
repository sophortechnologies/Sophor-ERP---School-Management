import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export enum ReportType {
  BUDGET_VS_ACTUAL = 'budget_vs_actual',
  DEPARTMENT_SUMMARY = 'department_summary',
  TRANSFER_HISTORY = 'transfer_history',
  ALERT_HISTORY = 'alert_history',
  COMMITMENT_REPORT = 'commitment_report',
}

export class BudgetReportDto {
  @ApiPropertyOptional({ enum: ReportType, default: ReportType.BUDGET_VS_ACTUAL })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ example: '2025-2026' })
  @IsOptional()
  @IsString()
  fiscalYear?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  departmentId?: number;
}