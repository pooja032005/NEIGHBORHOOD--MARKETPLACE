import React, { useEffect, useState } from 'react';
import client from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/profile.css';

export default function Profile(){
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  const [myItems, setMyItems] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    if (!stored?.id && !stored?._id) {
      navigate('/login');
      return;
    }
    
    const id = stored.id || stored._id;
    
    // Fetch user details
    client.get('/users/profile').then(res => {
      setUserDetails(res.data);
    }).catch(() => {});

    Promise.all([
      client.get('/items').then(res => {
        const filtered = res.data.filter(i => String(i.owner._id || i.owner) === String(id));
        setMyItems(filtered);
      }).catch(()=>{}),
      client.get('/services').then(res => {
        const filtered = res.data.filter(s => String(s.provider._id || s.provider) === String(id));
        setMyServices(filtered);
      }).catch(()=>{})
    ]).finally(() => setLoading(false));
  }, [stored, navigate]);

  const isSeller = stored?.role === 'seller';
  const avatarLetter = userDetails?.name?.charAt(0).toUpperCase() || 'U';

  if (loading) return <div className="loading">⏳ Loading...</div>;

  return (
    <div className="profile-container">
      
      {/* ===== PROFILE HEADER WITH EDIT ===== */}
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-avatar">
            {avatarLetter}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{userDetails.name || 'User'}</h1>
            <p className="profile-email">📧 {userDetails.email || 'N/A'}</p>
            {userDetails.phone && <p className="profile-phone">📞 {userDetails.phone}</p>}
            {userDetails.city && <p className="profile-city">📍 {userDetails.city}</p>}
            
            <div className="role-badge-container">
              <span className={`role-badge ${isSeller ? 'seller' : 'buyer'}`}>
                {isSeller ? '🏪 Seller' : '👤 Buyer'}
              </span>
            </div>
          </div>
          <Link to="/profile/edit" className="btn-edit">
            ✏️ Edit Profile
          </Link>
        </div>
      </div>

      {/* ===== YOUR ITEMS SECTION ===== */}
      <section className="profile-section">
        <div className="section-header">
          <h2>📦 Your Items ({myItems.length})</h2>
          <Link to="/items/create" className="btn-add-new">
            + Post New Item
          </Link>
        </div>

        {myItems.length > 0 ? (
          <div className="items-grid">
            {myItems.map(item => (
              <Link key={item._id} to={`/items/${item._id}`} className="item-card">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                  ) : (
                    <div className="image-placeholder">📸</div>
                  )}
                  <span className="item-category">{item.category}</span>
                </div>
                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p className="item-price">₹{item.price?.toLocaleString()}</p>
                  <p className="item-status">
                    {item.status === 'sold' ? '❌ Sold' : '✓ Available'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 No items posted yet</p>
            <Link to="/items/create" className="btn-primary-full">
              Start Selling
            </Link>
          </div>
        )}
      </section>

      {/* ===== YOUR SERVICES SECTION ===== */}
      <section className="profile-section">
        <div className="section-header">
          <h2>🔧 Your Services ({myServices.length})</h2>
          <Link to="/services/create" className="btn-add-new">
            + Offer Service
          </Link>
        </div>

        {myServices.length > 0 ? (
          <div className="services-grid">
            {myServices.map(service => (
              <Link key={service._id} to={`/services/${service._id}`} className="service-card">
                <div className="service-image">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} />
                  ) : (
                    <div className="image-placeholder">🔧</div>
                  )}
                  <span className="service-category">{service.category}</span>
                </div>
                <div className="service-info">
                  <h3>{service.title}</h3>
                  <p className="service-price">₹{service.price} {service.priceType}</p>
                  <p className="service-desc">{service.description?.substring(0, 40)}...</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 No services offered yet</p>
            <Link to="/services/create" className="btn-primary-full">
              Start Offering Services
            </Link>
          </div>
        )}
      </section>

      {/* ===== SELLER DASHBOARD LINK ===== */}
      {isSeller && (
        <section className="profile-section">
          <div className="seller-panel">
            <div className="seller-icon">🏪</div>
            <div className="seller-content">
              <h3>Seller Dashboard</h3>
              <p>Manage your shop and settings</p>
            </div>
            <Link to="/admin" className="btn-dashboard">
              Go to Dashboard →
            </Link>
          </div>
        </section>
      )}

      {/* ===== LOGOUT ===== */}
      <section className="profile-section">
        <button 
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          className="btn-logout"
        >
          🚪 Logout
        </button>
      </section>
    </div>
  );
}
