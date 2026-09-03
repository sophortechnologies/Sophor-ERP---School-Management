import { Injectable } from '@nestjs/common';

@Injectable()
export class EthiopianTaxService {
  // Ethiopian Employment Income Tax Rates (Monthly)
  // Proclamation No. 979/2016
  private readonly taxBrackets = [
    { min: 0, max: 600, rate: 0, deduction: 0 },
    { min: 601, max: 1650, rate: 10, deduction: 60 },
    { min: 1651, max: 3200, rate: 15, deduction: 142.5 },
    { min: 3201, max: 5250, rate: 20, deduction: 302.5 },
    { min: 5251, max: 7800, rate: 25, deduction: 565 },
    { min: 7801, max: 10900, rate: 30, deduction: 955 },
    { min: 10901, max: Infinity, rate: 35, deduction: 1500 },
  ];

  calculateIncomeTax(monthlyGrossSalary: number): number {
    for (const bracket of this.taxBrackets) {
      if (monthlyGrossSalary <= bracket.max) {
        const tax = (monthlyGrossSalary * bracket.rate) / 100 - bracket.deduction;
        return Math.max(0, Math.round(tax * 100) / 100);
      }
    }
    return 0;
  }

  calculateAnnualIncomeTax(monthlySalaries: number[]): number {
    const annualTotal = monthlySalaries.reduce((sum, s) => sum + s, 0);
    return this.calculateIncomeTax(annualTotal / 12) * 12;
  }

  // Ethiopian Pension Contribution (Private Organizations)
  // 7% employee, 11% employer
  calculatePension(grossSalary: number): { employee: number; employer: number } {
    const pensionableSalary = Math.min(grossSalary, 10000); // Cap at 10,000 ETB
    return {
      employee: Math.round((pensionableSalary * 7) / 100 * 100) / 100,
      employer: Math.round((pensionableSalary * 11) / 100 * 100) / 100,
    };
  }
}