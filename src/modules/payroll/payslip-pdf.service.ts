import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PayslipPDFService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePayslip(payrollRecordId: number): Promise<string> {
    const record = await this.prisma.payrollRecord.findUnique({
      where: { id: payrollRecordId },
      include: {
        employee: {
          include: {
            user: true,
            department: true,
          },
        },
        payrollRun: true,
      },
    });

    if (!record) {
      throw new Error('Payroll record not found');
    }

    const fileName = `payslip_${record.employee.employeeCode}_${record.payrollRun.month}_${record.payrollRun.year}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'payslips', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // School Header
    doc.fontSize(20).text('SCHOOL NAME', { align: 'center' });
    doc.fontSize(10).text('Address Line 1, City, Country', { align: 'center' });
    doc.fontSize(10).text('Tel: +251-XXX-XXX-XXX | Email: info@school.com', { align: 'center' });
    doc.moveDown();

    // Payslip Title
    doc.fontSize(16).text('PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Employee Details
    doc.fontSize(10);
    doc.text(`Employee Name: ${record.employee.user.firstName} ${record.employee.user.lastName}`);
    doc.text(`Employee Code: ${record.employee.employeeCode}`);
    doc.text(`Department: ${record.employee.department?.name || 'N/A'}`);
    doc.text(`Month: ${record.payrollRun.month}/${record.payrollRun.year}`);
    doc.moveDown();

    // Calculate values from existing fields
    const basicSalary = record.basicSalary?.toNumber() || 0;
    const allowances = record.allowances?.toNumber() || 0;
    const deductions = record.deductions?.toNumber() || 0;
    const netPay = record.netPay?.toNumber() || 0;
    const employeePension = record.employeePension?.toNumber() || 0;
    const incomeTax = record.incomeTax?.toNumber() || 0;
    
    const grossSalary = basicSalary + allowances;

    // Earnings Table
    doc.text('EARNINGS', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Basic Salary: ${basicSalary.toFixed(2)} ETB`);
    doc.text(`Allowances: ${allowances.toFixed(2)} ETB`);
    doc.moveDown();
    doc.text(`Gross Salary: ${grossSalary.toFixed(2)} ETB`, { underline: true });
    doc.moveDown();

    // Deductions
    doc.text('DEDUCTIONS', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Deductions: ${deductions.toFixed(2)} ETB`);
    if (employeePension > 0) {
      doc.text(`Pension (7%): ${employeePension.toFixed(2)} ETB`);
    }
    if (incomeTax > 0) {
      doc.text(`Income Tax: ${incomeTax.toFixed(2)} ETB`);
    }
    doc.moveDown();
    const totalDeductionsValue = deductions + employeePension + incomeTax;
    doc.text(`Total Deductions: ${totalDeductionsValue.toFixed(2)} ETB`, { underline: true });
    doc.moveDown();

    // Net Pay
    doc.fontSize(14);
    doc.text(`NET PAY: ${netPay.toFixed(2)} ETB`, { align: 'center', underline: true });
    doc.moveDown();

    // Footer
    doc.fontSize(8);
    doc.text('This is a computer generated document. No signature required.', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      stream.on('finish', () => {
        resolve(filePath);
      });
    });
  }

  async generateBulkPayslips(payrollRunId: number): Promise<string[]> {
    const records = await this.prisma.payrollRecord.findMany({
      where: { payrollRunId },
    });

    const paths: string[] = [];
    for (const record of records) {
      const path = await this.generatePayslip(record.id);
      paths.push(path);
    }

    return paths;
  }
}