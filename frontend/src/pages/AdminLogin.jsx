import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-container admin-login-page">
      <span className="admin-login-dots admin-login-dots-left" aria-hidden="true" />
      <span className="admin-login-dots admin-login-dots-right" aria-hidden="true" />
      <span className="admin-login-curves admin-login-curves-left" aria-hidden="true" />
      <span className="admin-login-curves admin-login-curves-right" aria-hidden="true" />
      <span className="admin-login-glow" aria-hidden="true" />
      <div className="admin-side-illustration admin-security-illustration" aria-hidden="true">
        <div className="security-shield"><span>♙</span></div>
        <div className="security-check">✓</div>
        <div className="security-sparkle security-sparkle-one">✦</div>
        <div className="security-sparkle security-sparkle-two">✦</div>
        <div className="security-leaves">❧</div>
      </div>
      <div className="admin-side-illustration admin-dashboard-illustration" aria-hidden="true">
        <div className="dashboard-window"><span className="dashboard-window-bar">•••</span><span className="dashboard-avatar">●</span><span className="dashboard-line dashboard-line-one" /><span className="dashboard-line dashboard-line-two" /><span className="dashboard-line dashboard-line-three" /></div>
        <div className="dashboard-chart"><i /><i /><i /><i /></div>
        <div className="dashboard-leaf">❧</div>
      </div>
      <div className="admin-login-landscape" aria-hidden="true">
        <span className="admin-login-hill admin-login-hill-back" />
        <span className="admin-login-hill admin-login-hill-front" />
        <span className="admin-login-city">▥　▥　▥　▥　▥</span>
        <span className="admin-login-trees">♧　♧　♧　♧　♧　♧　♧</span>
        <span className="admin-login-lamps">♜　　　　　　　　　　　　　　　　♜</span>
      </div>
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

      <div className="auth-card admin-login-card">
        <div className="admin-login-icon" aria-hidden="true"><span>♜</span><b>▣</b></div>
        <h1 className="auth-title">Admin Sign In</h1>
        <p className="auth-subtitle">Only administrator accounts may sign in here</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group admin-login-field">
            <label htmlFor="admin-email">Email</label>
            <div className="admin-login-input-wrap">
              <span aria-hidden="true">✉</span>
              <input
                id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              autoComplete="email"
              required
              />
            </div>
          </div>

          <div className="form-group admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-input-wrap">
              <span aria-hidden="true">🔒</span>
              <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              autoComplete="current-password"
              required
              />
              <button
                className="admin-password-toggle"
                type="button"
                onClick={() => setShowPassword(previous => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >{showPassword ? '🙈' : '◉'}</button>
            </div>
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
