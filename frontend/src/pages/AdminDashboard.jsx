import React, { useEffect, useState } from 'react';
import client from '../api/api';

export default function AdminDashboard(){
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/admin/stats').then(res => setStats(res.data)).catch(err => {
      setStats({ error: 'Could not fetch stats. Are you admin?' });
    });
  }, []);

  if (!stats) return <p>Loading...</p>;

  if (stats.error) return <div className="card"><p>{stats.error}</p></div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>Users</h3><p>{stats.users}</p></div>
        <div className="stat-card"><h3>Items</h3><p>{stats.items}</p></div>
        <div className="stat-card"><h3>Services</h3><p>{stats.services}</p></div>
      </div>
    </div>
  );
}
