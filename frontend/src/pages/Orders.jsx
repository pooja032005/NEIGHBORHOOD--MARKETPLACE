import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/orders.css';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await client.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data?.orders || response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📭</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <button onClick={() => navigate('/items')} className="btn-browse">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header-row">
                <div>
                  <h3>Order #{order._id.slice(0, 8)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className={`order-status status-${order.orderStatus}`}>
                  {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending'}
                </div>
              </div>

              <div className="order-body">
                <div className="order-item-info">
                  {order.itemId && (
                    <>
                      <img 
                        src={order.itemId.imageUrl || '/placeholder.png'} 
                        alt={order.itemId.title} 
                        className="order-item-image"
                      />
                      <div>
                        <h4>{order.itemId.title}</h4>
                        <p>Quantity: {order.quantity}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="order-details">
                  <p><strong>Total:</strong> ₹{order.totalPrice?.toLocaleString()}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()}</p>
                  {order.deliveryAddress && (
                    <p><strong>Delivery:</strong> {order.deliveryAddress.city}</p>
                  )}
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
