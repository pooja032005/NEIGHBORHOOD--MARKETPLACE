import React, { useEffect, useState } from 'react';
import client from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/admin.css';

export default function AdminStats() {
  const [mostViewed, setMostViewed] = useState(null);
  const [viewerInterest, setViewerInterest] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      // fallback - protected route also enforces this
      window.location.href = '/admin-login';
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [topRes, interestRes, trendsRes] = await Promise.all([
        client.get('/admin/top-products?limit=1', { headers }),
        client.get('/admin/viewer-interest?days=30', { headers }),
        client.get('/admin/view-trends?days=7', { headers }),
      ]);

      const top = topRes.data?.topItems?.[0] || null;
      setMostViewed(top);
      setViewerInterest(interestRes.data || null);
      setTrends(trendsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMiniChart = () => {
    if (!trends || trends.length === 0) return <div className="no-data">No trend data</div>;

    const max = Math.max(...trends.map(t => t.count), 1);
    const width = 500;
    const height = 160;
    const padding = 20;
    const barWidth = (width - padding * 2) / trends.length;

    return (
      <svg width={width} height={height} style={{ maxWidth: '100%' }}>
        {trends.map((d, i) => {
          const h = (d.count / max) * (height - padding * 2);
          const x = padding + i * barWidth + 6;
          const y = height - padding - h;
          return (
            <g key={d._id}>
              <rect x={x} y={y} width={barWidth - 12} height={h} fill="#ff4d6d" rx="4" />
              <text x={x + (barWidth - 12) / 2} y={height - 4} fontSize="10" fill="#333" textAnchor="middle">{d._id.slice(5)}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const buyerSellerRate = () => {
    if (!viewerInterest || !viewerInterest.roleBreakdown) return null;
    const buyers = viewerInterest.roleBreakdown.find(r => r._id === 'buyer')?.count || 0;
    const sellers = viewerInterest.roleBreakdown.find(r => r._id === 'seller')?.count || 0;
    const total = buyers + sellers || 1;
    return {
      buyers,
      sellers,
      buyersPct: Math.round((buyers / total) * 100),
      sellersPct: Math.round((sellers / total) * 100),
    };
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main"><div className="loading">Loading stats...</div></div>
    </div>
  );

  const rate = buyerSellerRate();

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="admin-header">
          <h1>📊 Quick Stats</h1>
          <p>Most viewed product, buyer/seller view rate and 7-day trend</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <h3>Most Viewed Product</h3>
              {mostViewed ? (
                <>
                  <p className="stat-title">{mostViewed.title}</p>
                  <p className="stat-number">{mostViewed.viewCount} views</p>
                </>
              ) : (
                <p>No viewed products yet</p>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔀</div>
            <div className="stat-content">
              <h3>Buyer / Seller Views (30d)</h3>
              {rate ? (
                <>
                  <p className="stat-number">Buyers: {rate.buyers} ({rate.buyersPct}%)</p>
                  <p className="stat-number">Sellers: {rate.sellers} ({rate.sellersPct}%)</p>
                </>
              ) : (
                <p>No data</p>
              )}
            </div>
          </div>

          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>7-Day View Trend</h3>
              <div style={{ marginTop: 8 }}>{renderMiniChart()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
