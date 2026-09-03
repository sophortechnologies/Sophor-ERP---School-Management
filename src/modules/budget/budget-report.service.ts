import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfmake';
import { BudgetReportDto, ReportFormat, ReportType } from './dto/budget-report.dto';

@Injectable()
export class BudgetReportService {
  constructor(private prisma: PrismaService) {}

  async generateReport(dto: BudgetReportDto): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const { type = ReportType.BUDGET_VS_ACTUAL, format = ReportFormat.PDF, fiscalYear, departmentId } = dto;

    let data: any;
    let filename: string;

    switch (type) {
      case ReportType.BUDGET_VS_ACTUAL:
        data = await this.getBudgetVsActualData(fiscalYear, departmentId);
        filename = `budget_vs_actual_${fiscalYear || 'all'}`;
        break;
      case ReportType.DEPARTMENT_SUMMARY:
        data = await this.getDepartmentSummaryData(fiscalYear);
        filename = `department_summary_${fiscalYear || 'all'}`;
        break;
      case ReportType.TRANSFER_HISTORY:
        data = await this.getTransferHistoryData(fiscalYear);
        filename = `transfer_history_${fiscalYear || 'all'}`;
        break;
      case ReportType.ALERT_HISTORY:
        data = await this.getAlertHistoryData(fiscalYear);
        filename = `alert_history_${fiscalYear || 'all'}`;
        break;
      case ReportType.COMMITMENT_REPORT:
        data = await this.getCommitmentReportData(fiscalYear);
        filename = `commitment_report_${fiscalYear || 'all'}`;
        break;
      default:
        data = await this.getBudgetVsActualData(fiscalYear, departmentId);
        filename = `budget_report_${Date.now()}`;
    }

