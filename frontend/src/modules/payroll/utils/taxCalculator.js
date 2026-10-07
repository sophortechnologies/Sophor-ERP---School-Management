/**
 * Ethiopian Employee Income Tax Proclamation brackets:
 * 0 - 600 ETB: 0% (Deduction: 0)
 * 601 - 1,650 ETB: 10% (Deduction: 60)
 * 1,651 - 3,200 ETB: 15% (Deduction: 142.50)
 * 3,201 - 5,250 ETB: 20% (Deduction: 302.50)
 * 5,251 - 7,800 ETB: 25% (Deduction: 565)
 * 7,801 - 10,900 ETB: 30% (Deduction: 955)
 * Over 10,900 ETB: 35% (Deduction: 1,500)
 * Employee Pension: 7% of Basic Pay
 */

export const calculateEthiopianPayroll = (grossSalary) => {
  const gross = Number(grossSalary) || 0;
  if (gross <= 0) {
    return { gross: 0, tax: 0, pension: 0, totalDeductions: 0, netSalary: 0 };
  }

  // 1. Employee Pension (7%)
  const pension = Math.round(gross * 0.07 * 100) / 100;

  // 2. Income Tax
  let tax = 0;
  if (gross <= 600) {
    tax = 0;
  } else if (gross <= 1650) {
    tax = gross * 0.1 - 60;
  } else if (gross <= 3200) {
    tax = gross * 0.15 - 142.5;
  } else if (gross <= 5250) {
    tax = gross * 0.2 - 302.5;
  } else if (gross <= 7800) {
    tax = gross * 0.25 - 565;
  } else if (gross <= 10900) {
    tax = gross * 0.3 - 955;
  } else {
    tax = gross * 0.35 - 1500;
  }

  tax = Math.max(0, Math.round(tax * 100) / 100);
  const totalDeductions = Math.round((tax + pension) * 100) / 100;
  const netSalary = Math.max(
    0,
    Math.round((gross - totalDeductions) * 100) / 100,
  );

  return {
    gross,
    tax,
    pension,
    totalDeductions,
    netSalary,
  };
};
