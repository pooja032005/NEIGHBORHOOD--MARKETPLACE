import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from 'react';
import client from '../api/api';
import ListingCard from '../components/ListingCard';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/itemlist.css';

export default function ItemList(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loc, setLoc] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showWishlist, setShowWishlist] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
    load();
  }, [location]);

  const load = () => {
    const params = {};
    if (q.trim() !== "") params.q = q.trim();
    if (category.trim() !== "") params.category = category.trim();
    if (loc.trim() !== "") params.location = loc.trim();
    if (minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== "") params.maxPrice = maxPrice;

    setLoading(true);
    client.get("/items", { params })
      .then(res => setItems(res.data))
      .catch(err => {
        console.error(err);
        showToast('Failed to load items', 'error');
      })
      .finally(() => setLoading(false));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleReset = () => {
    setQ('');
    setCategory('');
    setLoc('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="itemlist-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="itemlist-header">
        <div className="header-left">
          <h1>🛒 Items for Sale</h1>
          <p className="header-subtitle">Find amazing deals from your neighbourhood</p>
        </div>
        <Link to="/items/create" className="btn-post-item">+ Post Item</Link>
      </div>

      {/* MAIN LAYOUT: FILTER LEFT + GRID RIGHT */}
      <div className="itemlist-wrapper">
        
        {/* 🎯 LEFT SIDE — VERTICAL FILTER PANEL */}
        <aside className="filter-panel-items">
          <div className="filter-header">
            <h3>🔍 Filters</h3>
            <button className="filter-close-btn" onClick={() => setShowWishlist(!showWishlist)}>✕</button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label>Search Items</label>
            <input
              type="text"
              placeholder="Laptop, phone..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <input
              type="text"
              placeholder="Electronics, Books..."
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Location */}
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Delhi, Mumbai..."
              value={loc}
              onChange={e => setLoc(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="filter-input-half"
              />
              <span className="price-separator">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="filter-input-half"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="filter-buttons">
            <button onClick={load} className="btn-apply">
              {loading ? '⏳ Loading...' : '✓ Apply Filters'}
            </button>
            <button onClick={handleReset} className="btn-reset">↺ Reset</button>
          </div>
        </aside>

        {/* ⭐ RIGHT SIDE — ITEMS GRID */}
        <main className="items-container">
          <div className="items-header">
            <h2>Available Items</h2>
            <span className="items-count">
              {items.length} item{items.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {loading ? (
            <div className="loading-spinner">⏳ Loading items...</div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map(item => (
                <ListingCard 
                  key={item._id} 
                  item={item} 
                  onAddCart={() => showToast('✓ Added to cart!')}
                />
              ))}
            </div>
          ) : (
            <div className="no-items">
              <p>📭 No items found matching your filters</p>
              <p className="no-items-hint">Try adjusting your search criteria</p>
              <button onClick={handleReset} className="btn-reset-large">Clear all filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
