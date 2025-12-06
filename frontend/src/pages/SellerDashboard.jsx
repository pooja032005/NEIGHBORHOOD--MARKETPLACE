import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/seller-dashboard.css';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await client.get('/seller/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <h1>📊 Seller Dashboard</h1>
        <Link to="/seller/add-product" className="btn-add-product">+ Add New Product</Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalViews || 0}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalWishlistAdds || 0}</div>
          <div className="stat-label">Wishlist Adds</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalPurchases || 0}</div>
          <div className="stat-label">Purchases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/seller/products" className="quick-link">📦 Manage Products</Link>
        <Link to="/seller/orders" className="quick-link">📋 View Orders</Link>
        <Link to="/seller/analytics" className="quick-link">📈 Analytics</Link>
      </div>

      {/* Products Table */}
      {stats?.products && stats.products.length > 0 && (
        <div className="products-section">
          <h2>Your Products</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Wishlist</th>
                  <th>Purchases</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.slice(0, 10).map(product => {
                  const analytics = stats.analytics.find(a => a.productId === product._id);
                  return (
                    <tr key={product._id}>
                      <td>{product.title}</td>
                      <td>₹{product.price}</td>
                      <td>{product.category}</td>
                      <td>{analytics?.views || 0}</td>
                      <td>{analytics?.wishlistAdds || 0}</td>
                      <td>{analytics?.purchases || 0}</td>
                      <td>
                        <Link to={`/seller/edit/${product._id}`} className="btn-edit">Edit</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
