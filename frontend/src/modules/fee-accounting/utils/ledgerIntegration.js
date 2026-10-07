// /**
//  * Ledger integration utilities for double-entry bookkeeping
//  */

// // Account types
// export const ACCOUNT_TYPES = {
//   ASSET: 'asset',
//   LIABILITY: 'liability',
//   EQUITY: 'equity',
//   INCOME: 'income',
//   EXPENSE: 'expense'
// };

// // Standard chart of accounts for school ERP
// export const CHART_OF_ACCOUNTS = {
//   // Assets
//   CASH: { code: '1001', name: 'Cash in Hand', type: ACCOUNT_TYPES.ASSET },
//   BANK: { code: '1002', name: 'Bank Account', type: ACCOUNT_TYPES.ASSET },
//   STUDENT_RECEIVABLES: { code: '1003', name: 'Student Receivables', type: ACCOUNT_TYPES.ASSET },
  
//   // Income
//   TUITION_FEES: { code: '4001', name: 'Tuition Fees Income', type: ACCOUNT_TYPES.INCOME },
//   ADMISSION_FEES: { code: '4002', name: 'Admission Fees Income', type: ACCOUNT_TYPES.INCOME },
//   EXAMINATION_FEES: { code: '4003', name: 'Examination Fees Income', type: ACCOUNT_TYPES.INCOME },
//   LIBRARY_FEES: { code: '4004', name: 'Library Fees Income', type: ACCOUNT_TYPES.INCOME },
//   TRANSPORT_FEES: { code: '4005', name: 'Transport Fees Income', type: ACCOUNT_TYPES.INCOME },
//   HOSTEL_FEES: { code: '4006', name: 'Hostel Fees Income', type: ACCOUNT_TYPES.INCOME },
//   LATE_FEES: { code: '4007', name: 'Late Fees Income', type: ACCOUNT_TYPES.INCOME },
//   OTHER_INCOME: { code: '4008', name: 'Other Income', type: ACCOUNT_TYPES.INCOME },
  
//   // Expenses
//   SALARY_EXPENSE: { code: '5001', name: 'Salary Expense', type: ACCOUNT_TYPES.EXPENSE },
//   UTILITY_EXPENSE: { code: '5002', name: 'Utility Expense', type: ACCOUNT_TYPES.EXPENSE },
//   MAINTENANCE_EXPENSE: { code: '5003', name: 'Maintenance Expense', type: ACCOUNT_TYPES.EXPENSE },
//   STATIONERY_EXPENSE: { code: '5004', name: 'Stationery Expense', type: ACCOUNT_TYPES.EXPENSE },
//   MARKETING_EXPENSE: { code: '5005', name: 'Marketing Expense', type: ACCOUNT_TYPES.EXPENSE },
//   OTHER_EXPENSE: { code: '5006', name: 'Other Expense', type: ACCOUNT_TYPES.EXPENSE },
  
//   // Liabilities
//   ADVANCE_FEES: { code: '2001', name: 'Advance Fees Received', type: ACCOUNT_TYPES.LIABILITY },
//   PAYABLE_EXPENSES: { code: '2002', name: 'Accounts Payable', type: ACCOUNT_TYPES.LIABILITY },
  
//   // Equity
//   CAPITAL: { code: '3001', name: 'Capital', type: ACCOUNT_TYPES.EQUITY },
//   RETAINED_EARNINGS: { code: '3002', name: 'Retained Earnings', type: ACCOUNT_TYPES.EQUITY },
// };

// // Create ledger entry for fee payment
// export const createPaymentLedgerEntry = (paymentData) => {
//   const {
//     amount,
//     paymentMode,
//     studentId,
//     receiptNumber,
//     feeType,
//     transactionDate = new Date().toISOString()
//   } = paymentData;

//   // Determine debit account based on payment mode
//   let debitAccount = CHART_OF_ACCOUNTS.CASH;
//   if (paymentMode === 'bank_transfer' || paymentMode === 'cheque') {
//     debitAccount = CHART_OF_ACCOUNTS.BANK;
//   } else if (paymentMode === 'online') {
//     debitAccount = CHART_OF_ACCOUNTS.BANK;
//   }

