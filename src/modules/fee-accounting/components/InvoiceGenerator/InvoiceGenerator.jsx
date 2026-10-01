// import React, { useState, useEffect } from 'react';
// import { useFee, useBilling } from '../../hooks';
// import { formatCurrency, calculateTax } from '../../utils/feeCalculators';
// import './InvoiceGenerator.css';

// const InvoiceGenerator = ({ studentId, onInvoiceGenerated }) => {
//   const { getBillSummary } = useFee();
//   const { createBill } = useBilling();
  
//   const [studentInfo, setStudentInfo] = useState(null);
//   const [availableFees, setAvailableFees] = useState([]);
//   const [selectedFees, setSelectedFees] = useState([]);
//   const [invoiceData, setInvoiceData] = useState({
//     invoiceNumber: `INV-${Date.now()}`,
//     issueDate: new Date().toISOString().split('T')[0],
//     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     notes: '',
//     discountType: 'none',
//     discountValue: 0,
//     taxIncluded: true,
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (studentId) {
//       loadStudentData();
//     }
//   }, [studentId]);

//   const loadStudentData = async () => {
//     try {
//       const summary = await getBillSummary(studentId);
//       setStudentInfo(summary.student);
//       setAvailableFees(summary.availableFees || []);
//     } catch (error) {
//       console.error('Failed to load student data:', error);
//     }
//   };

//   const handleFeeSelection = (feeId, isSelected) => {
//     const fee = availableFees.find(f => f.id === feeId);
//     if (!fee) return;

//     if (isSelected) {
//       setSelectedFees(prev => [...prev, { ...fee, quantity: 1 }]);
//     } else {
//       setSelectedFees(prev => prev.filter(f => f.id !== feeId));
//     }
//   };

//   const updateFeeQuantity = (feeId, quantity) => {
//     setSelectedFees(prev => 
//       prev.map(fee => 
//         fee.id === feeId ? { ...fee, quantity: Math.max(1, quantity) } : fee
//       )
//     );
//   };

//   const calculateSubtotal = () => {
//     return selectedFees.reduce((total, fee) => total + (fee.amount * fee.quantity), 0);
//   };

//   const calculateDiscount = () => {
//     const subtotal = calculateSubtotal();
//     if (invoiceData.discountType === 'percentage') {
//       return (subtotal * invoiceData.discountValue) / 100;
//     } else if (invoiceData.discountType === 'fixed') {
//       return invoiceData.discountValue;
//     }
//     return 0;
//   };

//   const calculateTaxAmount = () => {
//     const subtotal = calculateSubtotal();
//     const discount = calculateDiscount();
//     const taxableAmount = subtotal - discount;
    
//     if (invoiceData.taxIncluded) {
//       const taxInfo = calculateTax(taxableAmount);
//       return taxInfo.taxAmount;
//     }
//     return 0;
//   };

//   const calculateTotal = () => {
//     const subtotal = calculateSubtotal();
//     const discount = calculateDiscount();
//     const taxAmount = calculateTaxAmount();
    
//     return subtotal - discount + taxAmount;
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (selectedFees.length === 0) {
//       newErrors.fees = 'Please select at least one fee item';
//     }
    
//     if (!invoiceData.dueDate) {
//       newErrors.dueDate = 'Due date is required';
//     }
    
//     if (invoiceData.discountType !== 'none' && !invoiceData.discountValue) {
//       newErrors.discountValue = 'Discount value is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const generateInvoice = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const invoicePayload = {
//         studentId,
//         invoiceNumber: invoiceData.invoiceNumber,
//         issueDate: invoiceData.issueDate,
//         dueDate: invoiceData.dueDate,
//         items: selectedFees.map(fee => ({
//           feeId: fee.id,
//           description: fee.name,
//           quantity: fee.quantity,
//           unitPrice: fee.amount,
//           total: fee.amount * fee.quantity,
//         })),
//         subtotal: calculateSubtotal(),
//         discount: calculateDiscount(),
//         tax: calculateTaxAmount(),
//         total: calculateTotal(),
//         notes: invoiceData.notes,
//         discountType: invoiceData.discountType,
//         discountValue: invoiceData.discountValue,
//         taxIncluded: invoiceData.taxIncluded,
//       };

//       const result = await createBill(invoicePayload);
      
//       if (onInvoiceGenerated) {
//         onInvoiceGenerated(result);
//       }

//       // Reset form
//       setSelectedFees([]);
//       setInvoiceData({
//         invoiceNumber: `INV-${Date.now()}`,
//         issueDate: new Date().toISOString().split('T')[0],
//         dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         notes: '',
//         discountType: 'none',
//         discountValue: 0,
//         taxIncluded: true,
//       });

//     } catch (error) {
//       console.error('Failed to generate invoice:', error);
//       setErrors({ submit: error.message || 'Failed to generate invoice' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!studentId) {
//     return <div className="fee-accounting-invoicegenerator-invoicegenerator-no-student">Please select a student to generate invoice</div>;
//   }

//   return (
//     <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-generator-container">
//       <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-header">
//         <h2>Generate Invoice</h2>
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-meta">
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-number">
//             Invoice #: <strong>{invoiceData.invoiceNumber}</strong>
//           </div>
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-dates">
//             <div>Issue Date: {invoiceData.issueDate}</div>
//             <div>Due Date: {invoiceData.dueDate}</div>
//           </div>
//         </div>
//       </div>

//       {studentInfo && (
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-student-info-section">
//           <h3>Bill To</h3>
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-student-details">
//             <div><strong>{studentInfo.fullName}</strong></div>
//             <div>{studentInfo.className} - {studentInfo.sectionName}</div>
//             <div>Student ID: {studentInfo.studentId}</div>
//             {studentInfo.parentName && <div>Parent: {studentInfo.parentName}</div>}
//             {studentInfo.contactNumber && <div>Contact: {studentInfo.contactNumber}</div>}
//           </div>
//         </div>
//       )}

//       <div className="fee-accounting-invoicegenerator-invoicegenerator-fees-selection-section">
//         <h3>Select Fees</h3>
//         {errors.fees && <div className="fee-accounting-invoicegenerator-invoicegenerator-error-message">{errors.fees}</div>}
        
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-available-fees">
//           {availableFees.map(fee => (
//             <div key={fee.id} className="fee-accounting-invoicegenerator-invoicegenerator-fee-item">
//               <label className="fee-accounting-invoicegenerator-invoicegenerator-fee-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={selectedFees.some(f => f.id === fee.id)}
//                   onChange={(e) => handleFeeSelection(fee.id, e.target.checked)}
//                 />
//                 <div className="fee-accounting-invoicegenerator-invoicegenerator-fee-details">
//                   <div className="fee-accounting-invoicegenerator-invoicegenerator-fee-name">{fee.name}</div>
//                   <div className="fee-accounting-invoicegenerator-invoicegenerator-fee-description">{fee.description}</div>
//                   <div className="fee-accounting-invoicegenerator-invoicegenerator-fee-amount">{formatCurrency(fee.amount)}</div>
//                 </div>
//               </label>
//             </div>
//           ))}
//         </div>
//       </div>

//       {selectedFees.length > 0 && (
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-selected-fees-section">
//           <h3>Selected Items</h3>
//           <table className="fee-accounting-invoicegenerator-invoicegenerator-selected-fees-table">
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th>Quantity</th>
//                 <th>Unit Price</th>
//                 <th>Total</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedFees.map(fee => (
//                 <tr key={fee.id}>
//                   <td>{fee.name}</td>
//                   <td>
//                     <input
//                       type="number"
//                       min="1"
//                       value={fee.quantity}
//                       onChange={(e) => updateFeeQuantity(fee.id, parseInt(e.target.value))}
//                       className="fee-accounting-invoicegenerator-invoicegenerator-quantity-input"
//                     />
//                   </td>
//                   <td>{formatCurrency(fee.amount)}</td>
//                   <td>{formatCurrency(fee.amount * fee.quantity)}</td>
//                   <td>
//                     <button
//                       className="fee-accounting-invoicegenerator-invoicegenerator-remove-btn"
//                       onClick={() => handleFeeSelection(fee.id, false)}
//                     >
//                       Remove
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-configuration">
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-config-section">
//           <h4>Discount</h4>
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-discount-controls">
//             <select
//               value={invoiceData.discountType}
//               onChange={(e) => setInvoiceData(prev => ({ ...prev, discountType: e.target.value }))}
//               className="fee-accounting-invoicegenerator-invoicegenerator-discount-type-select"
//             >
//               <option value="none">No Discount</option>
//               <option value="percentage">Percentage (%)</option>
//               <option value="fixed">Fixed Amount</option>
//             </select>
            
//             {invoiceData.discountType !== 'none' && (
//               <div className="fee-accounting-invoicegenerator-invoicegenerator-discount-value-input">
//                 <input
//                   type="number"
//                   min="0"
//                   value={invoiceData.discountValue}
//                   onChange={(e) => setInvoiceData(prev => ({ 
//                     ...prev, 
//                     discountValue: parseFloat(e.target.value) || 0 
//                   }))}
//                   placeholder={invoiceData.discountType === 'percentage' ? 'Percentage' : 'Amount'}
//                 />
//                 <span className="fee-accounting-invoicegenerator-invoicegenerator-discount-suffix">
//                   {invoiceData.discountType === 'percentage' ? '%' : '₹'}
//                 </span>
//               </div>
//             )}
//           </div>
//           {errors.discountValue && <div className="fee-accounting-invoicegenerator-invoicegenerator-error-message">{errors.discountValue}</div>}
//         </div>

//         <div className="fee-accounting-invoicegenerator-invoicegenerator-config-section">
//           <h4>Tax</h4>
//           <label className="fee-accounting-invoicegenerator-invoicegenerator-tax-toggle">
//             <input
//               type="checkbox"
//               checked={invoiceData.taxIncluded}
//               onChange={(e) => setInvoiceData(prev => ({ ...prev, taxIncluded: e.target.checked }))}
//             />
//             <span>Include 18% GST</span>
//           </label>
//         </div>

//         <div className="fee-accounting-invoicegenerator-invoicegenerator-config-section">
//           <h4>Dates</h4>
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-date-inputs">
//             <div>
//               <label>Issue Date</label>
//               <input
//                 type="date"
//                 value={invoiceData.issueDate}
//                 onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
//               />
//             </div>
//             <div>
//               <label>Due Date *</label>
//               <input
//                 type="date"
//                 value={invoiceData.dueDate}
//                 onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
//               />
//               {errors.dueDate && <div className="fee-accounting-invoicegenerator-invoicegenerator-error-message">{errors.dueDate}</div>}
//             </div>
//           </div>
//         </div>

//         <div className="fee-accounting-invoicegenerator-invoicegenerator-config-section">
//           <h4>Notes</h4>
//           <textarea
//             value={invoiceData.notes}
//             onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
//             placeholder="Add any notes for this invoice..."
//             rows="3"
//             className="fee-accounting-invoicegenerator-invoicegenerator-notes-textarea"
//           />
//         </div>
//       </div>

//       <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-summary">
//         <h3>Invoice Summary</h3>
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-summary-details">
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-summary-row">
//             <span>Subtotal:</span>
//             <span>{formatCurrency(calculateSubtotal())}</span>
//           </div>
//           {calculateDiscount() > 0 && (
//             <div className="fee-accounting-invoicegenerator-invoicegenerator-summary-row fee-accounting-invoicegenerator-invoicegenerator-discount-row">
//               <span>Discount:</span>
//               <span>-{formatCurrency(calculateDiscount())}</span>
//             </div>
//           )}
//           {calculateTaxAmount() > 0 && (
//             <div className="fee-accounting-invoicegenerator-invoicegenerator-summary-row">
//               <span>Tax (18%):</span>
//               <span>{formatCurrency(calculateTaxAmount())}</span>
//             </div>
//           )}
//           <div className="fee-accounting-invoicegenerator-invoicegenerator-summary-row fee-accounting-invoicegenerator-invoicegenerator-total-row">
//             <span><strong>Total Amount:</strong></span>
//             <span><strong>{formatCurrency(calculateTotal())}</strong></span>
//           </div>
//         </div>
//       </div>

//       {errors.submit && (
//         <div className="fee-accounting-invoicegenerator-invoicegenerator-error-message fee-accounting-invoicegenerator-invoicegenerator-submit-error">{errors.submit}</div>
//       )}

//       <div className="fee-accounting-invoicegenerator-invoicegenerator-invoice-actions">
//         <button
//           className="fee-accounting-invoicegenerator-invoicegenerator-preview-btn"
//           onClick={() => window.print()}
//           disabled={selectedFees.length === 0}
//         >
//           Preview Invoice
//         </button>
//         <button
//           className="fee-accounting-invoicegenerator-invoicegenerator-generate-btn"
//           onClick={generateInvoice}
//           disabled={selectedFees.length === 0 || loading}
//         >
//           {loading ? 'Generating...' : 'Generate Invoice'}
//         </button>
//         <button
//           className="fee-accounting-invoicegenerator-invoicegenerator-reset-btn"
//           onClick={() => {
//             setSelectedFees([]);
//             setInvoiceData({
//               invoiceNumber: `INV-${Date.now()}`,
//               issueDate: new Date().toISOString().split('T')[0],
//               dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//               notes: '',
//               discountType: 'none',
//               discountValue: 0,
//               taxIncluded: true,
//             });
//           }}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InvoiceGenerator;