import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/seller-dashboard.css';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('dashboard'); // 'dashboard', 'products', 'views', 'wishlist', 'purchases', 'orders'

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
      setStats(res.data || {
        totalProducts: 0,
        totalViews: 0,
        totalWishlistAdds: 0,
        totalPurchases: 0,
        totalOrders: 0,
        products: [],
        analytics: []
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setStats({
        totalProducts: 0,
        totalViews: 0,
        totalWishlistAdds: 0,
        totalPurchases: 0,
        totalOrders: 0,
        products: [],
        analytics: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="loading">No data available</div>;

  // Helper function to render product list with different metrics highlighted
  const renderProductList = () => {
    if (viewType === 'products') {
      return (
        <div className="products-section">
          <button className="btn-back" onClick={() => setViewType('dashboard')}>← Back to Dashboard</button>
          <h2>📦 All Products</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.map(product => (
                  <tr key={product._id}>
                    <td>{product.title}</td>
                    <td>₹{product.price}</td>
                    <td>{product.category}</td>
                    <td>
                      <Link to={`/seller/products/${product._id}/edit`} className="btn-edit">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (viewType === 'views') {
      return (
        <div className="products-section">
          <button className="btn-back" onClick={() => setViewType('dashboard')}>← Back to Dashboard</button>
          <h2>👁️ Products by Views</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Views</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.sort((a, b) => {
                  const analyticsA = stats.analytics.find(a => a.productId === a._id) || {};
                  const analyticsB = stats.analytics.find(a => a.productId === b._id) || {};
                  return (analyticsB.views || 0) - (analyticsA.views || 0);
                }).map(product => {
                  const analytics = stats.analytics.find(a => a.productId === product._id) || {};
                  return (
                    <tr key={product._id}>
                      <td>{product.title}</td>
                      <td className="highlight">{analytics.views || 0}</td>
                      <td>₹{product.price}</td>
                      <td>{product.category}</td>
                      <td>
                        <Link to={`/seller/products/${product._id}/edit`} className="btn-edit">Edit</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (viewType === 'wishlist') {
      return (
        <div className="products-section">
          <button className="btn-back" onClick={() => setViewType('dashboard')}>← Back to Dashboard</button>
          <h2>❤️ Products in Wishlist</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Wishlist Count</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.sort((a, b) => {
                  const analyticsA = stats.analytics.find(a => a.productId === a._id) || {};
                  const analyticsB = stats.analytics.find(a => a.productId === b._id) || {};
                  return (analyticsB.wishlistAdds || 0) - (analyticsA.wishlistAdds || 0);
                }).map(product => {
                  const analytics = stats.analytics.find(a => a.productId === product._id) || {};
                  return (
                    <tr key={product._id}>
                      <td>{product.title}</td>
                      <td className="highlight">{analytics.wishlistAdds || 0}</td>
                      <td>₹{product.price}</td>
                      <td>{product.category}</td>
                      <td>
                        <Link to={`/seller/products/${product._id}/edit`} className="btn-edit">Edit</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (viewType === 'purchases') {
      return (
        <div className="products-section">
          <button className="btn-back" onClick={() => setViewType('dashboard')}>← Back to Dashboard</button>
          <h2>🛍️ Most Purchased Products</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Purchases</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.sort((a, b) => {
                  const analyticsA = stats.analytics.find(a => a.productId === a._id) || {};
                  const analyticsB = stats.analytics.find(a => a.productId === b._id) || {};
                  return (analyticsB.purchases || 0) - (analyticsA.purchases || 0);
                }).map(product => {
                  const analytics = stats.analytics.find(a => a.productId === product._id) || {};
                  return (
                    <tr key={product._id}>
                      <td>{product.title}</td>
                      <td className="highlight">{analytics.purchases || 0}</td>
                      <td>₹{product.price}</td>
                      <td>{product.category}</td>
                      <td>
                        <Link to={`/seller/products/${product._id}/edit`} className="btn-edit">Edit</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (viewType === 'orders') {
      return (
        <div className="products-section">
          <button className="btn-back" onClick={() => setViewType('dashboard')}>← Back to Dashboard</button>
          <h2>📋 Products with Orders</h2>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Buyer Name</th>
                  <th>Buyer Email</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders && stats.orders.length > 0 ? (
                  stats.orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.itemName || 'N/A'}</td>
                      <td>{order.buyerName || order.deliveryAddress?.name || 'N/A'}</td>
                      <td>{order.buyerEmail || order.deliveryAddress?.email || 'N/A'}</td>
                      <td className="highlight">{order.quantity || 1}</td>
                      <td>₹{order.totalPrice || 0}</td>
                      <td>
                        <span className={`status-badge ${order.orderStatus}`}>
                          {order.orderStatus || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  // Show product list views
  if (viewType !== 'dashboard') {
    return <div className="seller-dashboard-container">{renderProductList()}</div>;
  }

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <h1>📊 Seller Dashboard</h1>
        <Link to="/seller/add-product" className="btn-add-product">+ Add New Product</Link>
      </div>

      {/* Stats Cards - Now Clickable */}
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => setViewType('products')}>
          <div className="stat-number">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card clickable" onClick={() => setViewType('views')}>
          <div className="stat-number">{stats?.totalViews || 0}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card clickable" onClick={() => setViewType('wishlist')}>
          <div className="stat-number">{stats?.totalWishlistAdds || 0}</div>
          <div className="stat-label">Wishlist Adds</div>
        </div>
        <div className="stat-card clickable" onClick={() => setViewType('purchases')}>
          <div className="stat-number">{stats?.totalPurchases || 0}</div>
          <div className="stat-label">Purchases</div>
        </div>
        <div className="stat-card clickable" onClick={() => setViewType('orders')}>
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
                        <Link to={`/seller/products/${product._id}/edit`} className="btn-edit">Edit</Link>
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
