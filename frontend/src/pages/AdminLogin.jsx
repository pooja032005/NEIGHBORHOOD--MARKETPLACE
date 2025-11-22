import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        navigate('/admin');
      } else {
        // Not an admin; clear and show message
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Access denied: not an admin account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
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
