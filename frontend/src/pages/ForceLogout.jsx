import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForceLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show success message
    alert('✅ Successfully logged out! Please login again to get a fresh authentication token.');
    
    // Redirect to login
    navigate('/login');
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Logging out...
    </div>
  );
}
