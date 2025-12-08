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

  const role = (userDetails && userDetails.role) || stored?.role || 'buyer';
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';
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
            {role && (
              <p className="profile-account-type">{role === 'seller' ? '🏪 Seller' : role === 'admin' ? '👑 Admin' : '👤 Buyer'}</p>
            )}
            <p className="profile-email">📧 {userDetails.email || 'N/A'}</p>
            {userDetails.phone && <p className="profile-phone">📞 {userDetails.phone}</p>}
            {userDetails.city && <p className="profile-city">📍 {userDetails.city}</p>}
            
            {/* account type moved under name */}
          </div>
          <Link to="/profile/edit" className="btn-edit">
            ✏️ Edit Profile
          </Link>
        </div>
      </div>

      {/* Items and Services removed from Profile per user request */}

      {/* ===== SELLER DASHBOARD LINK ===== */}
      {isSeller && (
        <section className="profile-section">
          <div className="seller-panel">
            <div className="seller-left">
              <div className="seller-icon">🏪</div>
              <div className="seller-content">
                <h3>Seller Dashboard</h3>
                <p className="seller-sub">Manage your shop, listings and analytics</p>
              </div>
            </div>
            <div className="seller-actions">
              <Link to="/seller/dashboard" className="btn-dashboard">
                📊 View Dashboard
              </Link>
              <Link to="/profile/edit" className="btn-edit-dashboard">
                ⚙️ Edit Settings
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== ADMIN DASHBOARD LINK ===== */}
      {isAdmin && (
        <section className="profile-section">
          <div className="buyer-panel">
            <div className="buyer-left">
              <div className="buyer-icon">👑</div>
              <div className="buyer-content">
                <h3>Admin Dashboard</h3>
                <p className="buyer-sub">Monitor marketplace activity and manage platform</p>
              </div>
            </div>
            <div className="buyer-actions">
              <Link to="/admin/dashboard" className="btn-dashboard">
                📊 View Dashboard
              </Link>
              <Link to="/profile/edit" className="btn-edit-dashboard">
                ⚙️ Edit Settings
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== BUYER DASHBOARD LINK ===== */}
      {!isSeller && !isAdmin && (
        <section className="profile-section">
          <div className="buyer-panel">
            <div className="buyer-left">
              <div className="buyer-icon">👤</div>
              <div className="buyer-content">
                <h3>Buyer Dashboard</h3>
                <p className="buyer-sub">View your orders, wishlist and spending</p>
              </div>
            </div>
            <div className="buyer-actions">
              <Link to="/buyer/dashboard" className="btn-dashboard">
                📊 View Dashboard
              </Link>
              <Link to="/profile/edit" className="btn-edit-dashboard">
                ⚙️ Edit Settings
              </Link>
            </div>
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
