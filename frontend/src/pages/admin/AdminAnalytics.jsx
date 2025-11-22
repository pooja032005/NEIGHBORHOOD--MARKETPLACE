import React, { useEffect, useState } from "react";
import client from "../../api/api";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/admin.css";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, itemsRes, servicesRes] = await Promise.all([
        client.get("/admin-management/stats", { headers }),
        client.get("/admin-management/pending-items", { headers }),
        client.get("/admin-management/pending-services", { headers }),
      ]);

      setStats(statsRes.data);
      setPendingItems(itemsRes.data);
      setPendingServices(servicesRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="admin-header">
          <h1>📈 Analytics & Reports</h1>
          <p>Platform statistics and activity overview</p>
        </div>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : stats ? (
          <>
            {/* Summary Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.users.total}</p>
                  <div className="stat-breakdown">
                    <span>🛒 Buyers: {stats.users.buyers}</span>
                    <span>🏪 Sellers: {stats.users.sellers}</span>
                    <span>👑 Admins: {stats.users.total - stats.users.buyers - stats.users.sellers}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>Items Status</h3>
                  <p className="stat-number">{stats.items.total}</p>
                  <div className="stat-breakdown">
                    <span className="approved">✅ {stats.items.approved} Approved</span>
                    <span className="pending">⏳ {stats.items.pending} Pending</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🛠️</div>
                <div className="stat-content">
                  <h3>Services Status</h3>
                  <p className="stat-number">{stats.services.total}</p>
                  <div className="stat-breakdown">
                    <span className="approved">✅ {stats.services.approved} Approved</span>
                    <span className="pending">⏳ {stats.services.pending} Pending</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Transactions</h3>
                  <p className="stat-number">{stats.orders + stats.bookings}</p>
                  <div className="stat-breakdown">
                    <span>📦 Orders: {stats.orders}</span>
                    <span>🗓️ Bookings: {stats.bookings}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Items */}
            <div className="analytics-section">
              <h2>⏳ Pending Items ({pendingItems.length})</h2>
              {pendingItems.length === 0 ? (
                <p>No pending items</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                        <td>{item.owner?.name}</td>
                        <td>₹{item.price}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pending Services */}
            <div className="analytics-section">
              <h2>⏳ Pending Services ({pendingServices.length})</h2>
              {pendingServices.length === 0 ? (
                <p>No pending services</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Provider</th>
                      <th>Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingServices.map((service) => (
                      <tr key={service._id}>
                        <td>{service.title}</td>
                        <td>{service.provider?.name}</td>
                        <td>₹{service.price}</td>
                        <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="error">Failed to load analytics</div>
        )}
      </div>
    </div>
  );
}
