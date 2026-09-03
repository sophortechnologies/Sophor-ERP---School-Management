import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BankFileService {
  constructor(private readonly prisma: PrismaService) {}

  async generateCBEBulkFile(payrollRunId: number): Promise<string> {
    const records = await this.prisma.payrollRecord.findMany({
      where: { payrollRunId },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    const lines: string[] = [];

    // CBE Bulk Payment Format
    for (const record of records) {
      const accountNumber = record.employee.accountNumber || '';
      const employeeName = `${record.employee.user.firstName} ${record.employee.user.lastName}`;
      const amount = record.netPay.toNumber();

      // Format: AccountNumber|Amount|BeneficiaryName|Reference
      // CBE specific format
      const line = `${accountNumber}|${amount.toFixed(2)}|${employeeName}|Salary-${new Date().toISOString().slice(0, 10)}`;
      lines.push(line);
    }

    const fileName = `cbe_bulk_${payrollRunId}_${Date.now()}.txt`;
    const filePath = path.join(process.cwd(), 'uploads', 'bank-files', fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, lines.join('\n'));

    // Save file reference
    await this.prisma.bankFile.create({
      data: {
        payrollRunId,
        bankName: 'CBE',
        fileFormat: 'CBE_BULK',
        fileUrl: filePath,
        totalAmount: records.reduce((sum, r) => sum + r.netPay.toNumber(), 0),
        totalTransactions: records.length,
        generatedBy: 1, // Current user ID
      },
    });

    return filePath;
  }

  async generateDashenBankFile(payrollRunId: number): Promise<string> {
    const records = await this.prisma.payrollRecord.findMany({
      where: { payrollRunId },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    // Dashen Bank Excel/CSV format
    const headers = ['Account Number', 'Beneficiary Name', 'Amount', 'Reference', 'Narrative'];
    const rows = records.map(record => [
      record.employee.accountNumber || '',
      `${record.employee.user.firstName} ${record.employee.user.lastName}`,
      record.netPay.toNumber(),
      `SAL-${new Date().toISOString().slice(0, 10)}`,
      'Monthly Salary',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const fileName = `dashen_bulk_${payrollRunId}_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'uploads', 'bank-files', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, csvContent);

    await this.prisma.bankFile.create({
      data: {
        payrollRunId,
        bankName: 'DASHEN',
        fileFormat: 'DASHEN_CSV',
        fileUrl: filePath,
        totalAmount: records.reduce((sum, r) => sum + r.netPay.toNumber(), 0),
        totalTransactions: records.length,
        generatedBy: 1,
      },
    });

    return filePath;
  }
}