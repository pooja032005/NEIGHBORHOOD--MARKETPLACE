import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/admin-analytics.css';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAnalytics();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/admin/stats/${activeTab}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      alert('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;

    switch (activeTab) {
      case 'products':
        return (
          <div className="analytics-content">
            <h2>📊 Product Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-section">
                <h3>🔥 Most Viewed</h3>
                <div className="product-list">
                  {data?.mostViewed?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="product-item">
                      <span>{item.product?.title}</span>
                      <span className="product-stat">{item.views} views</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <h3>❤️ Most Wishlisted</h3>
                <div className="product-list">
                  {data?.mostWishlisted?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="product-item">
                      <span>{item.product?.title}</span>
                      <span className="product-stat">{item.wishlistAdds} adds</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <h3>⭐ Best Sellers</h3>
                <div className="product-list">
                  {data?.bestSellers?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="product-item">
                      <span>{item.product?.title}</span>
                      <span className="product-stat">{item.purchases} purchases</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="analytics-content">
            <h2>👥 User Analytics</h2>
            <div className="users-stats">
              <div className="user-stat">
                <div className="user-stat-number">{data?.totalUsers || 0}</div>
                <div className="user-stat-label">Total Users</div>
              </div>
              <div className="user-stat">
                <div className="user-stat-number">{data?.buyers || 0}</div>
                <div className="user-stat-label">Buyers</div>
              </div>
              <div className="user-stat">
                <div className="user-stat-number">{data?.sellers || 0}</div>
                <div className="user-stat-label">Sellers</div>
              </div>
              <div className="user-stat">
                <div className="user-stat-number">{data?.admins || 0}</div>
                <div className="user-stat-label">Admins</div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Recent Users</h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers?.slice(0, 10).map(user => (
                  <tr key={user._id}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'sales':
        return (
          <div className="analytics-content">
            <h2>💰 Sales Analytics</h2>
            <div className="sales-stats">
              <div className="sales-stat">
                <div className="sales-stat-label">Total Revenue</div>
                <div className="sales-stat-number">₹{data?.totalRevenue || 0}</div>
              </div>
              <div className="sales-stat">
                <div className="sales-stat-label">Total Orders</div>
                <div className="sales-stat-number">{data?.totalOrders || 0}</div>
              </div>
              <div className="sales-stat">
                <div className="sales-stat-label">Average Order Value</div>
                <div className="sales-stat-number">₹{Math.round(data?.averageOrderValue || 0)}</div>
              </div>
            </div>

            <div className="order-status-grid">
              <div className="order-status-card">
                <div className="order-status-label">Delivered</div>
                <div className="order-status-number" style={{ color: '#10b981' }}>{data?.deliveredOrders || 0}</div>
              </div>
              <div className="order-status-card">
                <div className="order-status-label">Shipped</div>
                <div className="order-status-number" style={{ color: '#3b82f6' }}>{data?.shippedOrders || 0}</div>
              </div>
              <div className="order-status-card">
                <div className="order-status-label">Pending</div>
                <div className="order-status-number" style={{ color: '#f59e0b' }}>{data?.pendingOrders || 0}</div>
              </div>
              <div className="order-status-card">
                <div className="order-status-label">Cancelled</div>
                <div className="order-status-number" style={{ color: '#ef4444' }}>{data?.cancelledOrders || 0}</div>
              </div>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="analytics-content">
            <h2>📦 Category Analytics</h2>
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Avg Price</th>
                  <th>Total Views</th>
                </tr>
              </thead>
              <tbody>
                {data?.categoryStats?.map(cat => (
                  <tr key={cat.name}>
                    <td>{cat.name}</td>
                    <td>{cat.productCount}</td>
                    <td>₹{Math.round(cat.averagePrice)}</td>
                    <td>{cat.totalViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'sellers':
        return (
          <div className="analytics-content">
            <h2>🏪 Seller Analytics</h2>
            <div style={{ marginBottom: '30px' }}>
              <div className="seller-stat">
                <div>Total Sellers</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{data?.totalSellers || 0}</div>
              </div>
            </div>

            <h3>Top Sellers</h3>
            <table className="sellers-table">
              <thead>
                <tr>
                  <th>Seller Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Views</th>
                  <th>Purchases</th>
                </tr>
              </thead>
              <tbody>
                {data?.sellers?.slice(0, 15).map(seller => (
                  <tr key={seller._id}>
                    <td>{seller.name}</td>
                    <td>{seller.email}</td>
                    <td>{seller.productCount}</td>
                    <td>{seller.totalViews}</td>
                    <td>{seller.totalPurchases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-analytics-container">
      <div className="admin-analytics-header">
        <h1>📊 Admin Analytics Dashboard</h1>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          💰 Sales
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📦 Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('sellers')}
        >
          🏪 Sellers
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
