import React, { useEffect, useState } from 'react';
import client from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [viewerInterest, setViewerInterest] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [sellerPerformance, setSellerPerformance] = useState(null);
  const [viewTrends, setViewTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [usersList, setUsersList] = useState(null);

  useEffect(() => {
    // Verify user is admin
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      alert('Access denied: admin only');
      navigate('/login');
      return;
    }

    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        topRes,
        interestRes,
        categoryRes,
        sellerRes,
        trendsRes,
        usersRes,
      ] = await Promise.all([
        client.get('/admin/overview', { headers }),
        client.get('/admin/top-products?limit=5', { headers }),
        client.get('/admin/viewer-interest?days=30', { headers }),
        client.get('/admin/category-stats', { headers }),
        client.get('/admin/seller-performance?limit=5', { headers }),
        client.get('/admin/view-trends?days=7', { headers }),
        client.get('/users/admin/all-users', { headers }),
      ]);

      setOverview(overviewRes.data);
      setTopProducts(topRes.data);
      setViewerInterest(interestRes.data);
      setCategoryStats(categoryRes.data);
      setSellerPerformance(sellerRes.data);
      setViewTrends(trendsRes.data);
      setUsersList(usersRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await client.get('/users/admin/all-users', { headers });
      setUsersList(res.data || []);
    } catch (err) {
      console.error('Error fetching users', err);
      setUsersList([]);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>📊 Admin Dashboard</h1>
          <p>Monitor marketplace activity, product views, and user interests</p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <button onClick={() => navigate('/admin/management')} style={{padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease'}}>
            ⚙️ Manage Users & Items
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Overview Stats */}
      {selectedTab === 'overview' && overview && (
        <div className="admin-section">
          <h2>📈 Overview</h2>
          <div className="stats-grid">
            <div className="stat-card clickable" onClick={() => setSelectedTab('items')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Items</h3>
                <p className="stat-number">{overview.products?.items || 0}</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setSelectedTab('services-detail')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">🛠️</div>
              <div className="stat-content">
                <h3>Total Services</h3>
                <p className="stat-number">{overview.products?.services || 0}</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setSelectedTab('users-detail')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{overview.users?.total || 0}</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setSelectedTab('sellers-detail')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <h3>Sellers</h3>
                <p className="stat-number">{overview.users?.sellers || 0}</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setSelectedTab('buyers-detail')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3>Buyers</h3>
                <p className="stat-number">{overview.users?.buyers || 0}</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setSelectedTab('orders-detail')} style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>Total Orders</h3>
                <p className="stat-number">{overview.orders || 0}</p>
              </div>
            </div>
          </div>

          <div className="views-breakdown">
            <h3>📍 View Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-card">
                <p>Total Views</p>
                <p className="breakdown-number">{overview.views?.total || 0}</p>
              </div>
              <div className="breakdown-card buyer">
                <p>Buyer Views</p>
                <p className="breakdown-number">{overview.views?.byBuyers || 0}</p>
              </div>
              <div className="breakdown-card seller">
                <p>Seller Views</p>
                <p className="breakdown-number">{overview.views?.bySellers || 0}</p>
              </div>
              <div className="breakdown-card">
                <p>Anonymous Views</p>
                <p className="breakdown-number">{overview.views?.anonymous || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {selectedTab === 'products' && topProducts && (
        <div className="admin-section">
          <h2>⭐ Top Viewed Products</h2>
          <div className="top-products-grid">
            <div className="products-list">
              <h3>Top Items</h3>
              {topProducts.topItems?.length > 0 ? (
                <div className="product-table">
                  <div className="table-header">
                    <span>Title</span>
                    <span>Price</span>
                    <span>Views</span>
                  </div>
                  {topProducts.topItems.map((item, idx) => (
                    <div key={item._id} className="table-row">
                      <span className="rank">{idx + 1}</span>
                      <span>{item.title}</span>
                      <span>₹{item.price}</span>
                      <span className="views-badge">{item.viewCount} 👁️</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No item views yet</p>
              )}
            </div>

            <div className="products-list">
              <h3>Top Services</h3>
              {topProducts.topServices?.length > 0 ? (
                <div className="product-table">
                  <div className="table-header">
                    <span>Title</span>
                    <span>Price</span>
                    <span>Views</span>
                  </div>
                  {topProducts.topServices.map((service, idx) => (
                    <div key={service._id} className="table-row">
                      <span className="rank">{idx + 1}</span>
                      <span>{service.title}</span>
                      <span>₹{service.price}</span>
                      <span className="views-badge">{service.viewCount} 👁️</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No service views yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interest Analysis */}
      {selectedTab === 'interest' && viewerInterest && (
        <div className="admin-section">
          <h2>💡 Interest Analysis</h2>
          <div className="interest-grid">
            <div className="interest-card">
              <h3>Views by User Type</h3>
              {viewerInterest.roleBreakdown?.length > 0 ? (
                <div className="interest-list">
                  {viewerInterest.roleBreakdown.map((role) => (
                    <div key={role._id} className="interest-item">
                      <span className="role-label">{role._id?.toUpperCase() || 'Unknown'}</span>
                      <span className="interest-bar">
                        <span
                          className="interest-fill"
                          style={{
                            width: `${
                              (role.count /
                                Math.max(
                                  ...viewerInterest.roleBreakdown.map((r) => r.count)
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </span>
                      <span className="interest-count">{role.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No data yet</p>
              )}
            </div>

            <div className="interest-card">
              <h3>Views by Product Type</h3>
              {viewerInterest.productTypeBreakdown?.length > 0 ? (
                <div className="interest-list">
                  {viewerInterest.productTypeBreakdown.map((type) => (
                    <div key={type._id} className="interest-item">
                      <span className="role-label">{type._id}s</span>
                      <span className="interest-bar">
                        <span
                          className="interest-fill"
                          style={{
                            width: `${
                              (type.count /
                                Math.max(
                                  ...viewerInterest.productTypeBreakdown.map(
                                    (t) => t.count
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </span>
                      <span className="interest-count">{type.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Stats */}
      {selectedTab === 'categories' && categoryStats && (
        <div className="admin-section">
          <h2>🏷️ Category Performance</h2>
          <div className="category-grid">
            <div className="category-list">
              <h3>Item Categories</h3>
              {categoryStats.itemCategories?.length > 0 ? (
                <div className="category-table">
                  {categoryStats.itemCategories.map((cat) => (
                    <div key={cat._id} className="category-row">
                      <span className="cat-name">{cat._id || 'Uncategorized'}</span>
                      <span className="cat-views">{cat.viewCount} views</span>
                      <span className="cat-price">Avg: ₹{Math.round(cat.avgPrice)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No data yet</p>
              )}
            </div>

            <div className="category-list">
              <h3>Service Categories</h3>
              {categoryStats.serviceCategories?.length > 0 ? (
                <div className="category-table">
                  {categoryStats.serviceCategories.map((cat) => (
                    <div key={cat._id} className="category-row">
                      <span className="cat-name">{cat._id || 'Uncategorized'}</span>
                      <span className="cat-views">{cat.viewCount} views</span>
                      <span className="cat-price">Avg: ₹{Math.round(cat.avgPrice)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Performance */}
      {selectedTab === 'sellers' && sellerPerformance && (
        <div className="admin-section">
          <h2>🏪 Top Seller Performance</h2>
          {sellerPerformance.sellerItemViews?.length > 0 ? (
            <div className="seller-table">
              <div className="table-header">
                <span>Seller</span>
                <span>Total Views</span>
                <span>Products</span>
              </div>
              {sellerPerformance.sellerItemViews.map((seller, idx) => (
                <div key={seller._id} className="table-row">
                  <span className="rank">{idx + 1}</span>
                  <span className="seller-name">{seller.sellerName}</span>
                  <span className="views-badge">{seller.totalViews} 👁️</span>
                  <span>{seller.totalProducts} products</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No seller data yet</p>
          )}
        </div>
      )}

      {/* View Trends */}
      {selectedTab === 'trends' && viewTrends && (
        <div className="admin-section">
          <h2>📊 7-Day View Trends</h2>
          {viewTrends?.length > 0 ? (
            <div className="trends-chart">
              {viewTrends.map((day) => (
                <div key={day._id} className="trend-bar">
                  <div className="trend-info">
                    <span className="trend-date">{day._id}</span>
                    <div className="trend-details">
                      <span className="total">📊 {day.count}</span>
                      <span className="buyers">🛒 {day.buyers}</span>
                      <span className="sellers">🏪 {day.sellers}</span>
                    </div>
                  </div>
                  <div className="trend-visual">
                    <div
                      className="trend-fill"
                      style={{
                        width: `${
                          (day.count / Math.max(...viewTrends.map((t) => t.count))) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No trend data yet</p>
          )}
        </div>
      )}

      {/* Items Detail View */}
      {selectedTab === 'items' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>📦 All Items Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          {topProducts && topProducts.allItems?.length > 0 ? (
            <div className="products-detail-list">
              <div className="product-table">
                <div className="table-header">
                  <span>Title</span>
                  <span>Seller</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Views</span>
                  <span>Status</span>
                </div>
                {topProducts.allItems?.map((item) => (
                  <div key={item._id} className="table-row">
                    <span><strong>{item.title}</strong></span>
                    <span>{item.sellerId?.name || 'Unknown'}</span>
                    <span>{item.category}</span>
                    <span>₹{item.price}</span>
                    <span className="views-badge">{item.viewCount || 0} 👁️</span>
                    <span><span style={{padding: '4px 10px', background: '#10b981', color: 'white', borderRadius: '4px', fontSize: '12px'}}>✅ Active</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No items data available</p>
          )}
        </div>
      )}

      {/* Services Detail View */}
      {selectedTab === 'services-detail' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>🛠️ All Services Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          {topProducts && topProducts.allServices?.length > 0 ? (
            <div className="products-detail-list">
              <div className="product-table">
                <div className="table-header">
                  <span>Title</span>
                  <span>Provider</span>
                  <span>Category</span>
                  <span>Price/hr</span>
                  <span>Views</span>
                  <span>Status</span>
                </div>
                {topProducts.allServices?.map((service) => (
                  <div key={service._id} className="table-row">
                    <span><strong>{service.title}</strong></span>
                    <span>{service.sellerId?.name || 'Unknown'}</span>
                    <span>{service.category}</span>
                    <span>₹{service.price}</span>
                    <span className="views-badge">{service.viewCount || 0} 👁️</span>
                    <span><span style={{padding: '4px 10px', background: '#10b981', color: 'white', borderRadius: '4px', fontSize: '12px'}}>✅ Active</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No services data available</p>
          )}
        </div>
      )}

      {/* Users Detail View */}
      {selectedTab === 'users-detail' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>👥 All Users Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          {usersList && usersList.length > 0 ? (
            <div className="products-detail-list">
              <div className="product-table">
                <div className="table-header">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Phone</span>
                  <span>Status</span>
                  <span>Joined</span>
                </div>
                {usersList?.map((user) => (
                  <div key={user._id} className="table-row">
                    <span><strong>{user.name}</strong></span>
                    <span>{user.email}</span>
                    <span><span style={{padding: '4px 10px', background: user.role === 'admin' ? '#ef4444' : user.role === 'seller' ? '#f59e0b' : '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase'}}>{user.role}</span></span>
                    <span>{user.phone || 'N/A'}</span>
                    <span><span style={{padding: '4px 10px', background: user.blocked ? '#ef4444' : '#10b981', color: 'white', borderRadius: '4px', fontSize: '12px'}}>{user.blocked ? '🔒 Blocked' : '✅ Active'}</span></span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No users data available</p>
          )}
        </div>
      )}

      {/* Sellers Detail View */}
      {selectedTab === 'sellers-detail' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>🏪 Sellers Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          {usersList && usersList.filter(u => u.role === 'seller').length > 0 ? (
            <div className="products-detail-list">
              <div className="product-table">
                <div className="table-header">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Status</span>
                  <span>Joined</span>
                </div>
                {usersList?.filter(u => u.role === 'seller').map((seller) => (
                  <div key={seller._id} className="table-row">
                    <span><strong>{seller.name}</strong></span>
                    <span>{seller.email}</span>
                    <span>{seller.phone || 'N/A'}</span>
                    <span><span style={{padding: '4px 10px', background: seller.blocked ? '#ef4444' : '#10b981', color: 'white', borderRadius: '4px', fontSize: '12px'}}>{seller.blocked ? '🔒 Blocked' : '✅ Active'}</span></span>
                    <span>{new Date(seller.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No sellers data available</p>
          )}
        </div>
      )}

      {/* Buyers Detail View */}
      {selectedTab === 'buyers-detail' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>🛒 Buyers Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          {usersList && usersList.filter(u => u.role === 'buyer').length > 0 ? (
            <div className="products-detail-list">
              <div className="product-table">
                <div className="table-header">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Status</span>
                  <span>Joined</span>
                </div>
                {usersList?.filter(u => u.role === 'buyer').map((buyer) => (
                  <div key={buyer._id} className="table-row">
                    <span><strong>{buyer.name}</strong></span>
                    <span>{buyer.email}</span>
                    <span>{buyer.phone || 'N/A'}</span>
                    <span><span style={{padding: '4px 10px', background: buyer.blocked ? '#ef4444' : '#10b981', color: 'white', borderRadius: '4px', fontSize: '12px'}}>{buyer.blocked ? '🔒 Blocked' : '✅ Active'}</span></span>
                    <span>{new Date(buyer.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No buyers data available</p>
          )}
        </div>
      )}

      {/* Orders Detail View */}
      {selectedTab === 'orders-detail' && (
        <div className="admin-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>📋 Orders Details</h2>
            <button onClick={() => setSelectedTab('overview')} style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Back to Overview
            </button>
          </div>
          <p style={{padding: '15px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280'}}>📊 Total orders in the system: <strong>{overview?.orders || 0}</strong></p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button
          className={`nav-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`nav-btn ${selectedTab === 'products' ? 'active' : ''}`}
          onClick={() => setSelectedTab('products')}
        >
          ⭐ Top Products
        </button>
        <button
          className={`nav-btn ${selectedTab === 'interest' ? 'active' : ''}`}
          onClick={() => setSelectedTab('interest')}
        >
          💡 Interest
        </button>
        <button
          className={`nav-btn ${selectedTab === 'categories' ? 'active' : ''}`}
          onClick={() => setSelectedTab('categories')}
        >
          🏷️ Categories
        </button>
        <button
          className={`nav-btn ${selectedTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setSelectedTab('sellers')}
        >
          🏪 Sellers
        </button>
        <button
          className={`nav-btn ${selectedTab === 'trends' ? 'active' : ''}`}
          onClick={() => setSelectedTab('trends')}
        >
          📊 Trends
        </button>
        <button
          className={`nav-btn ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={async () => { setSelectedTab('users'); await fetchUsers(); }}
        >
          👥 Users
        </button>
      </div>
      
      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="admin-section">
          <h2>👥 All Users</h2>
          {usersList === null ? (
            <p>Loading users...</p>
          ) : usersList.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Password</span>
                <span>Actions</span>
              </div>
              {usersList.map((u) => (
                <div key={u._id} className="table-row">
                  <span>{u.name || '-'}</span>
                  <span>{u.email || '-'}</span>
                  <span>{u.role || '-'}</span>
                  <span>********</span>
                  <span>
                    <button onClick={async () => {
                      const newPw = prompt('Set new password for ' + (u.email || u._id) + '\nEnter new password:');
                      if (!newPw) return;
                      try {
                        const token = localStorage.getItem('token');
                        await client.post('/users/admin/set-password', { userId: u._id, newPassword: newPw }, { headers: { Authorization: `Bearer ${token}` } });
                        alert('Password updated');
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to update password');
                      }
                    }}>
                      Set Password
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
