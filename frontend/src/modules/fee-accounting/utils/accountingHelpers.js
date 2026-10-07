export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateTotal = (items, key = 'amount') => {
  return items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
};

export const calculateOutstanding = (bills) => {
  return bills.reduce((total, bill) => {
    const paid = parseFloat(bill.paid_amount) || 0;
    const due = parseFloat(bill.total_amount) || 0;
    return total + (due - paid);
  }, 0);
};

export const getPaymentStatus = (paidAmount, totalAmount, dueDate) => {
  const paid = parseFloat(paidAmount) || 0;
  const total = parseFloat(totalAmount) || 0;
  const today = new Date();
  const due = new Date(dueDate);

  if (paid >= total) return 'paid';
  if (paid > 0 && paid < total) return 'partial';
  if (today > due) return 'overdue';
  return 'pending';
};

export const generateReceiptNumber = () => {
  const prefix = 'RCPT';
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}${random}`;
};