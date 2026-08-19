import React, { useState, useEffect, useRef } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../utils/validation';
import debounce from '../utils/debounce';
import './Login.css';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const liveValidateRef = useRef();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (liveValidateRef.current) liveValidateRef.current('email', value);
  };

  useEffect(() => {
    liveValidateRef.current = debounce((field, value) => {
      const nextErrors = {};
      if (field === 'email') {
        const res = validateEmail(value);
        if (!res.valid) nextErrors.email = res.message;
      }
      setErrors(prev => ({ ...prev, ...nextErrors }));
    }, 400);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailCheck = validateEmail(email);
    const newErrors = {};
    if (!emailCheck.valid) newErrors.email = emailCheck.message;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event('userLoggedIn'));
      
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
    <div className="login-page">
      <span className="login-dots login-dots-top" aria-hidden="true" />
      <span className="login-dots login-dots-bottom" aria-hidden="true" />
      <span className="login-leaf" aria-hidden="true">⌁</span>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-icon" aria-hidden="true">🛍</div>
        <h1 id="login-title" className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="login-alert" role="alert">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="login-email">Email *</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">✉</span>
              <input
                id="login-email"
                className={`login-input${errors.email ? ' input-error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && <div className="login-field-error" role="alert">{errors.email}</div>}
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="login-password">Password *</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">🔒</span>
              <input
                id="login-password"
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="login-form-group">
            <span className="login-label login-role-label">Login As</span>
            <div className="login-role-grid" role="radiogroup" aria-label="Login as">
              <label className={`login-role-card${role === 'buyer' ? ' active' : ''}`}>
                <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
                <span className="login-role-icon" aria-hidden="true">👤</span>
                <span className="login-role-name">Buyer</span>
                <span className="login-role-description">Browse marketplace</span>
              </label>
              <label className={`login-role-card${role === 'seller' ? ' active' : ''}`}>
                <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} />
                <span className="login-role-icon" aria-hidden="true">🏪</span>
                <span className="login-role-name">Seller</span>
                <span className="login-role-description">Post &amp; manage listings</span>
              </label>
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : '✓ Sign In'}
          </button>
        </form>

        <p className="login-register">Don't have an account? <Link to="/register">Create one</Link></p>
        <div className="login-divider" />
        <p className="login-admin">Are you an admin? <Link to="/admin-login">Sign in here</Link></p>
      </section>
    </div>
  );
}
