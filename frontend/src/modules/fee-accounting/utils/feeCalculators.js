export const calculateLateFee = (dueDate, amount, lateFeeRate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const daysLate = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
  
  if (daysLate <= 0) return 0;
  
  const dailyRate = parseFloat(lateFeeRate) || 0;
  return amount * (dailyRate / 100) * daysLate;
};

export const calculateInstallments = (totalAmount, numberOfInstallments) => {
  const installmentAmount = totalAmount / numberOfInstallments;
  const installments = [];
  
  for (let i = 0; i < numberOfInstallments; i++) {
    installments.push({
      installment_number: i + 1,
      amount: Math.round(installmentAmount * 100) / 100,
      due_date: null, // Should be calculated based on frequency
      status: 'pending'
    });
  }
  
  // Adjust last installment for rounding differences
  const totalCalculated = installments.reduce((sum, inst) => sum + inst.amount, 0);
  if (totalCalculated !== totalAmount) {
    installments[installments.length - 1].amount += (totalAmount - totalCalculated);
  }
  
  return installments;
};

export const calculateDiscount = (amount, discountType, discountValue) => {
  if (!discountValue || discountValue <= 0) return 0;
  
  if (discountType === 'percentage') {
    return (amount * discountValue) / 100;
  } else if (discountType === 'fixed') {
    return Math.min(discountValue, amount);
  }
  
  return 0;
};

export const calculateNetAmount = (amount, discount = 0, tax = 0) => {
  const discountAmount = parseFloat(discount) || 0;
  const taxAmount = parseFloat(tax) || 0;
  const baseAmount = parseFloat(amount) || 0;
  
  const amountAfterDiscount = baseAmount - discountAmount;
  const taxOnAmount = (amountAfterDiscount * taxAmount) / 100;
  
  return amountAfterDiscount + taxOnAmount;
};