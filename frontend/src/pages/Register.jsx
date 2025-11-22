import React, { useState, useEffect, useRef } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { validateName, validateEmail, validateAddress, NAME_MAX_CHARS, EMAIL_MAX_CHARS, ADDRESS_MAX_CHARS } from '../utils/validation';
import debounce from '../utils/debounce';
import '../styles/auth.css';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [limitError, setLimitError] = useState('');
  const navigate = useNavigate();
  const liveValidateRef = useRef();

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length > NAME_MAX_CHARS) {
      setLimitError(`Name cannot exceed ${NAME_MAX_CHARS} characters`);
      return;
    }
    setLimitError('');
    setName(value);
    if (liveValidateRef.current) liveValidateRef.current('name', value);
  };

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

  const handleLocationChange = (e) => {
    const value = e.target.value;
    if (value.length > ADDRESS_MAX_CHARS) {
      setLimitError(`Location cannot exceed ${ADDRESS_MAX_CHARS} characters`);
      return;
    }
    setLimitError('');
    setLocation(value);
    if (liveValidateRef.current) liveValidateRef.current('location', value);
  };

  useEffect(() => {
    liveValidateRef.current = debounce((field, value) => {
      const nextErrors = {};
      if (field === 'name') {
        const res = validateName(value);
        if (!res.valid) nextErrors.name = res.message;
      }
      if (field === 'email') {
        const res = validateEmail(value);
        if (!res.valid) nextErrors.email = res.message;
      }
      if (field === 'location') {
        const res = validateAddress(value);
        if (!res.valid) nextErrors.location = res.message;
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
    
    // Validate all fields
    const nameCheck = validateName(name);
    const emailCheck = validateEmail(email);
    const locationCheck = validateAddress(location);
    const newErrors = {};
    if (!nameCheck.valid) newErrors.name = nameCheck.message;
    if (!emailCheck.valid) newErrors.email = emailCheck.message;
    if (!locationCheck.valid) newErrors.location = locationCheck.message;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

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
        {limitError && <div className="error-message">⚠️ {limitError}</div>}
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name * <span className="char-limit">({name.length}/{NAME_MAX_CHARS})</span></label>
            <input 
              placeholder="Your full name" 
              value={name} 
              onChange={handleNameChange}
              className={errors.name ? 'input-error' : ''}
              required 
            />
            {errors.name && <div className="field-error-message">{errors.name}</div>}
          </div>

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
              placeholder="Choose a secure password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Location (City/Area) * <span className="char-limit">({location.length}/{ADDRESS_MAX_CHARS})</span></label>
            <input 
              placeholder="e.g. Bandra, Mumbai" 
              value={location} 
              onChange={handleLocationChange}
              className={errors.location ? 'input-error' : ''}
              required 
            />
            {errors.location && <div className="field-error-message">{errors.location}</div>}
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="role-columns" style={{display: 'flex', gap: '12px'}}>
              <div className={`role-column ${role === 'buyer' ? 'active' : ''}`} onClick={() => setRole('buyer')} style={{flex:1, padding: '12px', borderRadius: '8px', border: role === 'buyer' ? '2px solid #4a90e2' : '1px solid #ddd', cursor: 'pointer'}}>
                <div style={{fontSize: '22px'}}>👤</div>
                <div style={{fontWeight:600}}>Buyer</div>
                <div style={{fontSize:12, color:'#666'}}>Browse & buy items</div>
              </div>
              <div className={`role-column ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')} style={{flex:1, padding: '12px', borderRadius: '8px', border: role === 'seller' ? '2px solid #4a90e2' : '1px solid #ddd', cursor: 'pointer'}}>
                <div style={{fontSize: '22px'}}>🏪</div>
                <div style={{fontWeight:600}}>Seller</div>
                <div style={{fontSize:12, color:'#666'}}>Post items & services</div>
              </div>
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
