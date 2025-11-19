import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/api';
import '../styles/checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || { item: null };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    houseNumber: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [saveAddress, setSaveAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        name: user.name || ''
      }));
    }
  }, []);

  if (!item) {
    return (
      <div className="checkout-error">
        <p>No item selected. Please try again.</p>
        <button onClick={() => navigate('/items')} className="btn-back">
          Back to Items
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.pincode || !formData.city) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await client.post(
        '/orders/create',
        {
          itemId: item._id,
          quantity: 1,
          totalPrice: item.price,
          deliveryAddress: formData,
          paymentMethod,
          saveAddress
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrderId(response.data.orderId || response.data._id);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p className="order-id">Order ID: {orderId}</p>
          <p className="order-message">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <button 
            onClick={() => navigate('/orders')}
            className="btn-view-orders"
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/items')}
            className="btn-continue-shopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        {/* LEFT: Order Summary */}
        <div className="checkout-left">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-item">
              <img src={item.imageUrl} alt={item.title} className="summary-image" />
              <div className="summary-details">
                <h4>{item.title}</h4>
                <p className="summary-owner">By {item.owner?.name || 'Unknown'}</p>
                <p className="summary-location">📍 {item.location}</p>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Price</span>
                <span>₹{item.price.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Delivery Charges</span>
                <span className="free">Free</span>
              </div>
              <div className="price-row discount">
                <span>Discount</span>
                <span>-₹0</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span>₹{item.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Checkout Form */}
        <div className="checkout-right">
          {/* Delivery Address */}
          <section className="checkout-section">
            <h3>Delivery Address</h3>
            
            <form className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>House/Flat Number *</label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area/Street *</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="MG Road"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bangalore"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Karnataka"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="560001"
                    required
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                <span>Save this address for future orders</span>
              </label>
            </form>
          </section>

          {/* Payment Method */}
          <section className="checkout-section">
            <h3>Payment Method</h3>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">
                  <span className="icon">📱</span>
                  <span>UPI</span>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">
                  <span className="icon">💳</span>
                  <span>Credit/Debit Card</span>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">
                  <span className="icon">💵</span>
                  <span>Cash on Delivery</span>
                </span>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="checkout-actions">
            <button 
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              onClick={handlePlaceOrder}
              className="btn-place-order"
              disabled={loading}
            >
              {loading ? '⏳ Placing Order...' : '✓ Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
