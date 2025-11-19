import React, { useState, useEffect } from 'react';
import client from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/editprofile.css';

export default function EditProfile(){
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    role: 'user'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleChange, setRoleChange] = useState(false);

  useEffect(() => {
    if (!stored?.id && !stored?._id) {
      navigate('/login');
      return;
    }
    
    // Populate form with user data
    setFormData({
      name: stored.name || '',
      email: stored.email || '',
      phone: stored.phone || '',
      location: stored.location || '',
      address: stored.address || '',
      role: stored.role || 'user'
    });
  }, [stored, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        address: formData.address
      };

      const { data } = await client.put('/users/profile', updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update localStorage
      const updatedUser = {
        ...stored,
        ...updateData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('✓ Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (newRole === formData.role) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await client.put('/users/profile/role', 
        { newRole }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const updatedUser = {
        ...stored,
        role: newRole
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setFormData(prev => ({ ...prev, role: newRole }));
      setSuccess(`✓ Role changed to ${newRole}!`);
      
      setTimeout(() => {
        if (newRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing role');
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = stored?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        
        {/* Header */}
        <div className="edit-header">
          <div className="edit-avatar">{avatarLetter}</div>
          <h1>Edit Your Profile</h1>
          <p>Update your account information</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleProfileUpdate}>
          {/* Profile Information Section */}
          <section className="form-section">
            <h3 className="section-title">👤 Profile Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                title="Email cannot be changed"
              />
              <small>📝 Email cannot be changed for security</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Location Section */}
          <section className="form-section">
            <h3 className="section-title">📍 Location</h3>
            
            <div className="form-group">
              <label htmlFor="location">City/Area</label>
              <input
                id="location"
                type="text"
                name="location"
                placeholder="e.g. Bandra, Mumbai"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Your complete address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </section>

          {/* Account Type Section */}
          <section className="form-section">
            <h3 className="section-title">👥 Account Type</h3>
            <p className="section-description">Change your account type to switch between buyer and seller roles</p>
            
            <div className="role-selector-edit">
              <label 
                className={`role-card ${formData.role === 'user' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('user')}
              >
                <input 
                  type="radio" 
                  name="role"
                  value="user" 
                  checked={formData.role === 'user'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                />
                <span className="role-card-icon">👤</span>
                <span className="role-card-text">
                  <strong>Buyer Account</strong>
                  <small>Browse & purchase items</small>
                </span>
                {formData.role === 'user' && <span className="check-mark">✓</span>}
              </label>

              <label 
                className={`role-card ${formData.role === 'admin' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                <input 
                  type="radio" 
                  name="role"
                  value="admin" 
                  checked={formData.role === 'admin'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                />
                <span className="role-card-icon">👑</span>
                <span className="role-card-text">
                  <strong>Seller/Admin Account</strong>
                  <small>Post items & services</small>
                </span>
                {formData.role === 'admin' && <span className="check-mark">✓</span>}
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '✓ Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
