import { IsEnum, IsInt } from 'class-validator';

export enum ReportExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

export class ExportReportDto {
  @IsInt()
  examId: number;

  @IsEnum(ReportExportFormat)
  format: ReportExportFormat;
}
