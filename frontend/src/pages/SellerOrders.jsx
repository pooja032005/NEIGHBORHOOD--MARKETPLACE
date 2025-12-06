import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';

export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await client.get('/seller/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <h1>📋 Your Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Buyer</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Items</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Total Price</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{order._id.slice(0, 8)}...</td>
                  <td style={{ padding: '10px' }}>{order.buyerId?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px' }}>{order.items?.length || 0}</td>
                  <td style={{ padding: '10px' }}>₹{order.totalPrice}</td>
                  <td style={{ padding: '10px' }}>{order.orderStatus || 'pending'}</td>
                  <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
