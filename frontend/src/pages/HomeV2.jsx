import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/home-v2.css';

export default function HomeV2() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const categoryList = ['Electronics', 'Home Goods', 'Fashion', 'Games', 'Books', 'Sports'];

  useEffect(() => {
    fetchItems();
    setCategories(categoryList);

    const carouselTimer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % 5); // 5 banners
    }, 5000);

    return () => clearInterval(carouselTimer);
  }, []);

  const fetchItems = async () => {
    try {
      const res = await client.get('/items');
      setItems(res.data);
      // Sort by popularity (mock: random for now)
      setTrendingItems(res.data.slice(0, 8));
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const carouselBanners = [
    { title: '🛍️ Mega Sale', subtitle: 'Up to 70% OFF', color: '#FF5733' },
    { title: '⚡ Flash Deal', subtitle: 'Limited Time Offer', color: '#3498DB' },
    { title: '🎁 New Arrivals', subtitle: 'Fresh Products', color: '#2ECC71' },
    { title: '📱 Tech Fest', subtitle: 'Gadgets on Sale', color: '#9B59B6' },
    { title: '💎 Premium Store', subtitle: 'Quality Products', color: '#E67E22' },
  ];

  return (
    <div className="home-v2-container">
      {/* Top Banner with Carousel */}
      <section className="carousel-section">
        <div className="carousel">
          {carouselBanners.map((banner, idx) => (
            <div
              key={idx}
              className={`carousel-slide ${idx === carouselIndex ? 'active' : ''}`}
              style={{ background: banner.color }}
            >
              <div className="carousel-content">
                <div className="carousel-title">{banner.title}</div>
                <div className="carousel-subtitle">{banner.subtitle}</div>
                <button className="carousel-btn">Shop Now</button>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="carousel-dots">
          {carouselBanners.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === carouselIndex ? 'active' : ''}`}
              onClick={() => setCarouselIndex(idx)}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/items?category=${cat}`}
              className="category-card"
            >
              <div className="category-icon">
                {cat === 'Electronics' && '📱'}
                {cat === 'Home Goods' && '🏠'}
                {cat === 'Fashion' && '👗'}
                {cat === 'Games' && '🎮'}
                {cat === 'Books' && '📚'}
                {cat === 'Sports' && '⚽'}
              </div>
              <div className="category-name">{cat}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="deals-section">
        <div className="deals-header">
          <h2>⚡ Deals of the Day</h2>
          <Link to="/items" className="view-all">View All →</Link>
        </div>
        <div className="deals-grid">
          {items.slice(0, 4).map(item => (
            <div key={item._id} className="deal-card">
              <div className="deal-image">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/250x200?text=Product'}
                  alt={item.title}
                />
                <div className="deal-badge">HOT</div>
              </div>
              <div className="deal-content">
                <h3>{item.title?.substring(0, 30)}</h3>
                <div className="deal-price">₹{item.price}</div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => navigate(`/items/${item._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-section">
        <h2>🔥 Trending Products</h2>
        <div className="trending-grid">
          {trendingItems.map(item => (
            <div key={item._id} className="trending-card">
              <Link to={`/items/${item._id}`} className="trending-image-link">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/220x180?text=Product'}
                  alt={item.title}
                  className="trending-image"
                />
              </Link>
              <div className="trending-info">
                <h4>{item.title?.substring(0, 25)}</h4>
                <div className="trending-category">{item.category}</div>
                <div className="trending-price">₹{item.price}</div>
                <div className="trending-location">📍 {item.location || 'Location'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-content">
            <h2>Become a Seller</h2>
            <p>Start selling your products on our marketplace today!</p>
            <Link to="/items/create" className="cta-btn">Start Selling</Link>
          </div>
          <div className="cta-icon">🏪</div>
        </div>
      </section>
    </div>
  );
}
