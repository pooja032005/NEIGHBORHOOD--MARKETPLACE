import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';
import ChatButton from '../components/ChatButton';
import '../styles/admin-management.css';

export default function AdminManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, itemsRes, servicesRes, statsRes, pendingItemsRes, pendingServicesRes] = await Promise.all([
        client.get('/admin-management/users', { headers }),
        client.get('/admin-management/items', { headers }),
        client.get('/admin-management/services', { headers }),
        client.get('/admin-management/stats', { headers }),
        client.get('/admin-management/items/pending', { headers }),
        client.get('/admin-management/services/pending', { headers }),
      ]);

      setUsers(usersRes.data || []);
      setItems(itemsRes.data || []);
      setServices(servicesRes.data || []);
      setStats(statsRes.data);
      setPendingItems(pendingItemsRes.data || []);
      setPendingServices(pendingServicesRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm('Block this user?')) {
      try {
        setProcessingId(userId);
        const token = localStorage.getItem('token');
        await client.post(`/admin-management/users/${userId}/block`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllData();
      } catch (err) {
        alert('Error blocking user: ' + (err.response?.data?.message || 'Unknown error'));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleUnblockUser = async (userId) => {
    if (window.confirm('Unblock this user?')) {
      try {
        setProcessingId(userId);
        const token = localStorage.getItem('token');
        await client.post(`/admin-management/users/${userId}/unblock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllData();
      } catch (err) {
        alert('Error unblocking user: ' + (err.response?.data?.message || 'Unknown error'));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user permanently? This cannot be undone.')) {
      try {
        setProcessingId(userId);
        const token = localStorage.getItem('token');
        await client.delete(`/admin-management/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllData();
      } catch (err) {
        alert('Error deleting user: ' + (err.response?.data?.message || 'Unknown error'));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      setProcessingId(itemId);
      const token = localStorage.getItem('token');
      await client.post(`/admin-management/items/${itemId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error approving item: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      setProcessingId(itemId);
      const token = localStorage.getItem('token');
      await client.post(`/admin-management/items/${itemId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error rejecting item: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Find the item by id and check if it matches 'laptop' and owner is 'Unknown'
    const item = items.find(i => i._id === itemId);
    if (item && item.title.toLowerCase() === 'laptop' && (item.sellerId?.name === 'Unknown' || item.owner?.name === 'Unknown')) {
      if (window.confirm('Delete the item "laptop" by Unknown user?')) {
        try {
          setProcessingId(itemId);
          const token = localStorage.getItem('token');
          await client.delete(`/admin-management/items/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchAllData();
        } catch (err) {
          alert('Error deleting item: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
          setProcessingId(null);
        }
      }
    } else {
      if (window.confirm('Delete this item?')) {
        try {
          setProcessingId(itemId);
          const token = localStorage.getItem('token');
          await client.delete(`/admin-management/items/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchAllData();
        } catch (err) {
          alert('Error deleting item: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
          setProcessingId(null);
        }
      }
    }
  };

  const handleApproveService = async (serviceId) => {
    try {
      setProcessingId(serviceId);
      const token = localStorage.getItem('token');
      await client.post(`/admin-management/services/${serviceId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error approving service: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectService = async (serviceId) => {
    try {
      setProcessingId(serviceId);
      const token = localStorage.getItem('token');
      await client.post(`/admin-management/services/${serviceId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error rejecting service: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Delete this service?')) {
      try {
        setProcessingId(serviceId);
        const token = localStorage.getItem('token');
        await client.delete(`/admin-management/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllData();
      } catch (err) {
        alert('Error deleting service: ' + (err.response?.data?.message || 'Unknown error'));
      } finally {
        setProcessingId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sellerItems = selectedSeller ? items.filter(i => i.sellerId?._id === selectedSeller._id) : [];
  const sellerServices = selectedSeller ? services.filter(s => s.sellerId?._id === selectedSeller._id) : [];
  const sellers = users.filter(u => u.role === 'seller');

  if (loading) return <div className="admin-management-loading">Loading management data...</div>;

  return (
    <div className="admin-management-container">
      <div className="admin-mgmt-header">
        <div>
          <h1>⚙️ Management Dashboard</h1>
          <p className="mgmt-subtitle">Manage users, items, and services</p>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back-admin">
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* Stats Overview */}
      {stats && (
        <div className="mgmt-stats">
          <div className="stat-box">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalSellers}</div>
            <div className="stat-label">Sellers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalBuyers}</div>
            <div className="stat-label">Buyers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalItems}</div>
            <div className="stat-label">Items</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{pendingItems.length}</div>
            <div className="stat-label">Pending Items</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalServices}</div>
            <div className="stat-label">Services</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mgmt-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending-items' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pending-items'); setSearchTerm(''); }}
        >
          📋 Pending Items ({pendingItems.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => { setActiveTab('items'); setSearchTerm(''); }}
        >
          📦 All Items ({items.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending-services' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pending-services'); setSearchTerm(''); }}
        >
          🎯 Pending Services ({pendingServices.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => { setActiveTab('services'); setSearchTerm(''); }}
        >
          🔧 All Services ({services.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'seller-products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('seller-products'); setSearchTerm(''); setSelectedSeller(null); }}
        >
          🏪 Seller Products
        </button>
      </div>

      {/* Search Bar */}
      <div className="mgmt-search">
        <input
          type="text"
          placeholder="🔍 Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {activeTab === 'users' && (
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        )}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>User Management</h2>
          {filteredUsers.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                        {user.blocked ? '🔒 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="action-btns">
                      {user.blocked ? (
                        <button
                          className="btn-action btn-unblock"
                          onClick={() => handleUnblockUser(user._id)}
                          disabled={processingId === user._id}
                        >
                          {processingId === user._id ? '⏳' : '🔓 Unblock'}
                        </button>
                      ) : (
                        <button
                          className="btn-action btn-block"
                          onClick={() => handleBlockUser(user._id)}
                          disabled={processingId === user._id}
                        >
                          {processingId === user._id ? '⏳' : '🔒 Block'}
                        </button>
                      )}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={processingId === user._id}
                      >
                        {processingId === user._id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PENDING ITEMS TAB */}
      {activeTab === 'pending-items' && (
        <div className="tab-content">
          <h2>Pending Items Review</h2>
          {pendingItems.length === 0 ? (
            <p className="no-data">No pending items</p>
          ) : (
            <div className="items-grid">
              {pendingItems.map(item => (
                <div key={item._id} className="item-card pending">
                  <img src={item.imageUrl} alt={item.title} className="item-image" />
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p className="item-seller">By: {item.sellerId?.name || 'Unknown'}</p>
                    <p className="item-description">{item.description.substring(0, 80)}...</p>
                    <p className="item-price">₹{item.price}</p>
                    <p className="item-category">Category: {item.category}</p>
                    <div className="item-actions">
                      <button
                        className="btn-action btn-approve"
                        onClick={() => handleApproveItem(item._id)}
                        disabled={processingId === item._id}
                      >
                        {processingId === item._id ? '⏳' : '✅ Approve'}
                      </button>
                      <button
                        className="btn-action btn-reject"
                        onClick={() => handleRejectItem(item._id)}
                        disabled={processingId === item._id}
                      >
                        {processingId === item._id ? '⏳' : '❌ Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALL ITEMS TAB */}
      {activeTab === 'items' && (
        <div className="tab-content">
          <h2>All Items</h2>
          {filteredItems.length === 0 ? (
            <p className="no-data">No items found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.sellerId?.name || 'Unknown'}</td>
                    <td>{item.category}</td>
                    <td>₹{item.price}</td>
                    <td><span className="badge badge-approved">✅ Approved</span></td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="action-btns">
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={processingId === item._id}
                      >
                        {processingId === item._id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PENDING SERVICES TAB */}
      {activeTab === 'pending-services' && (
        <div className="tab-content">
          <h2>Pending Services Review</h2>
          {pendingServices.length === 0 ? (
            <p className="no-data">No pending services</p>
          ) : (
            <div className="items-grid">
              {pendingServices.map(service => (
                <div key={service._id} className="item-card pending">
                  <div className="item-image-placeholder">🔧 Service</div>
                  <div className="item-info">
                    <h4>{service.title}</h4>
                    <p className="item-seller">By: {service.sellerId?.name || 'Unknown'}</p>
                    <p className="item-description">{service.description.substring(0, 80)}...</p>
                    <p className="item-price">₹{service.price}/hr</p>
                    <p className="item-category">Category: {service.category}</p>
                    <div className="item-actions">
                      <button
                        className="btn-action btn-approve"
                        onClick={() => handleApproveService(service._id)}
                        disabled={processingId === service._id}
                      >
                        {processingId === service._id ? '⏳' : '✅ Approve'}
                      </button>
                      <button
                        className="btn-action btn-reject"
                        onClick={() => handleRejectService(service._id)}
                        disabled={processingId === service._id}
                      >
                        {processingId === service._id ? '⏳' : '❌ Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALL SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="tab-content">
          <h2>All Services</h2>
          {filteredServices.length === 0 ? (
            <p className="no-data">No services found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Price/hr</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(service => (
                  <tr key={service._id}>
                    <td><strong>{service.title}</strong></td>
                    <td>{service.sellerId?.name || 'Unknown'}</td>
                    <td>{service.category}</td>
                    <td>₹{service.price}</td>
                    <td><span className="badge badge-approved">✅ Approved</span></td>
                    <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                    <td className="action-btns">
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteService(service._id)}
                        disabled={processingId === service._id}
                      >
                        {processingId === service._id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SELLER PRODUCTS TAB */}
      {activeTab === 'seller-products' && (
        <div className="tab-content">
          <h2>🏪 Seller Products</h2>
          
          {!selectedSeller ? (
            <div>
              <p style={{marginBottom: '20px', color: '#666'}}>Select a seller to view their items and services:</p>
              <div className="sellers-list">
                {sellers.length === 0 ? (
                  <p className="no-data">No sellers found</p>
                ) : (
                  sellers.map(seller => (
                    <div 
                      key={seller._id} 
                      className="seller-card"
                      onClick={() => setSelectedSeller(seller)}
                      style={{cursor: 'pointer'}}
                    >
                      <div style={{fontSize: '40px', marginBottom: '10px'}}>🏪</div>
                      <h3>{seller.name}</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>{seller.email}</p>
                      <p style={{color: '#999', fontSize: '12px'}}>📞 {seller.phone || 'N/A'}</p>
                      <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee'}}>
                        <span style={{background: '#e3f2fd', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-block'}}>
                          📦 {items.filter(i => i.sellerId?._id === seller._id).length} Items
                        </span>
                        <span style={{background: '#f3e5f5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-block', marginLeft: '8px'}}>
                          🔧 {services.filter(s => s.sellerId?._id === seller._id).length} Services
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #eee'}}>
                <h3>📦 Products by {selectedSeller.name}</h3>
                <button 
                  onClick={() => setSelectedSeller(null)}
                  style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}
                >
                  ← Select Another Seller
                </button>
              </div>

              {/* Items Section */}
              <div style={{marginBottom: '40px'}}>
                <h4 style={{marginBottom: '15px', color: '#333'}}>📦 Items ({sellerItems.length})</h4>
                {sellerItems.length === 0 ? (
                  <p className="no-data">This seller has no items</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Date Added</th>
                        <th>Views</th>
                        <th>Chat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerItems.map(item => (
                        <tr key={item._id}>
                          <td><strong>{item.title}</strong></td>
                          <td>{item.category}</td>
                          <td>₹{item.price}</td>
                          <td><span className="badge badge-approved">✅ Approved</span></td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td><span style={{background: '#e8f5e9', padding: '4px 8px', borderRadius: '4px'}}>👁️ {item.viewCount || 0}</span></td>
                          <td>
                            <ChatButton userId={selectedSeller._id} itemId={item._id}>
                              💬 Chat
                            </ChatButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Services Section */}
              <div>
                <h4 style={{marginBottom: '15px', color: '#333'}}>🔧 Services ({sellerServices.length})</h4>
                {sellerServices.length === 0 ? (
                  <p className="no-data">This seller has no services</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price/hr</th>
                        <th>Status</th>
                        <th>Date Added</th>
                        <th>Views</th>
                        <th>Chat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerServices.map(service => (
                        <tr key={service._id}>
                          <td><strong>{service.title}</strong></td>
                          <td>{service.category}</td>
                          <td>₹{service.price}</td>
                          <td><span className="badge badge-approved">✅ Approved</span></td>
                          <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                          <td><span style={{background: '#f3e5f5', padding: '4px 8px', borderRadius: '4px'}}>👁️ {service.viewCount || 0}</span></td>
                          <td>
                            <ChatButton userId={selectedSeller._id} serviceId={service._id}>
                              💬 Chat
                            </ChatButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
