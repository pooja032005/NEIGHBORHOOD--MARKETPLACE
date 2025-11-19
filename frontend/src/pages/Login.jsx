import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              placeholder="you@example.com" 
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

          <div className="form-group">
            <label>Login As</label>
            <div className="role-selector">
              <label className={`role-option ${role === 'user' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  value="user" 
                  checked={role === 'user'}
                  onChange={e => setRole(e.target.value)}
                />
                <span className="role-icon">👤</span>
                <span className="role-text">
                  <strong>Buyer</strong>
                  <small>Browse marketplace</small>
                </span>
              </label>
              <label className={`role-option ${role === 'admin' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  value="admin" 
                  checked={role === 'admin'}
                  onChange={e => setRole(e.target.value)}
                />
                <span className="role-icon">👑</span>
                <span className="role-text">
                  <strong>Seller/Admin</strong>
                  <small>Admin dashboard</small>
                </span>
              </label>
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? '⏳ Signing In...' : '✓ Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
