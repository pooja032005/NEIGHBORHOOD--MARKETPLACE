import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/buyer-dashboard.css';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        client.get('/orders', { headers: { Authorization: `Bearer ${token}` } }),
        client.get('/user-actions/wishlist', { headers: { Authorization: `Bearer ${token}` } }),
        client.get('/user-actions/cart', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setOrders(ordersRes.data || []);
      setWishlist(wishlistRes.data?.wishlist || []);
      setCart(cartRes.data?.cart || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Count delivered orders
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;

  return (
    <div className="buyer-dashboard-container">
      <div className="buyer-dashboard-header">
        <div>
          <h1>👤 Buyer Dashboard</h1>
          <p className="welcome-text">Welcome, {user?.name || 'Guest'}!</p>
        </div>
        <div className="header-actions">
          <Link to="/items" className="btn-browse-products">🛍️ Browse Products</Link>
          <Link to="/buyer/dashboard/settings" className="btn-settings">⚙️ Settings</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-number">{deliveredCount}</div>
          <div className="stat-label">Delivered</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-number">{wishlist.length}</div>
          <div className="stat-label">Wishlist Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-number">{cart.length}</div>
          <div className="stat-label">Cart Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-number">₹{totalSpent.toLocaleString()}</div>
          <div className="stat-label">Total Spent</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/cart" className="quick-link">🛒 My Cart</Link>
        <Link to="/wishlist" className="quick-link">❤️ My Wishlist</Link>
        <Link to="/orders" className="quick-link">📋 My Orders</Link>
        <Link to="/profile" className="quick-link">👤 My Profile</Link>
      </div>

      {/* Recent Orders Section */}
      {orders.length > 0 && (
        <div className="orders-section">
          <h2>📦 Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(0, 8)}...</td>
                    <td className="price">₹{order.totalPrice.toLocaleString()}</td>
                    <td className={`status status-${order.orderStatus}`}>
                      {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending'}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length > 5 && (
            <Link to="/orders" className="btn-view-all">View All Orders →</Link>
          )}
        </div>
      )}

      {/* Wishlist Section */}
      {wishlist.length > 0 && (
        <div className="wishlist-section">
          <h2>❤️ Your Wishlist ({wishlist.length})</h2>
          <div className="wishlist-grid">
            {wishlist.slice(0, 6).map(item => (
              <div key={item.item?._id} className="wishlist-card">
                <div className="wishlist-image">
                  <img src={item.item?.imageUrl || '/placeholder.png'} alt={item.item?.title} />
                </div>
                <div className="wishlist-details">
                  <h4>{item.item?.title}</h4>
                  <p className="seller">By {item.item?.owner?.name || 'Unknown'}</p>
                  <p className="price">₹{item.item?.price.toLocaleString()}</p>
                  <button 
                    className="btn-add-to-cart"
                    onClick={() => navigate(`/items/${item.item?._id}`)}
                  >
                    View Item
                  </button>
                </div>
              </div>
            ))}
          </div>
          {wishlist.length > 6 && (
            <Link to="/wishlist" className="btn-view-all">View All Wishlist Items →</Link>
          )}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && wishlist.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h3>Start Shopping!</h3>
          <p>You haven't placed any orders yet. Browse our marketplace to find great deals.</p>
          <Link to="/items" className="btn-start-shopping">Browse Products</Link>
        </div>
      )}
    </div>
  );
}
