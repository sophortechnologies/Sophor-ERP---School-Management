// /**
//  * Payment validation utilities
//  */

// // Validate credit card number using Luhn algorithm
// export const validateCreditCard = (cardNumber) => {
//   // Remove spaces and dashes
//   cardNumber = cardNumber.replace(/[\s-]/g, '');
  
//   // Check if it's all numbers
//   if (!/^\d+$/.test(cardNumber)) {
//     return { valid: false, error: 'Card number must contain only digits' };
//   }
  
//   // Check length
//   if (cardNumber.length < 13 || cardNumber.length > 19) {
//     return { valid: false, error: 'Card number must be 13-19 digits' };
//   }
  
//   // Luhn algorithm
//   let sum = 0;
//   let shouldDouble = false;
  
//   for (let i = cardNumber.length - 1; i >= 0; i--) {
//     let digit = parseInt(cardNumber.charAt(i));
    
//     if (shouldDouble) {
//       digit *= 2;
//       if (digit > 9) digit -= 9;
//     }
    
//     sum += digit;
//     shouldDouble = !shouldDouble;
//   }
  
//   const valid = (sum % 10) === 0;
  
//   if (!valid) {
//     return { valid: false, error: 'Invalid card number' };
//   }
  
//   // Identify card type
//   let cardType = 'unknown';
//   if (/^4/.test(cardNumber)) {
//     cardType = 'visa';
//   } else if (/^5[1-5]/.test(cardNumber)) {
//     cardType = 'mastercard';
//   } else if (/^3[47]/.test(cardNumber)) {
//     cardType = 'amex';
//   } else if (/^6(?:011|5)/.test(cardNumber)) {
//     cardType = 'discover';
//   } else if (/^3(?:0[0-5]|[68])/.test(cardNumber)) {
//     cardType = 'diners';
//   } else if (/^(?:2131|1800|35)/.test(cardNumber)) {
//     cardType = 'jcb';
//   }
  
//   return { valid: true, cardType };
// };

// // Validate CVV - FIXED EXPORT
// export const validateCVV = (cvv, cardType) => {
//   if (!cvv) {
//     return { valid: false, error: 'CVV is required' };
//   }
  
//   if (!/^\d+$/.test(cvv)) {
//     return { valid: false, error: 'CVV must contain only digits' };
//   }
  
//   const length = cvv.length;
//   let validLength = false;
  
//   switch (cardType) {
//     case 'amex':
//       validLength = length === 4;
//       break;
//     default:
//       validLength = length === 3;
//   }
  
//   if (!validLength) {
//     return { valid: false, error: `CVV must be ${cardType === 'amex' ? 4 : 3} digits` };
//   }
  
//   return { valid: true };
// };

// // Validate expiration date
// export const validateExpiryDate = (month, year) => {
//   if (!month || !year) {
//     return { valid: false, error: 'Expiry month and year are required' };
//   }
  
//   const currentDate = new Date();
//   const currentYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth() + 1;
  
//   const expiryYear = parseInt(year);
//   const expiryMonth = parseInt(month);
  
//   if (expiryYear < currentYear) {
//     return { valid: false, error: 'Card has expired' };
//   }
  
//   if (expiryYear === currentYear && expiryMonth < currentMonth) {
//     return { valid: false, error: 'Card has expired' };
//   }
  
//   if (expiryMonth < 1 || expiryMonth > 12) {
//     return { valid: false, error: 'Invalid expiry month' };
//   }
  
//   return { valid: true };
// };

// // Validate UPI ID
// export const validateUPI = (upiId) => {
//   if (!upiId) {
//     return { valid: false, error: 'UPI ID is required' };
//   }
  
//   const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  
//   if (!upiRegex.test(upiId)) {
//     return { valid: false, error: 'Invalid UPI ID format. Example: username@bank' };
//   }
  
//   return { valid: true };
// };

// // Validate Indian mobile number
// export const validateIndianMobile = (mobile) => {
//   if (!mobile) {
//     return { valid: false, error: 'Mobile number is required' };
//   }
  
//   const mobileRegex = /^[6-9]\d{9}$/;
  
//   if (!mobileRegex.test(mobile)) {
//     return { valid: false, error: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9' };
//   }
  
//   return { valid: true };
// };

// // Validate bank account number
// export const validateBankAccount = (accountNumber) => {
//   if (!accountNumber) {
//     return { valid: false, error: 'Account number is required' };
//   }
  
//   // Basic validation - account numbers can vary by bank
//   if (!/^\d+$/.test(accountNumber)) {
//     return { valid: false, error: 'Account number must contain only digits' };
//   }
  
//   if (accountNumber.length < 9 || accountNumber.length > 18) {
//     return { valid: false, error: 'Account number must be 9-18 digits' };
//   }
  
//   return { valid: true };
// };

// // Validate IFSC code
// export const validateIFSC = (ifscCode) => {
//   if (!ifscCode) {
//     return { valid: false, error: 'IFSC code is required' };
//   }
  
