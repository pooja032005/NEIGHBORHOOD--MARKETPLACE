import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import client from '../api/api';
import ListingCard from '../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';
import './ItemList.css';

export default function ItemList(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loc, setLoc] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const query = params.get("q");
    const nextFilters = {
      q: query || '',
      category: cat || '',
      loc: params.get('location') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
    };
    setQ(nextFilters.q);
    setCategory(nextFilters.category);
    setLoc(nextFilters.loc);
    setMinPrice(nextFilters.minPrice);
    setMaxPrice(nextFilters.maxPrice);
    load(nextFilters);
  }, [location]);

  const load = (filterValues = { q, category, loc, minPrice, maxPrice }) => {
    const params = {};
    if (filterValues.q.trim() !== "") params.q = filterValues.q.trim();
    if (filterValues.category.trim() !== "") params.category = filterValues.category.trim();
    if (filterValues.loc.trim() !== "") params.location = filterValues.loc.trim();
    if (filterValues.minPrice !== "") params.minPrice = filterValues.minPrice;
    if (filterValues.maxPrice !== "") params.maxPrice = filterValues.maxPrice;

    setLoading(true);
    client.get("/items", { params })
      .then(res => {
        const min = filterValues.minPrice === '' ? null : Number(filterValues.minPrice);
        const max = filterValues.maxPrice === '' ? null : Number(filterValues.maxPrice);
        const filteredItems = res.data.filter(item => (
          (min === null || Number(item.price) >= min) &&
          (max === null || Number(item.price) <= max)
        ));
        setItems(filteredItems);
      })
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
    const emptyFilters = { q: '', category: '', loc: '', minPrice: '', maxPrice: '' };
    setQ(emptyFilters.q);
    setCategory(emptyFilters.category);
    setLoc(emptyFilters.loc);
    setMinPrice(emptyFilters.minPrice);
    setMaxPrice(emptyFilters.maxPrice);
    setFiltersOpen(false);
    load(emptyFilters);
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    load();
    setFiltersOpen(false);
  };

  const visibleItems = items.filter(item => item.owner?.name !== 'Unknown');

  return (
    <div className="items-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`items-toast items-toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      <div className="items-page-shell">
        <header className="items-page-header">
          <div>
            <h1 className="items-page-title">🛒 Items for Sale</h1>
            <p className="items-page-subtitle">Find amazing deals from your neighbourhood</p>
          </div>
          <Link to="/items/create" className="items-post-button">+ Post Item</Link>
        </header>

        <button
          type="button"
          className="items-filter-toggle"
          onClick={() => setFiltersOpen(prev => !prev)}
          aria-expanded={filtersOpen}
          aria-controls="items-filters"
        >
          {filtersOpen ? 'Hide filters' : '🔎 Filters'}
        </button>

        <div className="items-main-layout">
          <aside id="items-filters" className={`items-filter-card${filtersOpen ? ' open' : ''}`}>
            <h2 className="items-filter-heading">🔎 Filters</h2>

            <form onSubmit={handleApplyFilters}>
              <div className="items-filter-group">
                <label className="items-filter-label" htmlFor="items-search">Search Items</label>
                <div className="items-input-wrap">
                  <input id="items-search" type="search" placeholder="Laptop, phone..." value={q} onChange={e => setQ(e.target.value)} className="items-filter-input" />
                  <span className="items-input-icon" aria-hidden="true">⌕</span>
                </div>
              </div>

              <div className="items-filter-group">
                <label className="items-filter-label" htmlFor="items-category">Category</label>
                <div className="items-input-wrap">
                  <input id="items-category" type="text" placeholder="Electronics, Books..." value={category} onChange={e => setCategory(e.target.value)} className="items-filter-input" />
                  <span className="items-input-icon" aria-hidden="true">⌄</span>
                </div>
              </div>

              <div className="items-filter-group">
                <label className="items-filter-label" htmlFor="items-location">Location</label>
                <div className="items-input-wrap">
                  <input id="items-location" type="text" placeholder="Delhi, Mumbai..." value={loc} onChange={e => setLoc(e.target.value)} className="items-filter-input" />
                  <span className="items-input-icon" aria-hidden="true">⌖</span>
                </div>
              </div>

              <div className="items-filter-group">
                <span className="items-filter-label">Price Range</span>
                <div className="items-price-row">
                  <input aria-label="Minimum price" type="number" min="0" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="items-price-input" />
                  <span className="items-price-separator">-</span>
                  <input aria-label="Maximum price" type="number" min="0" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="items-price-input" />
                </div>
              </div>

              <div className="items-filter-actions">
                <button type="submit" className="items-apply-button">✓ Apply Filters</button>
                <button type="button" onClick={handleReset} className="items-reset-button">↻ Reset</button>
              </div>
            </form>
          </aside>

          <main className="items-content">
            <section className="items-section-header" aria-labelledby="available-items-title">
              <h2 id="available-items-title" className="items-section-title">Available Items</h2>
              <span className="items-count-pill">{visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''} found</span>
            </section>

            {loading ? (
              <div className="items-empty-card items-loading">⏳ Loading items...</div>
            ) : visibleItems.length > 0 ? (
              <div className="items-grid">
                {visibleItems.map(item => (
                  <ListingCard key={item._id} item={item} onAddCart={() => showToast('✓ Added to cart!')} />
                ))}
              </div>
            ) : (
              <section className="items-empty-card" aria-labelledby="items-empty-title">
                <div className="items-empty-content">
                  <div className="items-empty-illustration" role="img" aria-label="Shopping bags and an open box">
                    <span className="items-spark items-spark-one">✦</span>
                    <span className="items-spark items-spark-two">✦</span>
                    <span className="items-spark items-spark-three">✦</span>
                    <span className="items-bag" />
                    <span className="items-box" />
                  </div>
                  <h2 id="items-empty-title" className="items-empty-title">No items found matching your filters</h2>
                  <p className="items-empty-description">Try adjusting your search filters</p>
                  <button onClick={handleReset} className="items-clear-button">↻ Clear all filters</button>
                </div>
                <div className="items-landscape" aria-hidden="true">
                  <span className="items-hill" />
                  <span className="items-plant items-plant-one" />
                  <span className="items-plant items-plant-two" />
                  <span className="items-plant items-plant-three" />
                  <span className="items-plant items-plant-four" />
                  <span className="items-shopping-bag items-shopping-bag-left" />
                  <span className="items-shopping-bag items-shopping-bag-right" />
                  <span className="items-basket" />
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
