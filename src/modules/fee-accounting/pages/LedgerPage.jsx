// import React, { useState } from 'react';
// import { LedgerViewer } from '../components';
// import './LedgerPage.css';

// const LedgerPage = () => {
//   const [activeTab, setActiveTab] = useState('general');

//   return (
//     <div className="fee-accounting-ledgerpage-ledger-page">
//       <div className="fee-accounting-ledgerpage-page-header">
//         <h1>Accounting Ledger</h1>
//         <div className="fee-accounting-ledgerpage-page-subtitle">
//           Double-entry bookkeeping and financial statements
//         </div>
//       </div>

//       <div className="fee-accounting-ledgerpage-ledger-tabs">
//         <button 
//           className={`fee-accounting-ledgerpage-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
//           onClick={() => setActiveTab('general')}
//         >
//           General Ledger
//         </button>
//         <button 
//           className={`fee-accounting-ledgerpage-tab-btn ${activeTab === 'trial' ? 'active' : ''}`}
//           onClick={() => setActiveTab('trial')}
//         >
//           Trial Balance
//         </button>
//         <button 
//           className={`fee-accounting-ledgerpage-tab-btn ${activeTab === 'balance' ? 'active' : ''}`}
//           onClick={() => setActiveTab('balance')}
//         >
//           Balance Sheet
//         </button>
//         <button 
//           className={`fee-accounting-ledgerpage-tab-btn ${activeTab === 'income' ? 'active' : ''}`}
//           onClick={() => setActiveTab('income')}
//         >
//           Income Statement
//         </button>
//         <button 
//           className={`fee-accounting-ledgerpage-tab-btn ${activeTab === 'cash' ? 'active' : ''}`}
//           onClick={() => setActiveTab('cash')}
//         >
//           Cash Flow
//         </button>
//       </div>

//       <div className="fee-accounting-ledgerpage-ledger-content">
//         <div className="fee-accounting-ledgerpage-ledger-sidebar">
//           <div className="fee-accounting-ledgerpage-sidebar-section">
//             <h3>Date Range</h3>
//             <div className="fee-accounting-ledgerpage-date-inputs">
//               <div className="fee-accounting-ledgerpage-input-group">
//                 <label>From</label>
//                 <input type="date" className="fee-accounting-ledgerpage-date-input" />
//               </div>
//               <div className="fee-accounting-ledgerpage-input-group">
//                 <label>To</label>
//                 <input type="date" className="fee-accounting-ledgerpage-date-input" />
//               </div>
//             </div>
//           </div>

//           <div className="fee-accounting-ledgerpage-sidebar-section">
//             <h3>Account Filters</h3>
//             <div className="fee-accounting-ledgerpage-account-filters">
//               <label className="fee-accounting-ledgerpage-filter-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 Assets
//               </label>
//               <label className="fee-accounting-ledgerpage-filter-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 Liabilities
//               </label>
//               <label className="fee-accounting-ledgerpage-filter-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 Equity
//               </label>
//               <label className="fee-accounting-ledgerpage-filter-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 Income
//               </label>
//               <label className="fee-accounting-ledgerpage-filter-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 Expenses
//               </label>
//             </div>
//           </div>

//           <div className="fee-accounting-ledgerpage-sidebar-section">
//             <h3>Quick Reports</h3>
//             <button className="fee-accounting-ledgerpage-report-btn">Daily Summary</button>
//             <button className="fee-accounting-ledgerpage-report-btn">Monthly Report</button>
//             <button className="fee-accounting-ledgerpage-report-btn">Annual Report</button>
//             <button className="fee-accounting-ledgerpage-report-btn">Export All</button>
//           </div>
//         </div>

//         <div className="fee-accounting-ledgerpage-ledger-main">
//           <LedgerViewer type={activeTab} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LedgerPage;