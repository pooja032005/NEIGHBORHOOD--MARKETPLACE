import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/home-v2.css';

export default function HomeV2() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }

    // Fetch items for "Browse Products" section
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await client.get('/items');
      setItems((res.data || []).slice(0, 6));
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const handleBrowse = () => {
    navigate('/items');
  };

  const handleBecomeSeller = () => {
    if (!user) {
      navigate('/register');
    } else if (user.role === 'buyer') {
      // Show role change dialog or navigate to profile to change role
      navigate('/profile/edit');
    } else {
      navigate('/seller/dashboard');
    }
  };

  return (
    <div className="home-v2-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="power">Power your</span>
              <span className="adventures">neighborhood</span>
            </h1>
            <p className="hero-subtitle">Buy, Sell & Share within your Community</p>
            <p className="hero-description">
              Tap into a trusted network of neighbors and local businesses
            </p>
          </div>

          <div className="hero-graphics">
            <div className="balloon balloon-1">🎈</div>
            <div className="balloon balloon-2">🎈</div>
            <div className="weather-icon sun">☀️</div>
            <div className="weather-icon cloud">☁️</div>
          </div>
        </div>

        <div className="landscape">
          <div className="trees left-trees">🌲🌲🌲</div>
          <div className="windmill left-windmill">💨</div>
          <div className="solar-panel left-solar">☼</div>
          <div className="trees right-trees">🌲🌲🌲</div>
          <div className="windmill right-windmill">💨</div>
          <div className="solar-panel right-solar">☼</div>
        </div>
      </section>

      {/* CTA Buttons Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-box">
            <h3>🏠 I have a Home</h3>
            <p>Buy or Sell items from your home</p>
            <button className="cta-btn btn-home" onClick={handleBrowse}>
              Browse Marketplace
            </button>
          </div>

          <div className="cta-box">
            <h3>🏢 I have a Business</h3>
            <p>Grow your business with local reach</p>
            <button className="cta-btn btn-business" onClick={handleBecomeSeller}>
              Become a Seller
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {items.length > 0 && (
        <section className="products-section">
          <h2>🛍️ Featured Products</h2>
          <div className="products-grid">
            {items.map(item => (
              <Link 
                key={item._id}
                to={`/items/${item._id}`}
                className="product-card"
                style={{ textDecoration: 'none' }}
              >
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/200'} 
                  alt={item.title}
                  className="product-image"
                />
                <div className="product-details">
                  <h4>{item.title}</h4>
                  <p className="product-price">₹{item.price}</p>
                  <p className="product-location">📍 {item.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/items" className="view-all-link">
            View All Products →
          </Link>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose NeighborhoodMarket?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤝</span>
            <h4>Trusted Community</h4>
            <p>Buy and sell with neighbors you trust</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💰</span>
            <h4>Better Prices</h4>
            <p>No middlemen, better deals for everyone</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h4>Fast & Easy</h4>
            <p>Quick listings, instant buyers, smooth transactions</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h4>Safe & Secure</h4>
            <p>Verified users and secure payment methods</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-footer">
        <h2>Ready to Get Started?</h2>
        <div className="footer-buttons">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary">
                Sign Up Now
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Already a Member? Login
              </Link>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleBrowse}>
                Shop Now
              </button>
              <button className="btn btn-secondary" onClick={handleBecomeSeller}>
                Become a Seller
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
