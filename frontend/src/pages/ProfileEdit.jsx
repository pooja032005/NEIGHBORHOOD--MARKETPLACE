import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/profile-edit.css';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    role: 'buyer',
    businessName: '',
    gst: ''
  });

  useEffect(() => {
    if (!stored?.id && !stored?._id) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [stored, navigate]);

  const fetchUserProfile = async () => {
    try {
      const res = await client.get('/users/profile');
      const user = res.data;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || '',
        role: user.role || 'buyer',
        businessName: user.businessName || '',
        gst: user.gst || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Error loading profile', 'error');
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let validatedValue = value;
    let error = '';

    // Phone validation: numbers only, max 10 digits
    if (name === 'phone') {
      validatedValue = value.replace(/[^0-9]/g, '');
      if (validatedValue.length > 10) {
        validatedValue = validatedValue.slice(0, 10);
      }
      if (validatedValue.length > 0 && validatedValue.length < 10) {
        error = 'Phone number must be 10 digits';
      }
    }

    // Address validation: max 150 characters
    if (name === 'address') {
      if (value.length > 150) {
        validatedValue = value.slice(0, 150);
        error = 'Address cannot exceed 150 characters';
      }
    }

    // Name validation: max 50 characters
    if (name === 'name') {
      if (value.length > 50) {
        validatedValue = value.slice(0, 50);
        error = 'Name cannot exceed 50 characters';
      }
    }

    // City validation: max 50 characters
    if (name === 'city') {
      if (value.length > 50) {
        validatedValue = value.slice(0, 50);
        error = 'City cannot exceed 50 characters';
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: validatedValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Validate all fields before saving
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    if (formData.address && formData.address.length > 150) {
      newErrors.address = 'Address cannot exceed 150 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors below', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await client.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        role: formData.role,
        businessName: formData.businessName,
        gst: formData.gst
      });

      // Update localStorage
      const updatedUser = { ...stored, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showToast('✓ Profile updated successfully', 'success');
      
      // Redirect based on role
      setTimeout(() => {
        if (formData.role === 'seller') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(error.response?.data?.message || '✗ Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-edit-container">
        <div className="profile-edit-card">
          <div className="skeleton-loader">⏳ Loading your profile...</div>
        </div>
      </div>
    );
  }

  const avatarLetter = formData.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="profile-edit-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="profile-edit-card">
        {/* Header with Avatar */}
        <div className="profile-edit-header">
          <div className="profile-avatar-circle">{avatarLetter}</div>
          <h1>Edit Your Profile</h1>
          <p>Update your personal details and preferences</p>
        </div>

        <form onSubmit={handleSaveProfile} className="profile-form">
          
          {/* PERSONAL INFORMATION SECTION */}
          <div className="form-section">
            <h3 className="section-title">👤 Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="form-input disabled"
                placeholder="Email (cannot be changed)"
              />
              <small className="form-help">Your email cannot be changed for security reasons</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">📞 Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your 10-digit phone number"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                maxLength="10"
              />
              {errors.phone && <small className="error-text">{errors.phone}</small>}
              <small className="form-help">10 digits only, no special characters</small>
            </div>
          </div>

          {/* LOCATION SECTION */}
          <div className="form-section">
            <h3 className="section-title">📍 Location</h3>
            
            <div className="form-group">
              <label htmlFor="city">City / Area</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Delhi, Mumbai, Bangalore"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Full Address <small>({formData.address.length}/150)</small></label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`}
                rows="3"
                maxLength="150"
              />
              {errors.address && <small className="error-text">{errors.address}</small>}
              <small className="form-help">Maximum 150 characters</small>
            </div>
          </div>

          {/* ACCOUNT TYPE SECTION */}
          <div className="form-section">
            <h3 className="section-title">👥 Account Type</h3>
            <p className="section-description">Choose your account type to unlock relevant features</p>
            
            <div className="role-selector-edit">
              <div
                className={`role-card ${formData.role === 'buyer' ? 'role-card-active' : ''}`}
                onClick={() => handleRoleChange('buyer')}
              >
                <div className="role-check">
                  {formData.role === 'buyer' && <span className="checkmark">✓</span>}
                </div>
                <div className="role-icon">👤</div>
                <div className="role-label">Buyer</div>
                <small>Shop & purchase items</small>
              </div>

              <div
                className={`role-card ${formData.role === 'seller' ? 'role-card-active' : ''}`}
                onClick={() => handleRoleChange('seller')}
              >
                <div className="role-check">
                  {formData.role === 'seller' && <span className="checkmark">✓</span>}
                </div>
                <div className="role-icon">🏪</div>
                <div className="role-label">Seller</div>
                <small>Sell items & services</small>
              </div>
            </div>
          </div>

          {/* SELLER FIELDS - Show only if role is 'seller' */}
          {formData.role === 'seller' && (
            <div className="form-section seller-section">
              <h3 className="section-title">🏢 Business Information (Optional)</h3>
              
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your shop name or business name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gst">GST Number</label>
                <input
                  type="text"
                  id="gst"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="e.g., 07AADCA9055R1Z0"
                  className="form-input"
                />
                <small className="form-help">Optional - Enter your GST number if you have one</small>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '✓ Save Changes'}
            </button>
            <Link to="/profile" className="btn-cancel">
              ✕ Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