//   const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
//   if (!ifscRegex.test(ifscCode)) {
//     return { valid: false, error: 'Invalid IFSC code format. Example: SBIN0001234' };
//   }
  
//   return { valid: true };
// };

// // Validate cheque number
// export const validateChequeNumber = (chequeNumber) => {
//   if (!chequeNumber) {
//     return { valid: false, error: 'Cheque number is required' };
//   }
  
//   if (!/^\d+$/.test(chequeNumber)) {
//     return { valid: false, error: 'Cheque number must contain only digits' };
//   }
  
//   if (chequeNumber.length < 6) {
//     return { valid: false, error: 'Cheque number must be at least 6 digits' };
//   }
  
//   return { valid: true };
// };

// // Validate payment amount
// export const validatePaymentAmount = (amount, minAmount = 1, maxAmount = 1000000) => {
//   if (!amount && amount !== 0) {
//     return { valid: false, error: 'Amount is required' };
//   }
  
//   const numAmount = parseFloat(amount);
  
//   if (isNaN(numAmount) || numAmount <= 0) {
//     return { valid: false, error: 'Amount must be a positive number' };
//   }
  
//   if (numAmount < minAmount) {
//     return { valid: false, error: `Minimum payment amount is ${minAmount}` };
//   }
  
//   if (numAmount > maxAmount) {
//     return { valid: false, error: `Maximum payment amount is ${maxAmount}` };
//   }
  
//   return { valid: true };
// };

// // Validate payment reference number based on mode
// export const validatePaymentReference = (reference, mode) => {
//   if (!reference && mode !== 'cash') {
//     return { valid: false, error: 'Reference number is required' };
//   }
  
//   switch (mode) {
//     case 'cheque':
//       return validateChequeNumber(reference);
      
//     case 'bank_transfer':
//       if (reference.length < 10) {
//         return { valid: false, error: 'Transaction reference must be at least 10 characters' };
//       }
//       break;
      
//     case 'online':
//       if (reference.length < 8) {
//         return { valid: false, error: 'Transaction ID must be at least 8 characters' };
//       }
//       break;
      
//     default:
//       // No validation for other modes
//       break;
//   }
  
//   return { valid: true };
// };

// // Validate student ID format
// export const validateStudentId = (studentId) => {
//   if (!studentId) {
//     return { valid: false, error: 'Student ID is required' };
//   }
  
//   // Example format: STU2024001
//   const studentIdRegex = /^STU\d{7}$/;
  
//   if (!studentIdRegex.test(studentId)) {
//     return { valid: false, error: 'Invalid student ID format (e.g., STU2024001)' };
//   }
  
//   return { valid: true };
// };

// // Validate receipt number format
// export const validateReceiptNumber = (receiptNumber) => {
//   if (!receiptNumber) {
//     return { valid: false, error: 'Receipt number is required' };
//   }
  
//   // Example format: RC20240115001
//   const receiptRegex = /^RC\d{11}$/;
  
//   if (!receiptRegex.test(receiptNumber)) {
//     return { valid: false, error: 'Invalid receipt number format (e.g., RC20240115001)' };
//   }
  
//   return { valid: true };
// };

// // Validate payment mode
// export const validatePaymentMode = (mode) => {
//   if (!mode) {
//     return { valid: false, error: 'Payment mode is required' };
//   }
  
//   const validModes = ['cash', 'cheque', 'bank_transfer', 'online', 'card', 'upi'];
  
//   if (!validModes.includes(mode)) {
//     return { valid: false, error: `Invalid payment mode. Valid modes: ${validModes.join(', ')}` };
//   }
  
//   return { valid: true };
// };

// // Validate payment date (not in future)
// export const validatePaymentDate = (dateString) => {
//   if (!dateString) {
//     return { valid: false, error: 'Payment date is required' };
//   }
  
//   const paymentDate = new Date(dateString);
//   const today = new Date();
  
//   if (isNaN(paymentDate.getTime())) {
//     return { valid: false, error: 'Invalid date format' };
//   }
  
//   if (paymentDate > today) {
//     return { valid: false, error: 'Payment date cannot be in the future' };
//   }
  
//   if (paymentDate < new Date('2000-01-01')) {
//     return { valid: false, error: 'Payment date is too far in the past' };
//   }
  
//   return { valid: true };
// };

// // Validate discount percentage
// export const validateDiscount = (discount, maxDiscount = 100) => {
//   if (!discount && discount !== 0) {
//     return { valid: false, error: 'Discount is required' };
//   }
  
//   const numDiscount = parseFloat(discount);
  
//   if (isNaN(numDiscount)) {
//     return { valid: false, error: 'Discount must be a number' };
//   }
  
//   if (numDiscount < 0) {
//     return { valid: false, error: 'Discount cannot be negative' };
//   }
  
//   if (numDiscount > maxDiscount) {
//     return { valid: false, error: `Discount cannot exceed ${maxDiscount}%` };
//   }
  
//   return { valid: true };
// };

// // Validate installment configuration
// export const validateInstallment = (totalAmount, installmentCount, installmentAmount) => {
//   if (!installmentCount) {
//     return { valid: false, error: 'Installment count is required' };
//   }
  
