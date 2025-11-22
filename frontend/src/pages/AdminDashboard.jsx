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
      ] = await Promise.all([
        client.get('/admin/overview', { headers }),
        client.get('/admin/top-products?limit=5', { headers }),
        client.get('/admin/viewer-interest?days=30', { headers }),
        client.get('/admin/category-stats', { headers }),
        client.get('/admin/seller-performance?limit=5', { headers }),
        client.get('/admin/view-trends?days=7', { headers }),
      ]);

      setOverview(overviewRes.data);
      setTopProducts(topRes.data);
      setViewerInterest(interestRes.data);
      setCategoryStats(categoryRes.data);
      setSellerPerformance(sellerRes.data);
      setViewTrends(trendsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
      console.error(err);
    } finally {
      setLoading(false);
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
        <h1>📊 Admin Dashboard</h1>
        <p>Monitor marketplace activity, product views, and user interests</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Overview Stats */}
      {selectedTab === 'overview' && overview && (
        <div className="admin-section">
          <h2>📈 Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Items</h3>
                <p className="stat-number">{overview.products?.items || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛠️</div>
              <div className="stat-content">
                <h3>Total Services</h3>
                <p className="stat-number">{overview.products?.services || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{overview.users?.total || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <h3>Sellers</h3>
                <p className="stat-number">{overview.users?.sellers || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3>Buyers</h3>
                <p className="stat-number">{overview.users?.buyers || 0}</p>
              </div>
            </div>
            <div className="stat-card">
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
      </div>
    </div>
  );
}
