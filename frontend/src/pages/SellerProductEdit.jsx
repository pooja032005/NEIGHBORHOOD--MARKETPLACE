import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/api';

export default function SellerProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    condition: '',
    imageUrl: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProduct();
  }, [id, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/seller/products/${id}`);
      setFormData(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await client.put(`/seller/products/${id}`, formData);
      setSuccess('Product updated successfully!');
      setTimeout(() => navigate('/seller/products'), 2000);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) {
    return <div style={styles.container}><p>Loading product...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h1>✏️ Edit Product</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Product Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Enter product title"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={styles.textarea}
            rows="5"
            placeholder="Describe your product in detail"
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Home Goods">Home Goods</option>
              <option value="Fashion">Fashion</option>
              <option value="Games">Games</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Your city/area"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label>Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            style={styles.input}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div style={styles.formActions}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => navigate('/seller/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc',
  },
  success: {
    background: '#efe',
    color: '#0a0',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #aca',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    background: 'white',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#ddd',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