//   // Determine credit account based on fee type
//   let creditAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   switch (feeType) {
//     case 'admission':
//       creditAccount = CHART_OF_ACCOUNTS.ADMISSION_FEES;
//       break;
//     case 'examination':
//       creditAccount = CHART_OF_ACCOUNTS.EXAMINATION_FEES;
//       break;
//     case 'library':
//       creditAccount = CHART_OF_ACCOUNTS.LIBRARY_FEES;
//       break;
//     case 'transport':
//       creditAccount = CHART_OF_ACCOUNTS.TRANSPORT_FEES;
//       break;
//     case 'hostel':
//       creditAccount = CHART_OF_ACCOUNTS.HOSTEL_FEES;
//       break;
//     case 'late_fee':
//       creditAccount = CHART_OF_ACCOUNTS.LATE_FEES;
//       break;
//     default:
//       creditAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   }

//   // Create ledger entry
//   const ledgerEntry = {
//     transactionDate,
//     voucherNumber: receiptNumber,
//     voucherType: 'payment',
//     referenceId: studentId,
//     narration: `Fee payment received - ${feeType}`,
//     entries: [
//       {
//         accountCode: debitAccount.code,
//         accountName: debitAccount.name,
//         debit: amount,
//         credit: 0,
//         type: debitAccount.type
//       },
//       {
//         accountCode: creditAccount.code,
//         accountName: creditAccount.name,
//         debit: 0,
//         credit: amount,
//         type: creditAccount.type
//       }
//     ],
//     totalDebit: amount,
//     totalCredit: amount,
//     createdBy: 'system',
//     createdAt: new Date().toISOString()
//   };

//   return ledgerEntry;
// };

// // Create ledger entry for bill generation
// export const createBillLedgerEntry = (billData) => {
//   const {
//     studentId,
//     billNumber,
//     amount,
//     feeType,
//     dueDate,
//     billingDate = new Date().toISOString()
//   } = billData;

//   // Determine income account based on fee type
//   let incomeAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   switch (feeType) {
//     case 'admission':
//       incomeAccount = CHART_OF_ACCOUNTS.ADMISSION_FEES;
//       break;
//     case 'examination':
//       incomeAccount = CHART_OF_ACCOUNTS.EXAMINATION_FEES;
//       break;
//     case 'library':
//       incomeAccount = CHART_OF_ACCOUNTS.LIBRARY_FEES;
//       break;
//     case 'transport':
//       incomeAccount = CHART_OF_ACCOUNTS.TRANSPORT_FEES;
//       break;
//     case 'hostel':
//       incomeAccount = CHART_OF_ACCOUNTS.HOSTEL_FEES;
//       break;
//     default:
//       incomeAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   }

//   // Create ledger entry (accrual accounting)
//   const ledgerEntry = {
//     transactionDate: billingDate,
//     voucherNumber: billNumber,
//     voucherType: 'invoice',
//     referenceId: studentId,
//     narration: `Fee billed - ${feeType}, Due: ${new Date(dueDate).toLocaleDateString()}`,
//     entries: [
//       {
//         accountCode: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.code,
//         accountName: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.name,
//         debit: amount,
//         credit: 0,
//         type: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.type
//       },
//       {
//         accountCode: incomeAccount.code,
//         accountName: incomeAccount.name,
//         debit: 0,
//         credit: amount,
//         type: incomeAccount.type
//       }
//     ],
//     totalDebit: amount,
//     totalCredit: amount,
//     createdBy: 'system',
//     createdAt: new Date().toISOString()
//   };

//   return ledgerEntry;
// };

// // Create ledger entry for discount/write-off
// export const createDiscountLedgerEntry = (discountData) => {
//   const {
//     studentId,
//     referenceNumber,
//     amount,
//     discountType,
//     feeType,
//     transactionDate = new Date().toISOString()
//   } = discountData;

