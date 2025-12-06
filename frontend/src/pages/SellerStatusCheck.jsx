import React, { useEffect, useState } from 'react';

export default function SellerStatusCheck() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error reading user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const isSeller = user?.role === 'seller';

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>📊 Your Account Status</h1>

      {user ? (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Name:</strong> {user.name}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Location:</strong> {user.location || 'Not set'}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Account Type:</strong> 
            <span style={{
              marginLeft: '8px',
              padding: '4px 12px',
              borderRadius: '4px',
              background: isSeller ? '#e8f5e9' : '#fff3e0',
              color: isSeller ? '#2e7d32' : '#e65100',
              fontWeight: 'bold'
            }}>
              {isSeller ? '🏪 SELLER' : '👤 BUYER'}
            </span>
          </div>

          {isSeller ? (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#e8f5e9',
              border: '2px solid #4caf50',
              borderRadius: '6px',
              color: '#2e7d32'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>✅ You're Ready to Sell!</h3>
              <p>You can now:</p>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Add products to sell</li>
                <li>Manage your inventory</li>
                <li>Track sales and views</li>
                <li>View your analytics</li>
              </ul>
              <div style={{ marginTop: '15px' }}>
                <a href="/seller/add-product" style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#4caf50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}>
                  ➕ Add Your First Product
                </a>
                <a href="/seller/dashboard" style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#2196f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  📊 Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#fff3e0',
              border: '2px solid #ff9800',
              borderRadius: '6px',
              color: '#e65100'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>⚠️ You're Currently a Buyer</h3>
              <p>To add products, you need to switch to a Seller account. Choose an option:</p>
              
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '10px' }}>Option 1: Register New Seller Account</h4>
                <a href="/register" style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#ff9800',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  Register as Seller
                </a>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Create a new account and select "🏪 Seller" during registration
                </p>
              </div>

              <div style={{
                marginTop: '15px',
                padding: '12px',
                background: '#ffffff',
                border: '1px solid #ff9800',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <h4 style={{ marginBottom: '8px' }}>Option 2: Upgrade Current Account</h4>
                <p style={{ margin: '0 0 8px 0' }}>
                  Contact support or ask an administrator to upgrade your account to seller status.
                </p>
                <code style={{
                  display: 'block',
                  background: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '3px',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#333'
                }}>
                  node scripts/makeUserSeller.js YOUR_USER_ID
                </code>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          background: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '6px',
          color: '#e65100'
        }}>
          <p>You're not logged in. Please log in first.</p>
          <a href="/login" style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#ff9800',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Go to Login
          </a>
        </div>
      )}
    </div>
  );
}
