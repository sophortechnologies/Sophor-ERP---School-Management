// import React, { useState } from 'react';
// import { InvoiceGenerator } from '../components';
// import './InvoicePage.css';

// const InvoicePage = () => {
//   const [selectedStudentId, setSelectedStudentId] = useState(null);

//   return (
//     <div className="fee-accounting-invoicepage-invoice-page">
//       <div className="fee-accounting-invoicepage-page-header">
//         <h1>Invoice Management</h1>
//         <div className="fee-accounting-invoicepage-header-actions">
//           <button className="fee-accounting-invoicepage-action-btn fee-accounting-invoicepage-bulk-invoice-btn">
//             Bulk Invoice Generation
//           </button>
//           <button className="fee-accounting-invoicepage-action-btn fee-accounting-invoicepage-template-btn">
//             Manage Templates
//           </button>
//         </div>
//       </div>

//       <div className="fee-accounting-invoicepage-page-tabs">
//         <button className="fee-accounting-invoicepage-tab-btn active">
//           Create Invoice
//         </button>
//         <button className="fee-accounting-invoicepage-tab-btn">
//           View Invoices
//         </button>
//         <button className="fee-accounting-invoicepage-tab-btn">
//           Templates
//         </button>
//       </div>

//       <div className="fee-accounting-invoicepage-page-content">
//         <div className="fee-accounting-invoicepage-invoice-wizard">
//           <div className="fee-accounting-invoicepage-wizard-steps">
//             <div className="fee-accounting-invoicepage-step active">
//               <div className="fee-accounting-invoicepage-step-number">1</div>
//               <div className="fee-accounting-invoicepage-step-label">Select Student</div>
//             </div>
//             <div className="fee-accounting-invoicepage-step">
//               <div className="fee-accounting-invoicepage-step-number">2</div>
//               <div className="fee-accounting-invoicepage-step-label">Configure Invoice</div>
//             </div>
//             <div className="fee-accounting-invoicepage-step">
//               <div className="fee-accounting-invoicepage-step-number">3</div>
//               <div className="fee-accounting-invoicepage-step-label">Review & Generate</div>
//             </div>
//           </div>

//           <div className="fee-accounting-invoicepage-wizard-content">
//             {!selectedStudentId ? (
//               <div className="fee-accounting-invoicepage-student-selection">
//                 <h3>Select Student for Invoice</h3>
//                 <div className="fee-accounting-invoicepage-search-box">
//                   <input 
//                     type="text" 
//                     placeholder="Search students by name, ID, or class..."
//                     className="fee-accounting-invoicepage-search-input"
//                   />
//                   <button className="fee-accounting-invoicepage-search-btn">Search</button>
//                 </div>
//                 <div className="fee-accounting-invoicepage-student-list">
//                   <div className="fee-accounting-invoicepage-student-card" onClick={() => setSelectedStudentId('STU2024001')}>
//                     <div className="fee-accounting-invoicepage-student-info">
//                       <strong>John Doe</strong>
//                       <span>Class 10A | ID: STU2024001</span>
//                     </div>
//                     <div className="fee-accounting-invoicepage-student-stats">
//                       <span>Outstanding: ₹15,000</span>
//                       <span>Last Payment: 15 days ago</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="fee-accounting-invoicepage-invoice-creation">
//                 <div className="fee-accounting-invoicepage-invoice-header">
//                   <h3>Create Invoice for Student</h3>
//                   <button 
//                     className="fee-accounting-invoicepage-back-btn"
//                     onClick={() => setSelectedStudentId(null)}
//                   >
//                     Change Student
//                   </button>
//                 </div>
//                 <InvoiceGenerator studentId={selectedStudentId} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoicePage;