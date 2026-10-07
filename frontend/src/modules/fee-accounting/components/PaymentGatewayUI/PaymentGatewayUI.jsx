import React, { useState } from 'react';
import { validateCreditCard, validateCVV, validateExpiryDate } from '../../utils/paymentValidators';
import './PaymentGatewayUI.css';

const PaymentGatewayUI = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: '',
    bankName: '',
    accountNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'card') {
      const cardValidation = validateCreditCard(formData.cardNumber);
      if (!cardValidation.valid) {
        newErrors.cardNumber = cardValidation.error;
      }
      
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      
      const cvvValidation = validateCVV(formData.cvv, cardValidation.cardType);
      if (!cvvValidation.valid) {
        newErrors.cvv = cvvValidation.error;
      }
      
      const expiryValidation = validateExpiryDate(formData.expiryMonth, formData.expiryYear);
      if (!expiryValidation.valid) {
        newErrors.expiry = expiryValidation.error;
      }
    }
    
    if (paymentMethod === 'upi' && !formData.upiId) {
      newErrors.upiId = 'UPI ID is required';
    }
    
    if (paymentMethod === 'netbanking' && !formData.bankName) {
      newErrors.bankName = 'Please select a bank';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentResult = {
        method: paymentMethod,
        transactionId: `TXN${Date.now()}`,
        amount: amount,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      
      onPaymentSuccess?.(paymentResult);
    } catch (error) {
      onPaymentError?.(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-gateway-ui">
      <div className="payment-header">
        <h3>Complete Payment</h3>
        <div className="payment-amount">
          Amount to Pay: <strong>₹{amount.toLocaleString()}</strong>
        </div>
      </div>

      <div className="payment-methods">
        <div className="method-tabs">
          <button 
            className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <span className="tab-icon">💳</span>
            Credit/Debit Card
          </button>
          <button 
            className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('upi')}
          >
            <span className="tab-icon">📱</span>
            UPI
          </button>
          <button 
            className={`method-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('netbanking')}
          >
            <span className="tab-icon">🏦</span>
            Net Banking
          </button>
          <button 
            className={`method-tab ${paymentMethod === 'wallet' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('wallet')}
          >
            <span className="tab-icon">💰</span>
            Wallet
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {paymentMethod === 'card' && (
            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className={errors.cardNumber ? 'error' : ''}
                />
                {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={errors.cardName ? 'error' : ''}
                />
                {errors.cardName && <div className="error-message">{errors.cardName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <div className="expiry-inputs">
                    <select
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className={errors.expiry ? 'error' : ''}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      className={errors.expiry ? 'error' : ''}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  {errors.expiry && <div className="error-message">{errors.expiry}</div>}
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={errors.cvv ? 'error' : ''}
                  />
                  {errors.cvv && <div className="error-message">{errors.cvv}</div>}
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="upi-form">
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="username@bank"
                  className={errors.upiId ? 'error' : ''}
                />
                {errors.upiId && <div className="error-message">{errors.upiId}</div>}
              </div>
              <div className="upi-qr">
                <div className="qr-placeholder">
                  <div className="qr-code">📱</div>
                  <p>Scan QR code to pay</p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="netbanking-form">
              <div className="form-group">
                <label>Select Bank</label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={errors.bankName ? 'error' : ''}
                >
                  <option value="">Select your bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
                {errors.bankName && <div className="error-message">{errors.bankName}</div>}
              </div>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="wallet-form">
              <div className="wallet-options">
                <label className="wallet-option">
                  <input type="radio" name="wallet" value="paytm" />
                  <div className="wallet-icon">💛</div>
                  <span>Paytm</span>
                </label>
                <label className="wallet-option">
                  <input type="radio" name="wallet" value="phonepe" />
                  <div className="wallet-icon">📱</div>
                  <span>PhonePe</span>
                </label>
                <label className="wallet-option">
                  <input type="radio" name="wallet" value="googlepay" />
                  <div className="wallet-icon">G</div>
                  <span>Google Pay</span>
                </label>
              </div>
            </div>
          )}

          <div className="terms-agreement">
            <label className="terms-checkbox">
              <input type="checkbox" required />
              <span>
                I agree to the <a href="/terms">Terms of Service</a> and 
                authorize this transaction
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="pay-now-btn"
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `Pay ₹${amount.toLocaleString()}`
            )}
          </button>

          <div className="security-notice">
            <div className="security-icon">🔒</div>
            <p>
              Your payment is secure and encrypted. We never store your 
              card details on our servers.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentGatewayUI;