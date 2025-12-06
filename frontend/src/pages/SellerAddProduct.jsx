import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/api';

export default function SellerAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    condition: 'new',
    price: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.title || !form.description || !form.category || !form.price) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await client.post('/seller/products', form);
      setSuccess('Product added successfully! Redirecting...');
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (err) {
      console.error('Full error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add product';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Add New Product</h1>
      
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '5px',
          color: '#c33'
        }}>
          ❌ {error}
          {error.includes('Seller') && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              💡 <strong>Tip:</strong> You need a Seller account to add products. 
              Please register as a Seller or contact support to upgrade your account.
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '5px',
          color: '#3c3'
        }}>
          ✅ {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Product title"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product description"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '100px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Image URL"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Home Goods">Home Goods</option>
            <option value="Fashion">Fashion</option>
            <option value="Games">Games</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Condition</label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Price *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
