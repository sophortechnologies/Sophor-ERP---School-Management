import React, { useState, useEffect } from 'react';
import { useLedger } from '../../hooks';
import { formatCurrency } from '../../utils/feeCalculators';
import './LedgerViewer.css';

const LedgerViewer = ({ type = 'general' }) => {
  const { 
    getLedgerEntries, 
    getTrialBalance, 
    getBalanceSheet, 
    getIncomeStatement,
    getCashBook,
    loading 
  } = useLedger();
  
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [type, dateRange]);

  const loadData = async () => {
    try {
      let result;
      
      switch (type) {
        case 'general':
          result = await getLedgerEntries(dateRange);
          break;
        case 'trial':
          result = await getTrialBalance(dateRange.endDate);
          break;
        case 'balance':
          result = await getBalanceSheet(dateRange.endDate);
          break;
        case 'income':
          result = await getIncomeStatement(dateRange.startDate, dateRange.endDate);
          break;
        case 'cash':
          result = await getCashBook(dateRange.startDate, dateRange.endDate);
          break;
        default:
          result = await getLedgerEntries(dateRange);
      }
      
      setData(result);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
      setData(null);
    }
  };

  const renderGeneralLedger = () => {
    if (!data || !data.entries) return null;
    
    return (
      <div className="general-ledger">
        <div className="ledger-summary">
          <div className="summary-card">
            <span className="summary-label">Total Debits</span>
            <span className="summary-value">{formatCurrency(data.totalDebits || 0)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Credits</span>
            <span className="summary-value">{formatCurrency(data.totalCredits || 0)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Balance</span>
            <span className="summary-value">{formatCurrency((data.totalDebits || 0) - (data.totalCredits || 0))}</span>
          </div>
        </div>
        
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Voucher No</th>
              <th>Account</th>
              <th>Narration</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.voucherNumber}</td>
                <td>
                  <div className="account-info">
                    <div className="account-code">{entry.accountCode}</div>
                    <div className="account-name">{entry.accountName}</div>
                  </div>
                </td>
                <td>{entry.narration}</td>
                <td className="debit">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                <td className="credit">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                <td className="balance">{formatCurrency(entry.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTrialBalance = () => {
    if (!data || !data.accounts) return null;
    
    return (
      <div className="trial-balance">
        <div className="balance-summary">
          <div className="summary-section">
            <h4>Debit Total</h4>
            <div className="summary-amount">{formatCurrency(data.debitTotal || 0)}</div>
          </div>
          <div className="summary-section">
            <h4>Credit Total</h4>
            <div className="summary-amount">{formatCurrency(data.creditTotal || 0)}</div>
          </div>
        </div>
        
        <table className="trial-table">
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Debit Balance</th>
              <th>Credit Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((account, index) => (
              <tr key={index}>
                <td>{account.code}</td>
                <td>{account.name}</td>
                <td className="debit">
                  {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                </td>
                <td className="credit">
                  {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!data) return null;
    
    return (
      <div className="balance-sheet">
        <div className="sheet-header">
          <h3>Balance Sheet</h3>
          <div className="as-of-date">
            As of {new Date(dateRange.endDate).toLocaleDateString()}
          </div>
        </div>
        
        <div className="sheet-content">
          <div className="assets-section">
            <h4>Assets</h4>
            <div className="section-content">
              {data.assets?.map((asset, index) => (
                <div key={index} className="account-item">
                  <span className="account-name">{asset.name}</span>
                  <span className="account-amount">{formatCurrency(asset.amount)}</span>
                </div>
              ))}
              <div className="section-total">
                <strong>Total Assets</strong>
                <strong>{formatCurrency(data.totalAssets || 0)}</strong>
              </div>
            </div>
          </div>
          
          <div className="liabilities-section">
            <h4>Liabilities & Equity</h4>
            <div className="section-content">
              {data.liabilities?.map((liability, index) => (
                <div key={index} className="account-item">
                  <span className="account-name">{liability.name}</span>
                  <span className="account-amount">{formatCurrency(liability.amount)}</span>
                </div>
              ))}
              {data.equity?.map((equity, index) => (
                <div key={index} className="account-item">
                  <span className="account-name">{equity.name}</span>
                  <span className="account-amount">{formatCurrency(equity.amount)}</span>
                </div>
              ))}
              <div className="section-total">
                <strong>Total Liabilities & Equity</strong>
                <strong>{formatCurrency(data.totalLiabilitiesEquity || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIncomeStatement = () => {
    if (!data) return null;
    
    return (
      <div className="income-statement">
        <div className="statement-header">
          <h3>Income Statement</h3>
          <div className="period">
            Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
          </div>
        </div>
        
        <div className="statement-content">
          <div className="income-section">
            <h4>Income</h4>
            <div className="section-content">
              {data.income?.map((item, index) => (
                <div key={index} className="account-item">
                  <span className="account-name">{item.name}</span>
                  <span className="account-amount">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="section-total">
                <strong>Total Income</strong>
                <strong>{formatCurrency(data.totalIncome || 0)}</strong>
              </div>
            </div>
          </div>
          
          <div className="expenses-section">
            <h4>Expenses</h4>
            <div className="section-content">
              {data.expenses?.map((expense, index) => (
                <div key={index} className="account-item">
                  <span className="account-name">{expense.name}</span>
                  <span className="account-amount">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
              <div className="section-total">
                <strong>Total Expenses</strong>
                <strong>{formatCurrency(data.totalExpenses || 0)}</strong>
              </div>
            </div>
          </div>
          
          <div className="net-income-section">
            <div className="account-item net-income">
              <strong>Net Income</strong>
              <strong className={data.netIncome >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(data.netIncome || 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ledger-viewer">
      <div className="viewer-header">
        <div className="date-range-selector">
          <div className="date-input-group">
            <label>From</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="date-input-group">
            <label>To</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <button 
            className="refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="export-options">
          <button className="export-btn">Export Excel</button>
          <button className="export-btn">Print</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading ledger data...</p>
        </div>
      ) : data ? (
        <div className="viewer-content">
          {type === 'general' && renderGeneralLedger()}
          {type === 'trial' && renderTrialBalance()}
          {type === 'balance' && renderBalanceSheet()}
          {type === 'income' && renderIncomeStatement()}
          {type === 'cash' && (
            <div className="cash-flow">
              <h3>Cash Flow Statement</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>No Data Available</h3>
          <p>No ledger data found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default LedgerViewer;