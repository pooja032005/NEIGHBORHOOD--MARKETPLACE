import React, { useState } from 'react';
import client from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('buyer');
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