//   // Determine income account based on fee type
//   let incomeAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   switch (feeType) {
//     case 'admission':
//       incomeAccount = CHART_OF_ACCOUNTS.ADMISSION_FEES;
//       break;
//     case 'examination':
//       incomeAccount = CHART_OF_ACCOUNTS.EXAMINATION_FEES;
//       break;
//     default:
//       incomeAccount = CHART_OF_ACCOUNTS.TUITION_FEES;
//   }

//   // Create ledger entry for discount
//   const ledgerEntry = {
//     transactionDate,
//     voucherNumber: referenceNumber,
//     voucherType: discountType === 'waiver' ? 'waiver' : 'discount',
//     referenceId: studentId,
//     narration: `${discountType === 'waiver' ? 'Fee waiver' : 'Discount'} applied - ${feeType}`,
//     entries: [
//       {
//         accountCode: incomeAccount.code,
//         accountName: incomeAccount.name,
//         debit: amount,
//         credit: 0,
//         type: incomeAccount.type
//       },
//       {
//         accountCode: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.code,
//         accountName: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.name,
//         debit: 0,
//         credit: amount,
//         type: CHART_OF_ACCOUNTS.STUDENT_RECEIVABLES.type
//       }
//     ],
//     totalDebit: amount,
//     totalCredit: amount,
//     createdBy: 'system',
//     createdAt: new Date().toISOString()
//   };

//   return ledgerEntry;
// };

// // Validate ledger entry (debits must equal credits)
// export const validateLedgerEntry = (ledgerEntry) => {
//   if (!ledgerEntry.entries || ledgerEntry.entries.length === 0) {
//     return { valid: false, error: 'No ledger entries provided' };
//   }

//   const totalDebit = ledgerEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
//   const totalCredit = ledgerEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

//   if (Math.abs(totalDebit - totalCredit) > 0.01) {
//     return { 
//       valid: false, 
//       error: `Debits (${totalDebit}) do not equal credits (${totalCredit})` 
//     };
//   }

//   return { valid: true, totalDebit, totalCredit };
// };

// // Generate trial balance from ledger entries
// export const generateTrialBalance = (ledgerEntries) => {
//   const accountBalances = {};

//   ledgerEntries.forEach(entry => {
//     entry.entries.forEach(line => {
//       const accountCode = line.accountCode;
      
//       if (!accountBalances[accountCode]) {
//         accountBalances[accountCode] = {
//           accountCode,
//           accountName: line.accountName,
//           accountType: line.type,
//           debit: 0,
//           credit: 0,
//           balance: 0
//         };
//       }

//       accountBalances[accountCode].debit += line.debit || 0;
//       accountBalances[accountCode].credit += line.credit || 0;
      
//       // Calculate balance based on account type
//       if (line.type === ACCOUNT_TYPES.ASSET || line.type === ACCOUNT_TYPES.EXPENSE) {
//         accountBalances[accountCode].balance = 
//           (accountBalances[accountCode].debit - accountBalances[accountCode].credit);
//       } else {
//         accountBalances[accountCode].balance = 
//           (accountBalances[accountCode].credit - accountBalances[accountCode].debit);
//       }
//     });
//   });

//   return Object.values(accountBalances);
// };

// // Generate income statement
// export const generateIncomeStatement = (trialBalance, startDate, endDate) => {
//   const incomeAccounts = trialBalance.filter(acc => 
//     acc.accountType === ACCOUNT_TYPES.INCOME
//   );
//   const expenseAccounts = trialBalance.filter(acc => 
//     acc.accountType === ACCOUNT_TYPES.EXPENSE
//   );

//   const totalIncome = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
//   const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
//   const netIncome = totalIncome - totalExpenses;

//   return {
//     period: { startDate, endDate },
//     income: {
//       accounts: incomeAccounts,
//       total: totalIncome
//     },
//     expenses: {
//       accounts: expenseAccounts,
//       total: totalExpenses
//     },
//     netIncome
//   };
// };