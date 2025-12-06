import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/api';
import '../styles/seller-dashboard.css';

export default function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await client.get('/seller/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await client.delete(`/seller/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(products.filter(p => p._id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <div style={styles.container}><p>Loading your products...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📦 My Products</h1>
        <Link to="/seller/add-product" style={styles.addBtn}>
          + Add New Product
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No products yet. Start selling now!</p>
          <Link to="/seller/add-product" style={styles.primaryBtn}>
            Add First Product
          </Link>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map(product => (
            <div key={product._id} style={styles.productCard}>
              <img 
                src={product.imageUrl || 'https://via.placeholder.com/200'} 
                alt={product.title}
                style={styles.productImage}
              />
              <div style={styles.productInfo}>
                <h3 style={styles.productTitle}>{product.title}</h3>
                <p style={styles.productCategory}>{product.category || 'Uncategorized'}</p>
                <p style={styles.productDescription}>
                  {product.description?.substring(0, 100)}...
                </p>
                <div style={styles.productFooter}>
                  <span style={styles.price}>₹{product.price}</span>
                  <span style={styles.location}>📍 {product.location}</span>
                </div>
                <div style={styles.actions}>
                  <Link 
                    to={`/seller/products/${product._id}/edit`}
                    style={styles.editBtn}
                  >
                    Edit
                  </Link>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => setDeleteConfirm(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this product?</p>
            <div style={styles.modalActions}>
              <button
                style={styles.confirmBtn}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #eee',
    paddingBottom: '20px',
  },
  addBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px',
  },
  primaryBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '20px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, boxShadow 0.2s',
    cursor: 'pointer',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  productInfo: {
    padding: '16px',
  },
  productTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productCategory: {
    fontSize: '13px',
    color: '#888',
    margin: '4px 0',
  },
  productDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0',
    lineHeight: '1.4',
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #eee',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#10b981',
  },
  location: {
    fontSize: '13px',
    color: '#888',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    flex: 1,
    padding: '10px',
    background: '#4b8bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    flex: 1,
    padding: '10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '400px',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#ddd',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};
