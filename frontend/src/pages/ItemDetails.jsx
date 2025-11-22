import React, { useEffect, useState, useContext } from 'react';
import client from '../api/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/itemdetails.css';

export default function ItemDetails(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { showToast } = useContext(CartContext);
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();
  const isBuyer = currentUser && currentUser.role === 'buyer';
  const [item, setItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(()=> {
    client.get(`/items/${id}`).then(res => {
      setItem(res.data);
    }).catch(err => {
      alert('Item not found'); 
      navigate('/items');
    });
  }, [id, navigate]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(item, 1);
      showToast('✓ Added to cart!');
    } catch (err) {
      showToast('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    navigate('/address', { state: { item } });
  };

  const markSold = async () => {
    try {
      await client.post(`/items/${id}/mark-sold`);
      setItem(prev => ({ ...prev, status: 'sold' }));
      showToast('Item marked as sold');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error marking as sold');
    }
  };

  if(!item) return <div className="loading">⏳ Loading...</div>;

  const isOwner = String(item.owner?._id || item.owner) === (JSON.parse(localStorage.getItem('user') || '{}').id || JSON.parse(localStorage.getItem('user') || '{}')._id);

  return (
    <div className="itemdetails-container">
      {/* Toast */}
      {toast.show && <div className="toast toast-success">{toast.message}</div>}

      <div className="itemdetails-wrapper">
        
        {/* ===== LEFT: IMAGE GALLERY ===== */}
        <div className="itemdetails-image-section">
          <div className="main-image">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} />
            ) : (
              <div className="image-placeholder">📸 No Image</div>
            )}
            <span className={`status-badge ${item.status}`}>
              {item.status === 'sold' ? '❌ SOLD' : '✓ Available'}
            </span>
          </div>

          <div className="image-thumbnails">
            {[item.imageUrl, item.imageUrl, item.imageUrl].filter(Boolean).map((img, idx) => (
              <div 
                key={idx}
                className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT: DETAILS + PURCHASE PANEL ===== */}
        <div className="itemdetails-info-section">
          
          {/* Header Info */}
          <div className="item-header">
            <div className="breadcrumb">
              <Link to="/items">Items</Link> / <span>{item.category}</span>
            </div>
            <h1 className="item-title">{item.title}</h1>
            <div className="item-meta-header">
              <span className="seller-badge">👤 {item.owner?.name || 'Unknown Seller'}</span>
              <span className="location-badge">📍 {item.location || 'N/A'}</span>
              {item.rating && <span className="rating-badge">⭐ {item.rating}/5</span>}
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="purchase-panel">
            <div className="price-section">
              <span className="price">₹{item.price?.toLocaleString() || '0'}</span>
              <span className="condition">{item.condition || 'Used'}</span>
            </div>

            {/* Delivery Address Block */}
            <div className="info-block">
              <h3>📍 Delivery Address</h3>
              <div className="address-form">
                <input type="text" placeholder="Your Name" className="form-input" />
                <input type="tel" placeholder="Phone Number" className="form-input" />
                <input type="text" placeholder="Street Address" className="form-input" />
                <input type="text" placeholder="City" className="form-input" />
                <input type="text" placeholder="Pincode" className="form-input" maxLength="6" />
              </div>
            </div>

            {/* Payment Method Block */}
            <div className="info-block">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input type="radio" name="payment" defaultChecked />
                  <span>💸 Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input type="radio" name="payment" />
                  <span>📱 UPI (GooglePay, PhonePe)</span>
                </label>
                <label className="payment-option">
                  <input type="radio" name="payment" />
                  <span>💳 Debit/Credit Card</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {isBuyer ? (
                <>
                  <button 
                    className="btn-primary"
                    onClick={handleBuyNow}
                    disabled={item.status === 'sold'}
                  >
                    ⚡ Buy Now
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleAddToCart}
                    disabled={addingToCart || item.status === 'sold'}
                  >
                    {addingToCart ? '⏳ Adding...' : '🛒 Add to Cart'}
                  </button>
                </>
              ) : (
                <div style={{color: '#a00'}}>Only buyers can purchase items. Please login as a buyer.</div>
              )}
            </div>

            {/* Contact Seller */}
            <Link to={`/chat/${id}`} className="btn-contact">
              💬 Contact Seller
            </Link>

            {/* Seller Actions */}
            {isOwner && item.status !== 'sold' && (
              <button className="btn-mark-sold" onClick={markSold}>
                ✓ Mark as Sold
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== DESCRIPTION SECTION ===== */}
      <div className="itemdetails-description">
        <h2>📝 Details</h2>
        <div className="description-content">
          <p>{item.description || 'No description provided'}</p>
        </div>

        {/* Item Specs */}
        <div className="item-specs">
          <div className="spec-row">
            <span className="spec-label">Category</span>
            <span className="spec-value">{item.category}</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Condition</span>
            <span className="spec-value">{item.condition || 'Used'}</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Location</span>
            <span className="spec-value">{item.location}</span>
          </div>
          {item.status && (
            <div className="spec-row">
              <span className="spec-label">Status</span>
              <span className="spec-value">{item.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seller Info Card */}
      <div className="seller-info-card">
        <div className="seller-avatar">
          {item.owner?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
        <div className="seller-details">
          <h3>{item.owner?.name || 'Seller'}</h3>
          <p>📍 {item.location}</p>
          <p className="seller-rating">⭐ {item.owner?.rating || '4.5'}/5 rating</p>
        </div>
        <Link to={`/chat/${id}`} className="btn-msg">Message</Link>
      </div>
    </div>
  );
}
