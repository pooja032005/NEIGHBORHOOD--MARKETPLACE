import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  if (!address) {
    return (
      <div className="payment-container">
        <div className="error-message">
          <p>Address not found. Please go back and enter address.</p>
          <button onClick={() => navigate("/address")}>← Go to Address</button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      // Mock order confirmation
      const orderId = `ORD-${Date.now()}`;
      localStorage.setItem("lastOrder", JSON.stringify({
        orderId,
        paymentMethod,
        address,
        timestamp: new Date().toISOString()
      }));

      // Navigate to success page
      navigate("/order-success", { state: { orderId, paymentMethod } });
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-wrapper">
        <div className="payment-header">
          <h1>💳 Payment Method</h1>
          <p>Choose how you want to pay</p>
        </div>

        <div className="payment-content">
          {/* Left - Payment Options */}
          <div className="payment-options">
            <h3>Select Payment Method</h3>

            {/* COD Option */}
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon">🚚</span>
                <div className="option-text">
                  <h4>Cash on Delivery</h4>
                  <p>Pay when you receive the order</p>
                </div>
              </div>
            </label>

            {/* UPI Option */}
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon">📱</span>
                <div className="option-text">
                  <h4>UPI Payment</h4>
                  <p>Pay using Google Pay, PhonePe, or Paytm</p>
                </div>
              </div>
            </label>

            {/* Card Option */}
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon">💳</span>
                <div className="option-text">
                  <h4>Credit / Debit Card</h4>
                  <p>Visa, Mastercard, or American Express</p>
                </div>
              </div>
            </label>
          </div>

          {/* Right - Order Summary */}
          <div className="order-summary-sticky">
            <h3>Delivery Address</h3>
            <div className="address-display">
              <p>
                <strong>{address.fullName}</strong>
              </p>
              <p>{address.houseNumber}</p>
              <p>{address.area}, {address.city}</p>
              <p>{address.state} - {address.pincode}</p>
              <p>📞 {address.phone}</p>
            </div>

            <div className="payment-method-display">
              <h3>Payment Method</h3>
              <p className="selected-method">
                {paymentMethod === "cod" && "💶 Cash on Delivery"}
                {paymentMethod === "upi" && "📱 UPI Payment"}
                {paymentMethod === "card" && "💳 Card Payment"}
              </p>
            </div>

            <div className="order-total">
              <p className="total-label">Total Amount:</p>
              <p className="total-amount">₹ 0.00</p>
              <p className="note">Order items will be included in final bill</p>
            </div>

            <button
              className="btn-confirm-order"
              onClick={handleConfirmOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "✓ Confirm Order"}
            </button>

            <button
              className="btn-edit-address"
              onClick={() => navigate("/address")}
            >
              ← Edit Address
            </button>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="payment-info">
        <h4>💡 Payment Information</h4>
        <ul>
          <li>All transactions are secured with encryption</li>
          <li>Choose COD for payments after delivery</li>
          <li>UPI & Card payments are instant</li>
          <li>You'll receive a confirmation SMS & Email</li>
        </ul>
      </div>
    </div>
  );
}
