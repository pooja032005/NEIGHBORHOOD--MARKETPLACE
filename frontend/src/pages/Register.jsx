import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/register', { 
        name, 
        email, 
        password, 
        location,
        role
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join our neighborhood marketplace</p>
        
        {error && <div className="error-message">⚠️ {error}</div>}
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              placeholder="Your full name" 
              value={name} 
              onChange={e=>setName(e.target.value)}
              required 
            />
          </div>

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
              placeholder="Choose a secure password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Location (City/Area)</label>
            <input 
              placeholder="e.g. Bandra, Mumbai" 
              value={location} 
              onChange={e=>setLocation(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
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
                  <small>Browse & buy items</small>
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
                  <small>Post items & services</small>
                </span>
              </label>
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? '⏳ Creating Account...' : '✓ Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
