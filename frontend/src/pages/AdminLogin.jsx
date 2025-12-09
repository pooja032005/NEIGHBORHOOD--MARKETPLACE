import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [deniedUserRole, setDeniedUserRole] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password });
      // store token first
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Not an admin; clear and show modal
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setDeniedUserRole(data.user.role);
        setShowAccessDeniedModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleAccessDeniedClose = () => {
    setShowAccessDeniedModal(false);
    setEmail('');
    setPassword('');
  };

  const handleRedirectToUserLogin = () => {
    setShowAccessDeniedModal(false);
    setEmail('');
    setPassword('');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      {/* Access Denied Modal */}
      {showAccessDeniedModal && (
        <div className="modal-overlay" onClick={handleAccessDeniedClose}>
          <div className="access-denied-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🚫</div>
            <h2 className="modal-title">Access Denied</h2>
            <p className="modal-message">
              This admin panel is <strong>only for administrators</strong>.
            </p>
            <p className="modal-detail">
              You logged in as a <strong className="user-role">{deniedUserRole}</strong>.
            </p>
            <p className="modal-instruction">
              {deniedUserRole === 'buyer' ? (
                <>Buyer accounts cannot access the admin panel. Please use the regular <Link to="/login">user login</Link>.</>
              ) : (
                <>Seller accounts cannot access the admin panel. Please use the regular <Link to="/login">user login</Link>.</>
              )}
            </p>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel"
                onClick={handleAccessDeniedClose}
              >
                Try Again
              </button>
              <button 
                className="btn-modal-primary"
                onClick={handleRedirectToUserLogin}
              >
                Go to User Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="auth-card">
        <h2 className="auth-title">Admin Sign In</h2>
        <p className="auth-subtitle">Only administrator accounts may sign in here</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? '⏳ Signing In...' : '✓ Sign In as Admin'}
          </button>
        </form>

        <p className="auth-footer">Back to <Link to="/login">User Login</Link></p>
      </div>
    </div>
  );
}