    if (format === ReportFormat.PDF) {
      return await this.generatePDF(data, filename);
    } else if (format === ReportFormat.EXCEL) {
      return await this.generateExcel(data, filename);
    } else {
      return await this.generateCSV(data, filename);
    }
  }

  // ==================== DATA FETCHING METHODS ====================

  async getBudgetVsActualData(fiscalYear?: string, departmentId?: number) {
    const where: any = {};
    if (fiscalYear) where.fiscalYear = fiscalYear;
    if (departmentId) where.departmentId = departmentId;

    const budgets = await this.prisma.budget.findMany({
      where,
      include: {
        department: true,
        parent: true,
      },
      orderBy: { category: 'asc' },
    });

    return budgets.map(b => ({
      budgetCode: b.budgetCode,
      category: b.category,
      subCategory: b.subCategory,
      department: b.department?.name || 'Institution',
      allocatedAmount: b.allocatedAmount.toNumber(),
      committedAmount: b.committedAmount?.toNumber() || 0,
      actualAmount: b.actualAmount?.toNumber() || 0,
      availableAmount: b.availableAmount.toNumber(),
      utilizationPercentage: ((b.actualAmount?.toNumber() || 0) / b.allocatedAmount.toNumber()) * 100,
      status: b.status,
    }));
  }

  private async getDepartmentSummaryData(fiscalYear?: string) {
    const where: any = {};
    if (fiscalYear) where.fiscalYear = fiscalYear;

    const budgets = await this.prisma.budget.findMany({
      where,
      include: { department: true },
    });

    const departmentMap = new Map();

    for (const b of budgets) {
      const deptName = b.department?.name || 'Institution';
      if (!departmentMap.has(deptName)) {
        departmentMap.set(deptName, {
          department: deptName,
          allocatedAmount: 0,
          actualAmount: 0,
          committedAmount: 0,
        });
      }
      const dept = departmentMap.get(deptName);
      dept.allocatedAmount += b.allocatedAmount.toNumber();
      dept.actualAmount += b.actualAmount?.toNumber() || 0;
      dept.committedAmount += b.committedAmount?.toNumber() || 0;
    }

    const result = Array.from(departmentMap.values());
    for (const dept of result) {
      dept.utilizationPercentage = (dept.actualAmount / dept.allocatedAmount) * 100;
      dept.availableAmount = dept.allocatedAmount - dept.actualAmount - dept.committedAmount;
    }

    return result;
  }

  private async getTransferHistoryData(fiscalYear?: string) {
    const where: any = {};
    if (fiscalYear) {
      where.OR = [
        { fromBudget: { fiscalYear } },
        { toBudget: { fiscalYear } },
      ];
    }

    const transfers = await this.prisma.budgetTransfer.findMany({
      where,
      include: {
        fromBudget: { include: { department: true } },
        toBudget: { include: { department: true } },
        requestedByUser: { select: { firstName: true, lastName: true } },
        approvedByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return transfers.map(t => ({
      transferNumber: t.transferNumber,
      fromBudget: t.fromBudget.budgetCode,
      fromDepartment: t.fromBudget.department?.name || 'Institution',
      toBudget: t.toBudget.budgetCode,
      toDepartment: t.toBudget.department?.name || 'Institution',
      amount: t.amount.toNumber(),
      reason: t.reason,
      status: t.status,
      requestedBy: `${t.requestedByUser.firstName} ${t.requestedByUser.lastName}`,
      requestedAt: t.requestedAt,
      approvedBy: t.approvedByUser ? `${t.approvedByUser.firstName} ${t.approvedByUser.lastName}` : null,
      approvedAt: t.approvedAt,
      executedAt: t.executedAt,
    }));
  }

  private async getAlertHistoryData(fiscalYear?: string) {
    const where: any = {};
    if (fiscalYear) {
      where.budget = { fiscalYear };
    }

    const alerts = await this.prisma.budgetAlert.findMany({
      where,
      include: {
        budget: true,
        resolvedByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(a => ({
      budgetCode: a.budget.budgetCode,
      alertType: a.alertType,
      percentageUsed: a.percentageUsed,
      threshold: a.threshold,
      message: a.message,
      isResolved: a.isResolved,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt,
      resolvedBy: a.resolvedByUser ? `${a.resolvedByUser.firstName} ${a.resolvedByUser.lastName}` : null,
    }));
  }

  private async getCommitmentReportData(fiscalYear?: string) {
    const where: any = {};
    if (fiscalYear) {
      where.budget = { fiscalYear };
    }

    const commitments = await this.prisma.budgetCommitment.findMany({
      where,
      include: {
        budget: { include: { department: true } },
      },
      orderBy: { committedAt: 'desc' },
    });

    return commitments.map(c => ({
      commitmentNumber: c.commitmentNumber,
      budgetCode: c.budget.budgetCode,
      department: c.budget.department?.name || 'Institution',
      referenceType: c.referenceType,
      referenceId: c.referenceId,
      amount: c.amount.toNumber(),
      description: c.description,
      status: c.status,
      committedAt: c.committedAt,
      realizedAt: c.realizedAt,
    }));
  }

  // ==================== PDF GENERATION ====================

  private async generatePDF(data: any[], filename: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const pdf = require('html-pdf');
  
  // Create HTML table
  const headers = Object.keys(data[0] || {});
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Budget Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2F4F4F; text-align: center; }
        .date { text-align: center; color: #666; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #2F4F4F; color: white; padding: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
      </style>
    </head>
    <body>
      <h1>Budget Report</h1>
      <div class="date">Generated on: ${new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
  `;
  
  for (const header of headers) {
    html += `<th>${header.toUpperCase()}</th>`;
  }
  
  html += `</tr></thead><tbody>`;
  
  for (const row of data) {
    html += `<tr>`;
    for (const header of headers) {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'number') value = value.toLocaleString();
      html += `<td>${value}</td>`;
    }
    html += `</tr>`;
  }
  
  html += `
        </tbody>
      </table>
      <div class="footer">Generated by School ERP System</div>
    </body>
    </html>
  `;
  
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          buffer: buffer,
          filename: `${filename}.pdf`,
          contentType: 'application/pdf',
        });
      }
    });
  });
}

  // ==================== EXCEL GENERATION ====================

  private async generateExcel(data: any[], filename: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget Report');

    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers.map(h => h.toUpperCase()));

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F4F4F' } };
    headerRow.font = { color: { argb: 'FFFFFFFF' } };

    // Add data rows
    for (const row of data) {
      worksheet.addRow(Object.values(row));
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(maxLength, cell.value?.toString().length || 0);
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      filename: `${filename}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ==================== CSV GENERATION ====================

  private async generateCSV(data: any[], filename: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      });
      csvRows.push(values.join(','));
    }

    return {
      buffer: Buffer.from(csvRows.join('\n'), 'utf-8'),
      filename: `${filename}.csv`,
      contentType: 'text/csv',
    };
  }
}