import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/payment.css';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const {
    itemId,
    quantity,
    totalPrice,
    deliveryAddress,
    paymentMethod,
    cartItems
  } = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!itemId && !cartItems) {
      navigate('/');
    }
  }, [itemId, cartItems, navigate]);

  const handleUPIPayment = async (appName) => {
    try {
      setSelectedApp(appName);
      setProcessing(true);
      setError('');

      // Simulate UPI payment processing with app animation
      // In real scenario, you would integrate with Razorpay, PhonePe, or Google Pay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create order after payment success
      let response;
      if (cartItems && cartItems.length > 0) {
        // Cart checkout
        const orderPromises = cartItems.map(cartItem =>
          client.post("/orders/create", {
            itemId: cartItem.item._id,
            quantity: cartItem.qty,
            totalPrice: cartItem.item.price * cartItem.qty,
            paymentMethod: 'upi',
            deliveryAddress
          })
        );
        const responses = await Promise.all(orderPromises);
        response = { data: { _id: responses[0].data._id } };
      } else {
        // Single item checkout
        response = await client.post("/orders/create", {
          itemId,
          quantity,
          totalPrice,
          paymentMethod: 'upi',
          deliveryAddress
        });
      }

      // Show success modal
      setOrderId(response.data._id);
      setPaymentSuccess(true);
      setProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    navigate('/payment-success', {
      state: {
        orderId,
        totalPrice,
        deliveryAddress,
        paymentMethod: 'upi'
      }
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="payment-container">
      {/* Payment Processing Overlay */}
      {processing && (
        <div className="payment-processing-overlay">
          <div className="payment-processing-content">
            <div className="processing-header">
              <div className="app-animation">
                {selectedApp === 'Google Pay' && <div className="app-icon-large">📱</div>}
                {selectedApp === 'PhonePe' && <div className="app-icon-large">💳</div>}
                {selectedApp === 'BHIM' && <div className="app-icon-large">🏦</div>}
                {selectedApp === 'Paytm' && <div className="app-icon-large">📲</div>}
              </div>
              <h2>Processing Payment</h2>
              <p className="processing-app-name">via {selectedApp}</p>
            </div>

            <div className="processing-details">
              <div className="processing-item">
                <span className="detail-label">Amount</span>
                <span className="detail-value">₹{totalPrice}</span>
              </div>
              <div className="processing-divider"></div>
              <div className="processing-animation">
                <div className="spinner-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <p>Authorizing payment...</p>
                <small>Please do not close this window</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-checkmark-animation">
              <div className="checkmark-circle"></div>
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle-success" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <h2 className="success-title">Payment Successful!</h2>
            <p className="success-subtitle">Your order has been confirmed</p>

            <div className="success-details">
              <div className="detail-item">
                <span className="label">Order ID</span>
                <span className="value order-id">{orderId}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount Paid</span>
                <span className="value">₹{totalPrice}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Method</span>
                <span className="value">
                  <span className="badge-upi">UPI - {selectedApp}</span>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span className="value">
                  <span className="badge-success">✓ Paid</span>
                </span>
              </div>
            </div>

            <div className="success-address">
              <h4>Delivery Address</h4>
              <p className="address-name">{deliveryAddress?.name}</p>
              <p className="address-text">{deliveryAddress?.houseNumber}, {deliveryAddress?.area}</p>
              <p className="address-text">{deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}</p>
              <p className="address-phone">📞 {deliveryAddress?.phone}</p>
            </div>

            <button className="btn-success-close" onClick={handleSuccessClose}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="payment-card">
        <div className="payment-header">
          <h1 className="payment-title">Secure Payment</h1>
          <p className="payment-subtitle">Complete your order with UPI</p>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <div className="section-header">
            <h3>📦 Order Summary</h3>
          </div>
          <div className="items-container">
            {cartItems && cartItems.length > 0 ? (
              <>
                {cartItems.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <div className="item-info">
                      <span className="item-title">{item.item.title}</span>
                      <span className="item-qty">Qty: {item.qty}</span>
                    </div>
                    <span className="item-price">₹{item.item.price * item.qty}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="item-row">
                <div className="item-info">
                  <span className="item-title">Item</span>
                  <span className="item-qty">Qty: {quantity}</span>
                </div>
                <span className="item-price">₹{totalPrice}</span>
              </div>
            )}
          </div>
          <div className="total-row">
            <span className="total-label">Total Amount</span>
            <span className="total-value">₹{totalPrice}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="address-section">
          <div className="section-header">
            <h3>📍 Delivery Address</h3>
          </div>
          <div className="address-details">
            <p className="address-name">{deliveryAddress?.name}</p>
            <p className="address-line">{deliveryAddress?.houseNumber}, {deliveryAddress?.area}</p>
            <p className="address-line">{deliveryAddress?.city}, {deliveryAddress?.state}</p>
            <p className="address-line">Postal Code: {deliveryAddress?.pincode}</p>
            <p className="address-phone">📞 {deliveryAddress?.phone}</p>
          </div>
        </div>

        {/* UPI Payment Methods */}
        <div className="upi-methods">
          <div className="section-header">
            <h3>💳 Select UPI App</h3>
          </div>
          <div className="upi-apps-grid">
            <button 
              className="upi-app-btn" 
              onClick={() => handleUPIPayment('Google Pay')} 
              disabled={processing}
            >
              <div className="app-icon-wrapper">
                <div className="app-icon">📱</div>
              </div>
              <div className="app-name">Google Pay</div>
            </button>
            <button 
              className="upi-app-btn" 
              onClick={() => handleUPIPayment('PhonePe')} 
              disabled={processing}
            >
              <div className="app-icon-wrapper">
                <div className="app-icon">💳</div>
              </div>
              <div className="app-name">PhonePe</div>
            </button>
            <button 
              className="upi-app-btn" 
              onClick={() => handleUPIPayment('BHIM')} 
              disabled={processing}
            >
              <div className="app-icon-wrapper">
                <div className="app-icon">🏦</div>
              </div>
              <div className="app-name">BHIM</div>
            </button>
            <button 
              className="upi-app-btn" 
              onClick={() => handleUPIPayment('Paytm')} 
              disabled={processing}
            >
              <div className="app-icon-wrapper">
                <div className="app-icon">📲</div>
              </div>
              <div className="app-name">Paytm</div>
            </button>
          </div>
          <p className="upi-note">Click any UPI app to proceed with payment</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-actions">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={processing}
          >
            ← Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
