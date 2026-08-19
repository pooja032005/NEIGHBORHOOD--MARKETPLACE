import React, { useState, useEffect, useRef } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { validateName, validateEmail, validateAddress, NAME_MAX_CHARS, ADDRESS_MAX_CHARS } from '../utils/validation';
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
      
      // Auto-login after successful registration
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
    <div className="register-page">
      <div className="register-shell">
        <section className="register-promo" aria-label="Neighbourhood Market benefits">
          <div className="register-promo-content">
            <span className="register-trusted">✓ Trusted by Thousands</span>
            <h1>Join Your<br />Neighbourhood<br /><em>Marketplace</em></h1>
            <p className="register-promo-copy">Create your account and start exploring amazing products, services and local deals around you.</p>

            <div className="register-benefits">
              <div><span>✓</span><p><strong>Shop Local</strong><small>Support local sellers and communities</small></p></div>
              <div><span>盾</span><p><strong>Secure &amp; Safe</strong><small>Your data is protected with top security</small></p></div>
              <div><span>↗</span><p><strong>Fast &amp; Easy</strong><small>Quick setup and seamless experience</small></p></div>
            </div>

            <div className="register-bonus"><span>🎁</span><p><strong>Welcome Bonus!</strong><small>Join today and get exclusive offers and updates delivered to you.</small></p><i>✦</i></div>
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-form-card">
            <div className="register-form-icon">🛍</div>
            <h2>Create Your Account</h2>
            <p className="register-form-subtitle">Join our <strong>neighbourhood marketplace</strong></p>

            {error && <div className="error-message" role="alert">⚠️ {error}</div>}
            {limitError && <div className="error-message" role="alert">⚠️ {limitError}</div>}

            <form onSubmit={submit}>
              <div className="register-field form-group">
                <label htmlFor="register-name">Full Name * <span>({name.length}/{NAME_MAX_CHARS})</span></label>
                <div className="register-input-wrap"><span>👤</span><input id="register-name" placeholder="Your full name" value={name} onChange={handleNameChange} className={errors.name ? 'input-error' : ''} required /></div>
                {errors.name && <div className="field-error-message">{errors.name}</div>}
              </div>

              <div className="register-field form-group">
                <label htmlFor="register-email">Email *</label>
                <div className="register-input-wrap"><span>✉</span><input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={handleEmailChange} className={errors.email ? 'input-error' : ''} required /></div>
                {errors.email && <div className="field-error-message">{errors.email}</div>}
              </div>

              <div className="register-field form-group">
                <label htmlFor="register-password">Password *</label>
                <div className="register-input-wrap"><span>🔒</span><input id="register-password" type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              </div>

              <div className="register-field form-group">
                <label htmlFor="register-location">Location (City/Area) * <span>({location.length}/{ADDRESS_MAX_CHARS})</span></label>
                <div className="register-input-wrap"><span>📍</span><input id="register-location" placeholder="e.g. Bandra, Mumbai" value={location} onChange={handleLocationChange} className={errors.location ? 'input-error' : ''} required /></div>
                {errors.location && <div className="field-error-message">{errors.location}</div>}
              </div>

              <fieldset className="register-roles">
                <legend>Account Type</legend>
                <div className="register-role-grid">
                  <label className={role === 'buyer' ? 'active' : ''}><input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} /><span>🛒</span><strong>Buyer</strong><small>Browse &amp; Buy</small></label>
                  <label className={role === 'seller' ? 'active' : ''}><input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} /><span>🏪</span><strong>Seller</strong><small>Sell Products</small></label>
                </div>
              </fieldset>

              <button className="register-submit" type="submit" disabled={loading}>{loading ? '⏳ Creating Account...' : '♙  Create Account'}</button>
            </form>
            <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </section>
      </div>

      <section className="register-trust-bar" aria-label="Marketplace promises">
        {[['🛡', '100% Secure', 'Your data is safe with us'], ['🚚', 'Fast Delivery', 'Quick & reliable delivery'], ['↻', 'Easy Returns', 'Hassle-free returns'], ['🎧', '24/7 Support', "We're here to help"]].map(([icon, title, copy]) => <div key={title}><span>{icon}</span><p><strong>{title}</strong><small>{copy}</small></p></div>)}
      </section>
    </div>
  );
}
