import React, { useEffect, useState } from 'react';
import client from '../api/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/servicedetails.css';

export default function ServiceDetails(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(()=> {
    client.get(`/services/${id}`)
      .then(res => setService(res.data))
      .catch(err => {
        alert('Service not found'); 
        navigate('/services');
      });
  }, [id, navigate]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      showToast('Please select date and time');
      return;
    }
    try {
      await client.post(`/services/${id}/book`, {
        date: bookingDate,
        time: bookingTime,
        notes: bookingNotes
      });
      showToast('✓ Service booked successfully!');
      setShowBookingForm(false);
      setBookingDate('');
      setBookingTime('');
      setBookingNotes('');
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      showToast('Failed to book service');
    }
  };

  if(!service) return <div className="loading">⏳ Loading...</div>;

  return (
    <div className="servicedetails-container">
      {/* Toast */}
      {toast.show && <div className="toast toast-success">{toast.message}</div>}

      <div className="servicedetails-wrapper">
        
        {/* ===== LEFT: IMAGE ===== */}
        <div className="servicedetails-image">
          {service.imageUrl ? (
            <img src={service.imageUrl} alt={service.title} />
          ) : (
            <div className="image-placeholder">🔧</div>
          )}
          <span className="category-badge">{service.category}</span>
        </div>

        {/* ===== RIGHT: INFO & BOOKING ===== */}
        <div className="servicedetails-info">
          
          {/* Header */}
          <div className="service-header">
            <h1>{service.title}</h1>
            <div className="service-meta">
              <span className="meta-item">👤 {service.provider?.name || 'Provider'}</span>
              <span className="meta-item">📍 {service.provider?.location || 'Location'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="price-box">
            <span className="price">₹{service.price}</span>
            <span className="price-type">{service.priceType || '/hour'}</span>
          </div>

          {/* Description */}
          <div className="description-box">
            <h3>About This Service</h3>
            <p>{service.description}</p>
          </div>

          {/* Provider Card */}
          <div className="provider-card">
            <div className="provider-avatar">
              {service.provider?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="provider-info">
              <h4>{service.provider?.name}</h4>
              <p>⭐ {service.provider?.rating || '4.5'} rating</p>
              <p>📍 {service.provider?.location}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => setShowBookingForm(!showBookingForm)}
            >
              📅 {showBookingForm ? 'Hide Booking' : 'Book This Service'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowContactModal(true)}
            >
              💬 Contact Provider
            </button>
          </div>

          {/* Booking Form */}
          {showBookingForm && (
            <div className="booking-form">
              <h3>📅 Booking Details</h3>
              <form onSubmit={handleBookService}>
                <div className="form-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Select Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any specific requirements?"
                    rows="3"
                    className="form-input"
                  ></textarea>
                </div>
                <button type="submit" className="btn-submit">
                  ✓ Confirm Booking
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ===== RELATED SERVICES ===== */}
      <div className="related-services">
        <h2>🔧 Similar Services</h2>
        <div className="services-carousel">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="carousel-card">
              <div className="card-image">
                <img src={service.imageUrl || 'https://via.placeholder.com/250x150?text=Service'} alt="Related" />
              </div>
              <div className="card-info">
                <h4>{service.title}</h4>
                <p className="card-price">₹{service.price}{service.priceType}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONTACT MODAL ===== */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowContactModal(false)}
            >
              ✕
            </button>
            <h2>📞 Contact Provider</h2>
            <div className="contact-info">
              <p><strong>Name:</strong> {service.provider?.name}</p>
              <a href={`mailto:${service.provider?.email}`} className="contact-link">
                📧 {service.provider?.email}
              </a>
              <a href={`tel:${service.provider?.phone}`} className="contact-link">
                📱 {service.provider?.phone}
              </a>
              <p><strong>Location:</strong> {service.provider?.location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
