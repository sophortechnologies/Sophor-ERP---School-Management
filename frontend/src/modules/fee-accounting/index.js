// src/modules/fee-accounting/index.js
// Export all components
export { default as FeeCollection } from './components/FeeCollection';
export { default as FeeStructure } from './components/FeeStructure';
// export { default as InvoiceGenerator } from './components/InvoiceGenerator';
export { default as FinancialReports } from './components/FinancialReports';
export { default as OutstandingFees } from './components/OutstandingFees';
export { default as PaymentHistory } from './components/PaymentHistory';
export { default as Receipt } from './components/Receipt';
// export { default as PaymentGatewayUI } from './components/PaymentGatewayUI';
// export { default as LedgerViewer } from './components/LedgerViewer';

// Export all hooks
export { useFee } from './hooks/useFee';
export { usePayment } from './hooks/usePayment';
// export { useLedger } from './hooks/useLedger';
// export { useBilling } from './hooks/useBilling';
// export { useReports } from './hooks/useReports';

// Export all API functions
export * from './api';

// Export all utilities
export * from './utils/feeCalculators';
export * from './utils/accountingHelpers';
// export * from './utils/ledgerIntegration';
// export * from './utils/paymentValidators';
// export * from './utils/receiptGenerator';

// Export constants
export * from './constants/fee.constants';

// Export pages
export { default as FeeCollectionPage } from './pages/FeeCollectionPage';
export { default as FeeConfigurationPage } from './pages/FeeConfigurationPage';
export { default as FinancialReportsPage } from './pages/FinancialReportsPage';
export { default as PaymentHistoryPage } from './pages/PaymentHistoryPage';
// export { default as InvoicePage } from './pages/InvoicePage';
// export { default as LedgerPage } from './pages/LedgerPage';
// export { default as OutstandingFeesPage } from './pages/OutstandingFeesPage';

// Export routes
export { default as FeeAccountingRoutes } from './routes';
