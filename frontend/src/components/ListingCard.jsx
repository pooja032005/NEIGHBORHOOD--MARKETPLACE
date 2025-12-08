import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/listing-card.css';

export default function ListingCard({ item, onAddCart }) {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, showToast } = useContext(CartContext);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();
  const isBuyer = currentUser && currentUser.role === 'buyer';
  
  // Check if item is already in wishlist
  const isWishlisted = wishlist.some(w => w.item?._id === item._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    try {
      await addToCart(item, 1);
      onAddCart?.();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/items/${item._id}`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(item._id);
      } else {
        await addToWishlist(item);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div className="listing-card">
      {/* WISHLIST BUTTON */}
      <button 
        className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
        onClick={handleWishlist}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      {/* IMAGE CONTAINER */}
      <Link to={`/items/${item._id}`} className="card-image-wrapper">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            <span>📸 No Image</span>
          </div>
        )}
        <span className="card-badge">{item.category}</span>
        <span className="card-condition">{item.condition || 'Used'}</span>
      </Link>

      {/* CONTENT */}
      <div className="card-content">
        <Link to={`/items/${item._id}`} className="card-title-link">
          <h3 className="card-title">{item.title}</h3>
        </Link>

        {/* METADATA */}
        <div className="card-meta">
          <span className="card-owner">👤 {item.owner?.name || 'Unknown'}</span>
          <span className="card-location">📍 {item.location || 'N/A'}</span>
        </div>

        {/* PRICE BADGE */}
        <div className="card-price-section">
          <span className="price-value">₹{item.price.toLocaleString()}</span>
          {item.rating && (
            <span className="card-rating">⭐ {item.rating}/5</span>
          )}
        </div>

        {/* BUTTONS */}
        <div className="card-buttons">
          {isBuyer ? (
            <>
              <button 
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? '⏳' : '🛒'} Cart
              </button>
              <button 
                className="btn-buy-now"
                onClick={handleBuyNow}
              >
                ⚡ Buy
              </button>
            </>
          ) : (
            <div style={{color: '#a00', padding: '6px'}}>Only buyers can purchase. Register/login as a buyer.</div>
          )}
        </div>
      </div>
    </div>
  );
}
