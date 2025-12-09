import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/paymentsuccess.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalPrice, deliveryAddress } = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  const handleBackHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        {/* Success Animation */}
        <div className="success-animation">
          <div className="success-checkmark">
            <div className="checkmark-circle"></div>
            <div className="checkmark-check"></div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="success-title">Payment Successful! 🎉</h1>
        <p className="success-subtitle">Your order has been confirmed</p>

        {/* Order Details */}
        <div className="order-details-section">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value order-id">{orderId}</span>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                alert('Order ID copied!');
              }}
              title="Copy Order ID"
            >
              📋
            </button>
          </div>

          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value">₹{totalPrice}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">
              <span className="badge badge-upi">UPI</span>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Payment Status:</span>
            <span className="detail-value">
              <span className="badge badge-success">✓ Paid</span>
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="delivery-address-section">
            <h3>Delivery Address</h3>
            <div className="address-box">
              <p><strong>{deliveryAddress.name}</strong></p>
              <p>{deliveryAddress.houseNumber}, {deliveryAddress.area}</p>
              <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
              <p className="contact-info">📞 {deliveryAddress.phone}</p>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="whats-next-section">
          <h3>What's Next?</h3>
          <ul className="next-steps">
            <li>
              <span className="step-number">1</span>
              <span>Order confirmation email will be sent shortly</span>
            </li>
            <li>
              <span className="step-number">2</span>
              <span>Seller will prepare and ship your item</span>
            </li>
            <li>
              <span className="step-number">3</span>
              <span>You'll receive tracking updates via SMS & Email</span>
            </li>
            <li>
              <span className="step-number">4</span>
              <span>Item will be delivered to your address</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button
            className="btn-home"
            onClick={handleBackHome}
          >
            ← Back to Home
          </button>
          <button
            className="btn-orders"
            onClick={handleViewOrders}
          >
            📦 View My Orders
          </button>
        </div>

        {/* Support Info */}
        <div className="support-info">
          <p>Need help? <a href="/chats">Contact seller via chat</a> or check <a href="/orders">your orders</a></p>
        </div>
      </div>
    </div>
  );
}
