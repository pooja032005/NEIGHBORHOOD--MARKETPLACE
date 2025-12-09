import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import client from '../api/api';
import '../styles/checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(CartContext);
  const { item, cartItems, total: passedTotal } = location.state || { item: null, cartItems: null, total: 0 };

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

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddress, setSaveAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState({});

  // Determine if we're checking out from cart or single item
  const isCartCheckout = cartItems && cartItems.length > 0;
  const itemsToCheckout = isCartCheckout ? cartItems : (item ? [{ item, qty: 1 }] : []);
  const totalPrice = isCartCheckout ? passedTotal : (item ? item.price : 0);

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

  if (itemsToCheckout.length === 0) {
    return (
      <div className="checkout-error">
        <p>No items to checkout. Please try again.</p>
        <button onClick={() => navigate('/cart')} className="btn-back">
          Back to Cart
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation for phone - only digits, max 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for pincode - only digits, max 6
    if (name === 'pincode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for name - only alphabets and spaces, max 30
    if (name === 'name') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 30);
      setFormData(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for city - only alphabets and spaces, max 20
    if (name === 'city') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
      setFormData(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for state - only alphabets and spaces, max 20
    if (name === 'state') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
      setFormData(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for area - max 25 characters
    if (name === 'area') {
      setFormData(prev => ({
        ...prev,
        [name]: value.slice(0, 25)
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // Real-time validation for houseNumber - max 10 characters
    if (name === 'houseNumber') {
      setFormData(prev => ({
        ...prev,
        [name]: value.slice(0, 10)
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }

    // For all other fields (like email)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation - only characters, max 30 chars
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
      newErrors.name = 'Name should contain only alphabets and spaces';
    } else if (formData.name.trim().length > 30) {
      newErrors.name = 'Name must not exceed 30 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation - exactly 10 digits, no special characters
    const phoneDigitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneDigitsOnly.length !== 10) {
      newErrors.phone = 'Phone number must contain exactly 10 digits';
    } else if (!/^\d{10}$/.test(phoneDigitsOnly)) {
      newErrors.phone = 'Phone number should contain only digits';
    }

    // House number validation - varchar(10)
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'House/Flat number is required';
    } else if (formData.houseNumber.trim().length > 10) {
      newErrors.houseNumber = 'House/Flat number must not exceed 10 characters';
    }

    // Area validation - max 25 characters
    if (!formData.area.trim()) {
      newErrors.area = 'Area/Street is required';
    } else if (formData.area.trim().length > 25) {
      newErrors.area = 'Area must not exceed 25 characters';
    }

    // City validation - max 20 characters, only alphabets
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.city)) {
      newErrors.city = 'City should contain only alphabets and spaces';
    } else if (formData.city.trim().length > 20) {
      newErrors.city = 'City must not exceed 20 characters';
    }

    // State validation - max 20 characters, only alphabets
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.state)) {
      newErrors.state = 'State should contain only alphabets and spaces';
    } else if (formData.state.trim().length > 20) {
      newErrors.state = 'State must not exceed 20 characters';
    }

    // Pincode validation - exactly 6 digits, no special characters
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Postal code must contain exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // If UPI is selected, redirect to payment page
    if (paymentMethod === 'upi') {
      navigate('/payment', {
        state: {
          cartItems: isCartCheckout ? cartItems : null,
          item: !isCartCheckout ? item : null,
          totalPrice,
          deliveryAddress: formData,
          paymentMethod: 'upi'
        }
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('PLACING ORDER WITH:', {
        token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
        user: user.email,
        item: item ? item._id : 'CART',
        itemCount: itemsToCheckout.length,
        total: totalPrice,
        address: formData
      });
      
      let createdOrderId = '';
      
      // For cart checkout, create multiple orders; for single item, create one order
      if (isCartCheckout) {
        // Create orders for each item in cart
        const orderPromises = cartItems.map(cartItem =>
          client.post(
            '/orders/create',
            {
              itemId: cartItem.item._id,
              quantity: cartItem.qty,
              totalPrice: cartItem.item.price * cartItem.qty,
              deliveryAddress: formData,
              paymentMethod,
              saveAddress
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
        );

        const responses = await Promise.all(orderPromises);
        createdOrderId = responses[0].data.orderId || responses[0].data._id;
        setOrderId(createdOrderId);
      } else {
        // Single item checkout
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

        createdOrderId = response.data.orderId || response.data._id;
        setOrderId(createdOrderId);
      }

      // Send notifications (SMS and Email)
      try {
        const notificationPayload = {
          phone: formData.phone,
          email: user.email,
          name: formData.name,
          orderId: createdOrderId,
          total: isCartCheckout ? passedTotal : item.price,
          paymentMethod: paymentMethod.toUpperCase(),
          address: formData.area,
          city: formData.city
        };

        // Send SMS notification
        await client.post('/notifications/send-sms', notificationPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Send Email notification
        await client.post('/notifications/send-email', notificationPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (notifyErr) {
        console.warn('Notification failed:', notifyErr);
        // Don't block order placement if notifications fail
      }

      // Clear cart after successful order
      if (isCartCheckout) {
        clearCart();
      }

      setOrderPlaced(true);
    } catch (error) {
      console.error('Order creation failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      const errorMsg = error.response?.data?.message || error.message || 'Failed to place order';
      alert(`Error: ${errorMsg}\n\nPlease make sure you are logged in and try again.`);
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
            <h3>Order Summary ({itemsToCheckout.length} item{itemsToCheckout.length !== 1 ? 's' : ''})</h3>
            
            {itemsToCheckout.map((cartItem, idx) => (
              <div key={idx} className="summary-item">
                <img src={cartItem.item.imageUrl} alt={cartItem.item.title} className="summary-image" />
                <div className="summary-details">
                  <h4>{cartItem.item.title}</h4>
                  <p className="summary-owner">By {cartItem.item.owner?.name || 'Unknown'}</p>
                  <p className="summary-location">📍 {cartItem.item.location}</p>
                  {cartItem.qty > 1 && <p className="summary-qty">Qty: {cartItem.qty}</p>}
                </div>
              </div>
            ))}

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
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
                <span>₹{totalPrice.toLocaleString()}</span>
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
                  <label>Full Name * (Max 30 characters)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    maxLength="30"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                  {formData.name && !errors.name && (
                    <span className="field-success">{formData.name.length}/30 characters ✓</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number * (10 digits)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    required
                    maxLength="10"
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                  {formData.phone && !errors.phone && (
                    <span className="field-success">{formData.phone.length}/10 digits ✓</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    disabled
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>House/Flat Number * (Max 10 characters)</label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    placeholder="123, A-Wing"
                    required
                    maxLength="10"
                    className={errors.houseNumber ? 'input-error' : ''}
                  />
                  {errors.houseNumber && <span className="field-error">{errors.houseNumber}</span>}
                  {formData.houseNumber && !errors.houseNumber && (
                    <span className="field-success">{formData.houseNumber.length}/10 ✓</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area/Street * (Max 25 characters)</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="MG Road, Bangalore"
                    required
                    maxLength="25"
                    className={errors.area ? 'input-error' : ''}
                  />
                  {errors.area && <span className="field-error">{errors.area}</span>}
                  {formData.area && !errors.area && (
                    <span className="field-success">{formData.area.length}/25 characters ✓</span>
                  )}
                </div>
                <div className="form-group">
                  <label>City * (Max 20 characters)</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bangalore"
                    required
                    maxLength="20"
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                  {formData.city && !errors.city && (
                    <span className="field-success">{formData.city.length}/20 ✓</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State/Province * (Max 20 characters)</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Karnataka"
                    required
                    maxLength="20"
                    className={errors.state ? 'input-error' : ''}
                  />
                  {errors.state && <span className="field-error">{errors.state}</span>}
                  {formData.state && !errors.state && (
                    <span className="field-success">{formData.state.length}/20 ✓</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Postal Code * (6 digits)</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="560001"
                    required
                    maxLength="6"
                    className={errors.pincode ? 'input-error' : ''}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                  {formData.pincode && !errors.pincode && (
                    <span className="field-success">{formData.pincode.length}/6 ✓</span>
                  )}
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
            <p className="payment-subtitle">Choose how you want to pay</p>
            
            <div className="payment-options">
              <label className="payment-option upi-recommended">
                <div className="recommended-badge">Recommended</div>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">
                  <span className="icon">📱</span>
                  <div className="payment-text">
                    <span className="payment-title">UPI Payment</span>
                    <span className="payment-desc">Direct payment via UPI (Fast & Secure)</span>
                  </div>
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
                  <div className="payment-text">
                    <span className="payment-title">Credit/Debit Card</span>
                    <span className="payment-desc">Visa, MasterCard, Rupay</span>
                  </div>
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
                  <div className="payment-text">
                    <span className="payment-title">Cash on Delivery</span>
                    <span className="payment-desc">Pay when you receive the item</span>
                  </div>
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
