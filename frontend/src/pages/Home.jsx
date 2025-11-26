import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/api";
import "./home.css";

export default function Home() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [featuredItem, setFeaturedItem] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    // Fetch featured item
    client.get("/users/featured-item").then(res => {
      setFeaturedItem(res.data);
      setLoadingFeatured(false);
    }).catch(() => {
      setLoadingFeatured(false);
    });

    client.get("/items?limit=4").then(res => {
      setTrendingItems(res.data.slice(0, 4));
    }).catch(() => {});

    client.get("/services?limit=4").then(res => {
      setTopServices(res.data.slice(0, 4));
    }).catch(() => {});
  }, []);

  // Get emoji for category
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Electronics': '📱',
      'Home Goods': '🏠',
      'Fashion': '👗',
      'Games': '🎮',
      'Books': '📚',
      'Sports': '🚲',
      'Furniture': '🛋️',
      'Appliances': '🏠',
      'Kitchen': '🍳',
      'Clothing': '👕',
      'Shoes': '👞',
      'Toys': '🧸',
      'Beauty': '💄',
      'Health': '💊',
      'Others': '📦'
    };
    return emojiMap[category] || '📦';
  };

  return (
    <div className="home-container">

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover, Buy & Sell in Your <span className="highlight">Neighbourhood</span>
          </h1>
          <p className="hero-subtitle">
            A community-powered marketplace where you can buy items, offer services,
            and connect with locals near you.
          </p>

          <div className="hero-actions">
            <Link to="/items" className="btn-primary-hero">🛒 Browse Items</Link>
            <Link to="/services" className="btn-secondary-hero">🔧 Explore Services</Link>
          </div>
        </div>

        <div className="hero-cards">
          <div className="hero-card card-1">
            <div className="hero-icon">🛍️</div>
            <h3>Shop Items</h3>
            <p>Find amazing deals</p>
          </div>
          <div className="hero-card card-2">
            <div className="hero-icon">🛠️</div>
            <h3>Offer Services</h3>
            <p>Share your skills</p>
          </div>
          <div className="hero-card card-3">
            <div className="hero-icon">📍</div>
            <h3>Local Community</h3>
            <p>Connect nearby</p>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY SECTION ===== */}
      <section className="categories-section">
        <div className="section-header">
          <h2>🎯 Shop by Category</h2>
          <p>Browse our popular categories</p>
        </div>

        <div className="category-grid">
          {/* Featured Admin Item - Shows first if available */}
          {!loadingFeatured && featuredItem && (
            <Link to={`/category/${encodeURIComponent(featuredItem.category)}`} className="category-pill featured-category">
              <div className="featured-badge">✨ Featured</div>
              <span className="category-icon">{getCategoryEmoji(featuredItem.category)}</span>
              <span className="category-name">{featuredItem.category}</span>
              <small className="featured-by">By Admin</small>
            </Link>
          )}

          {/* Standard Categories */}
          <Link to="/category/Electronics" className="category-pill">
            <span className="category-icon">📱</span>
            <span className="category-name">Electronics</span>
          </Link>

          <Link to="/category/Home%20Goods" className="category-pill">
            <span className="category-icon">🏠</span>
            <span className="category-name">Home Goods</span>
          </Link>

          <Link to="/category/Fashion" className="category-pill">
            <span className="category-icon">👗</span>
            <span className="category-name">Fashion</span>
          </Link>

          <Link to="/category/Games" className="category-pill">
            <span className="category-icon">🎮</span>
            <span className="category-name">Games</span>
          </Link>

          <Link to="/category/Books" className="category-pill">
            <span className="category-icon">📚</span>
            <span className="category-name">Books</span>
          </Link>

          <Link to="/category/Sports" className="category-pill">
            <span className="category-icon">🚲</span>
            <span className="category-name">Sports</span>
          </Link>
        </div>
      </section>

      {/* ===== TRENDING ITEMS ===== */}
      {trendingItems.length > 0 && (
        <section className="trending-section">
          <div className="section-header">
            <h2>🔥 Trending Items</h2>
            <Link to="/items" className="view-all">View All →</Link>
          </div>

          <div className="trending-grid">
            {trendingItems.map(item => (
              <Link key={item._id} to={`/items/${item._id}`} className="trending-card">
                <div className="trending-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                  <span className="trending-badge">Hot 🔥</span>
                </div>
                <div className="trending-info">
                  <h3>{item.title}</h3>
                  <p className="price">₹{item.price?.toLocaleString()}</p>
                  <p className="seller">👤 {item.owner?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== TOP SERVICES ===== */}
      {topServices.length > 0 && (
        <section className="services-section">
          <div className="section-header">
            <h2>⭐ Top Services</h2>
            <Link to="/services" className="view-all">View All →</Link>
          </div>

          <div className="services-showcase">
            {topServices.map(service => (
              <Link key={service._id} to={`/services/${service._id}`} className="service-card">
                <div className="service-image">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} />
                  ) : (
                    <div className="image-placeholder">🔧</div>
                  )}
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p className="provider">👤 {service.provider?.name}</p>
                  <p className="service-price">₹{service.price} {service.priceType}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <h2>✨ Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>Sell Easily</h3>
            <p>Upload unused items and earn money locally in minutes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚒️</div>
            <h3>Offer Skills</h3>
            <p>Provide services like tutoring, repairs, or pet care.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Safe & Local</h3>
            <p>Everything happens within your neighbourhood securely.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Deals</h3>
            <p>Fast transactions with nearby members in your area.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>🚀 Ready to Get Started?</h2>
          <p>Join thousands of neighbours buying, selling, and sharing services every day.</p>
          <Link to="/register" className="btn-cta">Create an Account Now</Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Neighbourhood Market · Built for your community ❤️</p>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
