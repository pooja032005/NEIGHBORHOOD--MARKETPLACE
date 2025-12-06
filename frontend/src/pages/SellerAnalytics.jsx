import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/seller-analytics.css';

export default function SellerAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await client.get('/seller/dashboard');
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchAnalytics}>Retry</button>
      </div>
    );
  }

  if (!analytics) {
    return <div className="no-data">No analytics data available</div>;
  }

  return (
    <div className="seller-analytics-container">
      <div className="analytics-header">
        <h1>📈 Sales Analytics</h1>
        <button onClick={fetchAnalytics} className="refresh-btn">Refresh</button>
      </div>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-label">Total Products</div>
          <div className="card-value">{analytics.totalProducts || 0}</div>
          <div className="card-icon">📦</div>
        </div>
        <div className="analytics-card">
          <div className="card-label">Total Views</div>
          <div className="card-value">{analytics.totalViews || 0}</div>
          <div className="card-icon">👁️</div>
        </div>
        <div className="analytics-card">
          <div className="card-label">Wishlist Adds</div>
          <div className="card-value">{analytics.totalWishlistAdds || 0}</div>
          <div className="card-icon">❤️</div>
        </div>
        <div className="analytics-card">
          <div className="card-label">Total Purchases</div>
          <div className="card-value">{analytics.totalPurchases || 0}</div>
          <div className="card-icon">🛒</div>
        </div>
        <div className="analytics-card">
          <div className="card-label">Total Orders</div>
          <div className="card-value">{analytics.totalOrders || 0}</div>
          <div className="card-icon">📋</div>
        </div>
      </div>

      {/* Product Analytics Table */}
      {analytics.products && analytics.products.length > 0 && (
        <div className="products-analytics-section">
          <h2>Product Performance</h2>
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Wishlist</th>
                  <th>Purchases</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.products.map(product => {
                  const productAnalytics = analytics.analytics?.find(a => a.productId === product._id);
                  const views = productAnalytics?.views || 0;
                  const purchases = productAnalytics?.purchases || 0;
                  const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : 0;

                  return (
                    <tr key={product._id}>
                      <td className="product-name">{product.title}</td>
                      <td>₹{product.price}</td>
                      <td>{product.category}</td>
                      <td>{views}</td>
                      <td>{productAnalytics?.wishlistAdds || 0}</td>
                      <td>{purchases}</td>
                      <td className="conversion">
                        <span className={conversionRate > 5 ? 'high' : conversionRate > 2 ? 'medium' : 'low'}>
                          {conversionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Products Message */}
      {(!analytics.products || analytics.products.length === 0) && (
        <div className="no-products">
          <p>You haven't created any products yet.</p>
        </div>
      )}
    </div>
  );
}
