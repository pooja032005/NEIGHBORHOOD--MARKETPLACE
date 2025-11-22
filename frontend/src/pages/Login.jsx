import React, { useState, useEffect, useRef } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, EMAIL_MAX_CHARS } from '../utils/validation';
import debounce from '../utils/debounce';
import '../styles/auth.css';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [limitError, setLimitError] = useState('');
  const navigate = useNavigate();
  const liveValidateRef = useRef();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.length > EMAIL_MAX_CHARS) {
      setLimitError(`Email cannot exceed ${EMAIL_MAX_CHARS} characters`);
      return;
    }
    setLimitError('');
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

  // Auto-close limit error after 3 seconds
  useEffect(() => {
    if (limitError) {
      const timer = setTimeout(() => setLimitError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [limitError]);

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
        {limitError && <div className="error-message">⚠️ {limitError}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email * <span className="char-limit">({email.length}/{EMAIL_MAX_CHARS})</span></label>
            <input 
              type="text"
              placeholder="you@example.com" 
              value={email} 
              onChange={handleEmailChange}
              className={errors.email ? 'input-error' : ''}
              required 
            />
            {errors.email && <div className="field-error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password *</label>
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
            <div className="role-columns" style={{display: 'flex', gap: '12px'}}>
              <div className={`role-column ${role === 'buyer' ? 'active' : ''}`} onClick={() => setRole('buyer')} style={{flex:1, padding: '12px', borderRadius: '8px', border: role === 'buyer' ? '2px solid #4a90e2' : '1px solid #ddd', cursor: 'pointer'}}>
                <div style={{fontSize: '22px'}}>👤</div>
                <div style={{fontWeight:600}}>Buyer</div>
                <div style={{fontSize:12, color:'#666'}}>Browse marketplace</div>
              </div>
              <div className={`role-column ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')} style={{flex:1, padding: '12px', borderRadius: '8px', border: role === 'seller' ? '2px solid #4a90e2' : '1px solid #ddd', cursor: 'pointer'}}>
                <div style={{fontSize: '22px'}}>🏪</div>
                <div style={{fontWeight:600}}>Seller</div>
                <div style={{fontSize:12, color:'#666'}}>Post & manage listings</div>
              </div>
            </div>
            <div style={{marginTop:8, fontSize:12}}>
              <Link to="/admin-login">Are you an admin? Click here</Link>
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
