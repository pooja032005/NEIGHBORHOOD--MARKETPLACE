import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        client.get('/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        client.get('/users/wishlist', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).catch(() => ({ data: [] })),
      ]);

      setOrders(ordersRes.data || []);
      setWishlist(wishlistRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <h1>👤 Buyer Dashboard</h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{orders.length}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Orders</div>
        </div>
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{wishlist.length}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Wishlist Items</div>
        </div>
      </div>

      {/* Orders Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Total Price</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{order._id.slice(0, 8)}...</td>
                    <td style={{ padding: '10px' }}>₹{order.totalPrice}</td>
                    <td style={{ padding: '10px', color: order.orderStatus === 'delivered' ? 'green' : 'orange' }}>
                      {order.orderStatus}
                    </td>
                    <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wishlist Section */}
      <div>
        <h2>Wishlist ({wishlist.length})</h2>
        {wishlist.length === 0 ? (
          <p>No items in wishlist</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {wishlist.slice(0, 6).map(item => (
              <div key={item._id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>₹{item.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
