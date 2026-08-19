import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/home-v2.css';

const categories = [
  ['🥦', 'Groceries', 'Groceries'], ['🎧', 'Electronics', 'Electronics'],
  ['👕', 'Fashion', 'Fashion'], ['🛋️', 'Home & Kitchen', 'Home Goods'],
  ['🧴', 'Beauty & Care', 'Beauty'], ['📚', 'Books & Stationery', 'Books'],
  ['⚽', 'Sports & Outdoors', 'Sports'], ['🧸', 'Toys & Games', 'Toys']
];

const promos = [
  { className: 'promo-saver', eyebrow: 'SUPER SAVER', title: <>Big Deals on<br />Top Products</>, copy: 'Up to 50% off selected items', action: 'Shop Now', to: '/items', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { className: 'promo-services', eyebrow: 'BOOK SERVICES', title: <>Trusted Services<br />At Your Doorstep</>, copy: 'From cleaning to repairs, we have you covered', action: 'Book Now', to: '/services', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { className: 'promo-community', eyebrow: 'LOCAL & RELIABLE', title: <>Support Local.<br />Grow Together.</>, copy: 'Empowering local sellers and communities', action: 'Explore Sellers', to: '/items', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80' },
  { className: 'promo-home', eyebrow: 'FRESH FINDS', title: <>Make Home<br />Feel Better.</>, copy: 'Discover useful finds from nearby sellers', action: 'Browse Home', to: '/category/Home%20Goods', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' }
];

export default function HomeV2() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    client.get('/items?limit=12').then(({ data }) => {
      const result = Array.isArray(data) ? data : data.items || [];
      setItems(result.slice(0, 12));
    }).catch(() => setItems([]));

    client.get('/services?limit=4').then(({ data }) => {
      const result = Array.isArray(data) ? data : data.services || [];
      setServices(result.slice(0, 4));
    }).catch(() => setServices([]));
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/items?q=${encodeURIComponent(search.trim())}` : '/items');
  };

  const deals = items.slice(0, 6);
  const recommended = (items.slice(6, 12).length ? items.slice(6, 12) : items.slice(0, 6));

  return (
    <div className="market-home">
      <section className="market-hero">
        <div className="market-hero-inner">
          <div className="market-hero-copy">
            <span className="market-kicker">Your Neighbourhood, Your Market</span>
            <h1>Everything You Need,<br /><em>Right Around You.</em></h1>
            <p>Shop local products, book trusted services, and connect with your neighbourhood like never before.</p>
            <div className="market-hero-actions">
              <Link to="/items" className="market-button market-button-primary">🛍 Shop Products</Link>
              <Link to="/services" className="market-button market-button-light">🛠 Explore Services</Link>
            </div>
          </div>
          <div className="market-stats">
            <div><strong>1000+</strong><span>Happy Customers</span></div>
            <div><strong>500+</strong><span>Local Sellers</span></div>
            <div><strong>50+</strong><span>Service Providers</span></div>
          </div>
        </div>
      </section>

      <section className="market-trust-strip">
        {[['🛡️', 'Secure Payments', '100% secure & protected'], ['🚚', 'Fast Delivery', 'Quick & reliable delivery'], ['↻', 'Easy Returns', 'Hassle-free returns'], ['🎧', '24/7 Support', "We're here to help"]].map(([icon, title, copy]) => (
          <div key={title}><span>{icon}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
        ))}
      </section>

      <main className="market-main">
        <section className="market-section">
          <div className="market-section-heading"><div><span className="market-overline">Find your next favourite</span><h2>Shop by Category</h2></div><Link to="/items">View All Categories <span>→</span></Link></div>
          <div className="market-category-row">
            {categories.map(([icon, label, route]) => <Link key={label} to={`/category/${encodeURIComponent(route)}`} className="market-category"><span>{icon}</span><strong>{label}</strong><small>Explore now</small></Link>)}
            <Link to="/items" className="market-category market-category-more"><span>＋</span><strong>More Categories</strong><small>See everything</small></Link>
          </div>
        </section>

        <section className="market-promo-grid">
          {promos.map((promo) => <Link key={promo.eyebrow} to={promo.to} className={`market-promo ${promo.className}`}><div><span>{promo.eyebrow}</span><h3>{promo.title}</h3><p>{promo.copy}</p><b>{promo.action} <i>→</i></b></div><img src={promo.image} alt="" /></Link>)}
        </section>

        <section className="market-section market-deals">
          <div className="market-section-heading"><div><span className="market-overline">Picked for your neighbourhood</span><h2>Best Deals Near You <span className="fire">🔥</span></h2></div><Link to="/items">View All Deals <span>→</span></Link></div>
          <div className="market-deal-row">
            {deals.map((item, index) => <Link key={item._id} to={`/items/${item._id}`} className="market-deal"><div className="market-deal-image"><img src={item.imageUrl || item.images?.[0]} alt={item.title} /><span>{item.oldPrice ? `-${Math.round((1 - item.price / item.oldPrice) * 100)}%` : index === 0 ? 'NEW' : 'LOCAL'}</span></div><div className="market-deal-info"><small>{item.category || 'Local pick'}</small><h3>{item.title}</h3><strong>₹{Number(item.price || 0).toLocaleString()}</strong>{item.oldPrice && <del>₹{Number(item.oldPrice).toLocaleString()}</del>}<p>★ {item.rating || '4.8'} <span>· Popular nearby</span></p></div></Link>)}
          </div>
        </section>

        {recommended.length > 0 && <section className="market-section market-recommended">
          <div className="market-section-heading"><div><span className="market-overline">Selected for your area</span><h2>Recommended for Your Neighbourhood</h2></div><Link to="/items">View All <span>→</span></Link></div>
          <div className="market-deal-row">
            {recommended.map(item => <Link key={`recommended-${item._id}`} to={`/items/${item._id}`} className="market-deal"><div className="market-deal-image"><img src={item.imageUrl || item.images?.[0]} alt={item.title} /><span>LOCAL</span></div><div className="market-deal-info"><small>{item.category || 'Local pick'}</small><h3>{item.title}</h3><strong>₹{Number(item.price || 0).toLocaleString()}</strong><p>★ {item.rating || '4.8'} <span>· Nearby</span></p></div></Link>)}
          </div>
        </section>}

        {services.length > 0 && <section className="market-section market-services">
          <div className="market-section-heading"><div><span className="market-overline">Skilled help, close to home</span><h2>Popular Services Near You</h2></div><Link to="/services">View All Services <span>→</span></Link></div>
          <div className="market-service-grid">
            {services.map(service => <Link key={service._id} to={`/services/${service._id}`} className="market-service-card"><div className="market-service-image"><img src={service.imageUrl || service.images?.[0]} alt={service.title} /></div><div className="market-service-info"><h3>{service.title}</h3><p>{service.provider?.name || service.providerName || 'Local provider'}</p><span>★ {service.rating || '4.8'} · {service.location || 'Nearby'}</span><strong>From ₹{Number(service.price || 0).toLocaleString()}</strong></div></Link>)}
          </div>
        </section>}

        <section className="market-community">
          {[['📍', 'Local & Trusted', 'Verified sellers and service providers in your neighbourhood'], ['🌿', 'Best Prices', 'Unbeatable prices on products and services'], ['🛡️', 'Safe & Secure', 'Your safety and security are our priority'], ['👥', 'Community Driven', 'Building stronger neighbourhoods together']].map(([icon, title, copy]) => <div key={title}><span>{icon}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}
        </section>
      </main>

      <footer className="market-footer">
        <div className="market-footer-inner">
          <div><Link to="/" className="market-footer-brand">Neighbourhood<span>Market</span></Link><p>Your local marketplace for everyday finds, trusted services, and community connections.</p></div>
          <div><h3>About</h3><Link to="/home">About Us</Link><Link to="/chats">Contact</Link></div>
          <div><h3>Customer Support</h3><Link to="/chats">Help Center</Link><Link to="/login">Privacy</Link></div>
          <div><h3>For Sellers</h3><Link to="/register">Become a Seller</Link><Link to="/seller/dashboard">Seller Dashboard</Link></div>
        </div>
        <div className="market-footer-bottom">© 2026 NeighbourhoodMarket. Built for local communities.</div>
      </footer>
    </div>
  );
}
