/**
 * Receipt generation utilities
 */

// Generate unique receipt number
export const generateReceiptNumber = (prefix = 'RC') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `${prefix}${year}${month}${day}${random}`;
};

// Generate unique bill number
export const generateBillNumber = (prefix = 'BL') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `${prefix}${year}${month}${sequence}`;
};

// Generate invoice number
export const generateInvoiceNumber = (prefix = 'INV') => {
  const now = new Date();
  const year = now.getFullYear();
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  
  return `${prefix}-${year}-${sequence}`;
};

// Simple number to words converter for Indian rupees
export const numberToWords = (num) => {
  if (num === 0) return 'Zero Rupees';
  
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
  
  let words = '';
  let number = Math.floor(num);
  let paise = Math.round((num - number) * 100);
  
  if (number >= 10000000) {
    words += convertNumber(Math.floor(number / 10000000)) + ' Crore ';
    number %= 10000000;
  }
  
  if (number >= 100000) {
    words += convertNumber(Math.floor(number / 100000)) + ' Lakh ';
    number %= 100000;
  }
  
  if (number >= 1000) {
    words += convertNumber(Math.floor(number / 1000)) + ' Thousand ';
    number %= 1000;
  }
  
  if (number > 0) {
    words += convertNumber(number) + ' ';
  }
  
  words += 'Rupees';
  
  if (paise > 0) {
    words += ' and ' + convertNumber(paise) + ' Paise';
  }
  
  return words.trim() + ' Only';
  
  function convertNumber(n) {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertNumber(n % 100) : '');
  }
};

// Format receipt data for printing
export const formatReceiptForPrint = (receiptData) => {
  return {
    ...receiptData,
    formattedDate: new Date(receiptData.paymentDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    formattedTime: new Date(receiptData.paymentDate).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    items: receiptData.items || [],
    totalInWords: numberToWords(receiptData.amount)
  };
};

// Generate QR code data for UPI payments
export const generateUPIQRData = (upiId, amount, studentName, receiptNumber) => {
  const data = {
    pa: upiId,
    pn: studentName,
    am: amount.toString(),
    tn: `Fee Payment - ${receiptNumber}`,
    cu: 'INR'
  };
  
  return `upi://pay?${new URLSearchParams(data).toString()}`;
};