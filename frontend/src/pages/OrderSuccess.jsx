import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ordersuccess.css";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentMethod } = location.state || {};

  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      // Retrieve order details from localStorage
      const order = localStorage.getItem("lastOrder");
      if (order) {
        setOrderDetails(JSON.parse(order));
      }
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="order-success-container">
        <div className="error-message">
          <p>Order not found. Please try again.</p>
          <button onClick={() => navigate("/")}>← Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-wrapper">
        {/* Success Icon */}
        <div className="success-icon">✓</div>

        {/* Success Message */}
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for your order. Your order has been confirmed.
        </p>

        {/* Order Details Card */}
        <div className="order-details-card">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value">{orderId}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">
              {paymentMethod === "cod" && "💶 Cash on Delivery"}
              {paymentMethod === "upi" && "📱 UPI Payment"}
              {paymentMethod === "card" && "💳 Card Payment"}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-pending">🔄 Pending Confirmation</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Estimated Delivery:</span>
            <span className="detail-value">3-5 Business Days</span>
          </div>

          {orderDetails && (
            <div className="detail-row">
              <span className="detail-label">Delivery Address:</span>
              <span className="detail-value address-text">
                {orderDetails.address.houseNumber}, {orderDetails.address.area},{" "}
                {orderDetails.address.city}, {orderDetails.address.state} -{" "}
                {orderDetails.address.pincode}
              </span>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="whats-next">
          <h3>What's Next?</h3>
          <ol>
            <li>You'll receive a confirmation SMS on {orderDetails?.address?.phone}</li>
            <li>Seller will prepare and ship your order</li>
            <li>You'll receive tracking details via email</li>
            <li>
              Receive your order and complete the delivery process
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="success-buttons">
          <button className="btn-track-order" onClick={() => navigate("/orders")}>
            📦 Track Order
          </button>
          <button className="btn-continue-shopping" onClick={() => navigate("/items")}>
            Continue Shopping →
          </button>
        </div>

        {/* Support Info */}
        <div className="support-info">
          <p>
            📞 Need help? Contact support at <strong>support@marketplace.com</strong>
          </p>
          <p>
            Or call us at <strong>+91-1234567890</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
