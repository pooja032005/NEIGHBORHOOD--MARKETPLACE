import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/api';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
  }, [id, navigate]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}><p>Loading order details...</p></div>;
  if (error) return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  if (!order) return <div style={styles.container}><p>Order not found</p></div>;

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  const paymentStatusColors = {
    pending: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444',
  };

  // Handle both old (itemId) and new (items array) format
  const orderItems = order.items && order.items.length > 0
    ? order.items
    : order.itemId ? [{
        title: order.itemId?.title || 'Item',
        price: order.totalPrice,
        quantity: order.quantity || 1,
      }]
    : [];

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/buyer/dashboard')}>
        ← Back to Orders
      </button>

      <div style={styles.orderHeader}>
        <div>
          <h1>Order #{order._id?.slice(-8) || 'N/A'}</h1>
          <p style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div style={styles.statusBadges}>
          <span style={{...styles.badge, background: statusColors[order.orderStatus]}}>
            {order.orderStatus?.toUpperCase() || 'PENDING'}
          </span>
          <span style={{...styles.badge, background: paymentStatusColors[order.paymentStatus]}}>
            {order.paymentStatus?.toUpperCase() || 'PENDING'}
          </span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Order Items */}
        <div style={styles.card}>
          <h2>📦 Order Items</h2>
          <div style={styles.itemsList}>
            {orderItems.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <div style={styles.itemDetails}>
                  <p style={styles.itemTitle}>{item.title}</p>
                  <p style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <p style={styles.itemSubtotal}>₹{item.price * item.quantity}</p>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <strong>Total Amount</strong>
              <strong style={styles.totalAmount}>₹{order.totalPrice}</strong>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={styles.card}>
          <h2>🏠 Delivery Address</h2>
          {order.deliveryAddress ? (
            <div style={styles.addressContent}>
              <p><strong>{order.deliveryAddress.name}</strong></p>
              <p>{order.deliveryAddress.houseNumber}, {order.deliveryAddress.area}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
              <p>📞 {order.deliveryAddress.phone}</p>
              <p>📧 {order.deliveryAddress.email}</p>
            </div>
          ) : (
            <p style={styles.noData}>No address provided</p>
          )}
        </div>

        {/* Order Summary */}
        <div style={styles.card}>
          <h2>📋 Order Summary</h2>
          <div style={styles.summaryGrid}>
            <div>
              <p style={styles.label}>Order ID</p>
              <p style={styles.value}>{order._id?.slice(-8) || 'N/A'}</p>
            </div>
            <div>
              <p style={styles.label}>Payment Method</p>
              <p style={styles.value}>{order.paymentMethod?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p style={styles.label}>Order Status</p>
              <p style={{...styles.value, color: statusColors[order.orderStatus]}}>
                {order.orderStatus?.toUpperCase() || 'PENDING'}
              </p>
            </div>
            <div>
              <p style={styles.label}>Payment Status</p>
              <p style={{...styles.value, color: paymentStatusColors[order.paymentStatus]}}>
                {order.paymentStatus?.toUpperCase() || 'PENDING'}
              </p>
            </div>
            {order.trackingNumber && (
              <div>
                <p style={styles.label}>Tracking Number</p>
                <p style={styles.value}>{order.trackingNumber}</p>
              </div>
            )}
            {order.estimatedDeliveryDate && (
              <div>
                <p style={styles.label}>Est. Delivery</p>
                <p style={styles.value}>
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px',
    minHeight: '100vh',
  },
  backBtn: {
    padding: '10px 16px',
    background: '#f3f4f6',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '20px',
    transition: 'background 0.2s',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eee',
  },
  orderDate: {
    fontSize: '14px',
    color: '#888',
    margin: '8px 0 0 0',
  },
  statusBadges: {
    display: 'flex',
    gap: '10px',
  },
  badge: {
    padding: '8px 14px',
    color: 'white',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #fcc',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemsList: {
    marginTop: '16px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: '16px',
    margin: '0 0 4px 0',
  },
  itemMeta: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  itemSubtotal: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#10b981',
  },
  divider: {
    height: '1px',
    background: '#eee',
    margin: '12px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    fontSize: '18px',
  },
  totalAmount: {
    color: '#10b981',
  },
  addressContent: {
    lineHeight: '1.8',
    fontSize: '15px',
    color: '#333',
  },
  noData: {
    color: '#888',
    fontStyle: 'italic',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '16px',
  },
  label: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 6px 0',
  },
  value: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
};
