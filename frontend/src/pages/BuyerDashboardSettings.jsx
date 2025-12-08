import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/dashboard-settings.css';

export default function BuyerDashboardSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    wishlistAlerts: true,
    promotionalEmails: false,
    orderReminders: true,
  });

  const [addressBook, setAddressBook] = useState([
    {
      id: 1,
      label: 'Home',
      fullAddress: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: true,
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    label: '',
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        city: parsed.city || '',
        address: parsed.address || '',
      });
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await client.get('/users/profile');
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        city: res.data.city || '',
        address: res.data.address || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await client.put('/users/profile', formData);
      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await client.put('/users/preferences', preferences);
      showToast('Preferences saved successfully!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      showToast('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.fullAddress || !newAddress.city || !newAddress.pincode) {
      showToast('Please fill all address fields', 'error');
      return;
    }

    const id = addressBook.length + 1;
    setAddressBook(prev => [...prev, { ...newAddress, id, isDefault: false }]);
    setNewAddress({
      label: '',
      fullAddress: '',
      city: '',
      state: '',
      pincode: '',
    });
    showToast('Address added successfully!');
  };

  const handleRemoveAddress = (id) => {
    setAddressBook(prev => prev.filter(addr => addr.id !== id));
    showToast('Address removed');
  };

  const handleSetDefaultAddress = (id) => {
    setAddressBook(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
    showToast('Default address updated');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="dashboard-settings-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="settings-header">
        <div>
          <h1>⚙️ Dashboard Settings</h1>
          <p className="settings-subtitle">Manage your account and preferences</p>
        </div>
        <Link to="/buyer/dashboard" className="btn-back-dashboard">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              🔔 Preferences
            </button>
            <button
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              📍 Saved Addresses
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>👤 Profile Settings</h2>
                <p>Update your personal information</p>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleProfileChange}
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleProfileChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              <div className="action-buttons">
                <button
                  className="btn-save"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => fetchUserData()}
                >
                  ↺ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>🔔 Notification Preferences</h2>
                <p>Choose how you want to be notified</p>
              </div>

              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Order Updates</h4>
                    <p>Get notified about your order status</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={() => handlePreferenceChange('orderUpdates')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Order Reminders</h4>
                    <p>Reminders for pending orders and deliveries</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.orderReminders}
                      onChange={() => handlePreferenceChange('orderReminders')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Wishlist Alerts</h4>
                    <p>Alerts when items in your wishlist go on sale</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.wishlistAlerts}
                      onChange={() => handlePreferenceChange('wishlistAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Email Notifications</h4>
                    <p>Receive all updates via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={() => handlePreferenceChange('emailNotifications')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Promotional Emails</h4>
                    <p>Special offers, sales, and promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.promotionalEmails}
                      onChange={() => handlePreferenceChange('promotionalEmails')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-save"
                  onClick={handleSavePreferences}
                  disabled={saving}
                >
                  {saving ? '💾 Saving...' : '💾 Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>📍 Saved Addresses</h2>
                <p>Manage your delivery addresses</p>
              </div>

              {/* Current Addresses */}
              <div className="addresses-list">
                <h3>Your Addresses</h3>
                {addressBook.map(address => (
                  <div key={address.id} className="address-card">
                    <div className="address-header">
                      <h4>{address.label}</h4>
                      {address.isDefault && <span className="badge-default">Default</span>}
                    </div>
                    <p>{address.fullAddress}</p>
                    <p className="address-city">{address.city}, {address.state} - {address.pincode}</p>
                    <div className="address-actions">
                      {!address.isDefault && (
                        <button
                          className="btn-default"
                          onClick={() => handleSetDefaultAddress(address.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveAddress(address.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address */}
              <div className="add-address">
                <h3>Add New Address</h3>
                <div className="form-group">
                  <label>Label (e.g., Home, Office)</label>
                  <input
                    type="text"
                    name="label"
                    value={newAddress.label}
                    onChange={handleAddressChange}
                    placeholder="Address label"
                  />
                </div>

                <div className="form-group">
                  <label>Full Address</label>
                  <textarea
                    name="fullAddress"
                    value={newAddress.fullAddress}
                    onChange={handleAddressChange}
                    placeholder="Enter full address"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleAddressChange}
                      placeholder="Pincode"
                      maxLength="6"
                    />
                  </div>
                </div>

                <button className="btn-add-address" onClick={handleAddAddress}>
                  ➕ Add Address
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>🔒 Security Settings</h2>
                <p>Keep your account safe and secure</p>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Password</h4>
                  <p>Change your account password</p>
                  <p className="last-changed">Last changed: Never</p>
                </div>
                <button className="btn-change-password" onClick={handleChangePassword}>
                  🔑 Change Password
                </button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                  <p className="status">Currently: <span className="status-disabled">Disabled</span></p>
                </div>
                <button className="btn-enable-2fa" disabled>
                  ⏳ Coming Soon
                </button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Active Sessions</h4>
                  <p>Manage devices where you're signed in</p>
                </div>
                <button className="btn-view-sessions">
                  📱 View Sessions
                </button>
              </div>

              <div className="danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <button className="btn-logout">
                  🚪 Logout All Devices
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