//   if (installmentCount < 1 || installmentCount > 12) {
//     return { valid: false, error: 'Installment count must be between 1 and 12' };
//   }
  
//   if (installmentAmount * installmentCount < totalAmount) {
//     return { valid: false, error: 'Total installment amount is less than total fee' };
//   }
  
//   return { valid: true };
// };

// // Validate email
// export const validateEmail = (email) => {
//   if (!email) {
//     return { valid: false, error: 'Email is required' };
//   }
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
//   if (!emailRegex.test(email)) {
//     return { valid: false, error: 'Invalid email format' };
//   }
  
//   return { valid: true };
// };

// // Validate name (for cardholder, etc.)
// export const validateName = (name) => {
//   if (!name) {
//     return { valid: false, error: 'Name is required' };
//   }
  
//   if (name.length < 2) {
//     return { valid: false, error: 'Name must be at least 2 characters' };
//   }
  
//   if (name.length > 100) {
//     return { valid: false, error: 'Name must be less than 100 characters' };
//   }
  
//   return { valid: true };
// };

// // Validate address
// export const validateAddress = (address) => {
//   if (!address) {
//     return { valid: false, error: 'Address is required' };
//   }
  
//   if (address.length < 5) {
//     return { valid: false, error: 'Address must be at least 5 characters' };
//   }
  
//   return { valid: true };
// };

// // Validate pincode (Indian)
// export const validatePincode = (pincode) => {
//   if (!pincode) {
//     return { valid: false, error: 'Pincode is required' };
//   }
  
//   const pincodeRegex = /^\d{6}$/;
  
//   if (!pincodeRegex.test(pincode)) {
//     return { valid: false, error: 'Invalid pincode. Must be 6 digits' };
//   }
  
//   return { valid: true };
// };

// // Comprehensive payment validation
// export const validatePayment = (paymentData) => {
//   const errors = [];
  
//   // Validate amount
//   const amountValidation = validatePaymentAmount(paymentData.amount);
//   if (!amountValidation.valid) errors.push(amountValidation.error);
  
//   // Validate payment mode
//   const modeValidation = validatePaymentMode(paymentData.paymentMode);
//   if (!modeValidation.valid) errors.push(modeValidation.error);
  
//   // Validate payment date if provided
//   if (paymentData.paymentDate) {
//     const dateValidation = validatePaymentDate(paymentData.paymentDate);
//     if (!dateValidation.valid) errors.push(dateValidation.error);
//   }
  
//   // Validate reference number for non-cash payments
//   if (paymentData.paymentMode !== 'cash' && paymentData.referenceNumber) {
//     const refValidation = validatePaymentReference(paymentData.referenceNumber, paymentData.paymentMode);
//     if (!refValidation.valid) errors.push(refValidation.error);
//   }
  
//   // Validate student ID
//   if (paymentData.studentId) {
//     const studentValidation = validateStudentId(paymentData.studentId);
//     if (!studentValidation.valid) errors.push(studentValidation.error);
//   }
  
//   return {
//     valid: errors.length === 0,
//     errors: errors
//   };
// };

// // Validate payment form (for PaymentGatewayUI)
// export const validatePaymentForm = (formData, paymentMethod) => {
//   const errors = {};
  
//   switch (paymentMethod) {
//     case 'card':
//       const cardValidation = validateCreditCard(formData.cardNumber);
//       if (!cardValidation.valid) errors.cardNumber = cardValidation.error;
      
//       if (!formData.cardName) errors.cardName = 'Cardholder name is required';
      
//       const cvvValidation = validateCVV(formData.cvv, cardValidation.cardType);
//       if (!cvvValidation.valid) errors.cvv = cvvValidation.error;
      
//       const expiryValidation = validateExpiryDate(formData.expiryMonth, formData.expiryYear);
//       if (!expiryValidation.valid) errors.expiry = expiryValidation.error;
//       break;
      
//     case 'upi':
//       const upiValidation = validateUPI(formData.upiId);
//       if (!upiValidation.valid) errors.upiId = upiValidation.error;
//       break;
      
//     case 'netbanking':
//       if (!formData.bankName) errors.bankName = 'Please select a bank';
//       break;
      
//     case 'wallet':
//       if (!formData.walletType) errors.walletType = 'Please select a wallet';
//       break;
//   }
  
//   return {
//     valid: Object.keys(errors).length === 0,
//     errors
//   };
// };

// // Export all validators as default object for easy import
// export default {
//   validateCreditCard,
//   validateCVV,
//   validateExpiryDate,
//   validateUPI,
//   validateIndianMobile,
//   validateBankAccount,
//   validateIFSC,
//   validateChequeNumber,
//   validatePaymentAmount,
//   validatePaymentReference,
//   validateStudentId,
//   validateReceiptNumber,
//   validatePaymentMode,
//   validatePaymentDate,
//   validateDiscount,
//   validateInstallment,
//   validateEmail,
//   validateName,
//   validateAddress,
//   validatePincode,
//   validatePayment,
//   validatePaymentForm,
// };