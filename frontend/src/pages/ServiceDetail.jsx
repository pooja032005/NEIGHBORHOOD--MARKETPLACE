import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/api";
import ChatButton from "../components/ChatButton";
import "../styles/servicedetail.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    notes: ""
  });
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    paymentMethod: "cod"
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/services/${id}`);
      setService(response.data);

      // Fetch related services
      if (response.data.category) {
        const relatedResponse = await client.get(
          `/services?category=${response.data.category}`
        );
        setRelatedServices(
          relatedResponse.data.filter((s) => s._id !== id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error("Error fetching service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = async () => {
    try {
      const response = await client.get(`/services/${id}/contact`);
      setContactInfo(response.data);
      setShowContactModal(true);
    } catch (error) {
      console.error("Error fetching contact info:", error);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.time) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setBookingLoading(true);
      const response = await client.post(
        `/services/${id}/book`,
        bookingForm
      );
      alert("Service booked successfully! Booking ID: " + response.data.bookingId);
      setBookingForm({ date: "", time: "", notes: "" });
    } catch (error) {
      console.error("Error booking service:", error);
      alert("Failed to book service");
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePlaceServiceOrder = async (e) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.phone || !orderForm.city) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setOrderLoading(true);
      const response = await client.post("/orders/service/create", {
        serviceId: id,
        totalPrice: service.price,
        paymentMethod: orderForm.paymentMethod,
        deliveryAddress: {
          name: orderForm.name,
          phone: orderForm.phone,
          email: orderForm.email,
          city: orderForm.city
        }
      });

      alert("Service order placed successfully! Order ID: " + response.data.orderId);
      setShowOrderModal(false);
      navigate("/");
    } catch (error) {
      console.error("Error placing service order:", error);
      alert("Failed to place service order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-container">
        <div className="not-found">Service not found</div>
      </div>
    );
  }

  return (
    <div className="service-detail-container">
      <div className="service-detail-content">
        {/* Left - Service Image & Info */}
        <div className="service-image-section">
          <div className="service-main-image">
            <img
              src={
                service.imageUrl ||
                "https://via.placeholder.com/600x400?text=Service"
              }
              alt={service.title}
            />
          </div>
          <div className="service-category-large">{service.category}</div>
        </div>

        {/* Right - Details */}
        <div className="service-info-section">
          <h1 className="service-detail-title">{service.title}</h1>

          {/* Provider Card */}
          <div className="provider-card">
            <div className="provider-avatar-large">
              {service.provider?.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div className="provider-details-large">
              <h3>{service.provider?.name || "Service Provider"}</h3>
              <p>📍 {service.provider?.location || "Location not specified"}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="service-details-box">
            <p>
              <strong>Price:</strong> ₹ {service.price}
              <span className="price-label">{service.priceType || "/hour"}</span>
            </p>
            <p>
              <strong>Category:</strong> {service.category}
            </p>
            <p>
              <strong>Location:</strong> {service.location || "India"}
            </p>
          </div>

          {/* Description */}
          <div className="description-box">
            <h3>Description</h3>
            <p>{service.description || "No description available"}</p>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBookService} className="booking-form">
            <h3>📅 Book This Service</h3>

            <div className="form-group">
              <label htmlFor="booking-date">Preferred Date</label>
              <input
                id="booking-date"
                type="date"
                value={bookingForm.date}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-time">Preferred Time</label>
              <input
                id="booking-time"
                type="time"
                value={bookingForm.time}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, time: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-notes">Additional Notes</label>
              <textarea
                id="booking-notes"
                placeholder="Any special requirements or notes..."
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, notes: e.target.value })
                }
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn-book-service"
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "✓ Book This Service"}
            </button>
          </form>

          {/* Action Buttons */}
          <div className="service-action-buttons">
            <button
              className="btn-place-order"
              onClick={() => setShowOrderModal(true)}
            >
              💳 Place Order
            </button>
            <button
              className="btn-contact-provider"
              onClick={handleContactProvider}
            >
              💬 Contact Provider
            </button>
            {/* Chat provider button */}
            {service.provider && (
              <ChatButton userId={service.provider._id || service.provider.id} serviceId={service._id}>
                💬 Contact Provider
              </ChatButton>
            )}
            <button
              className="btn-back"
              onClick={() => navigate("/services")}
            >
              ← Back to Services
            </button>
          </div>
        </div>
      </div>

      {/* Place Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowOrderModal(false)}
            >
              ✕
            </button>
            <h2>Place Service Order</h2>
            <form onSubmit={handlePlaceServiceOrder}>
              <div className="order-summary">
                <p><strong>Service:</strong> {service.title}</p>
                <p><strong>Price:</strong> ₹{service.price} {service.priceType}</p>
              </div>

              <h3>Your Details</h3>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={orderForm.city}
                  onChange={(e) => setOrderForm({...orderForm, city: e.target.value})}
                  required
                />
              </div>

              <h3>Payment Method</h3>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    value="cod"
                    checked={orderForm.paymentMethod === "cod"}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                  />
                  Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    value="upi"
                    checked={orderForm.paymentMethod === "upi"}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                  />
                  UPI
                </label>
                <label>
                  <input
                    type="radio"
                    value="card"
                    checked={orderForm.paymentMethod === "card"}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                  />
                  Credit/Debit Card
                </label>
              </div>

              <button
                type="submit"
                className="btn-place-order"
                disabled={orderLoading}
              >
                {orderLoading ? "Processing..." : "✓ Place Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="related-services-section">
          <h3>Related Services</h3>
          <div className="related-services-grid">
            {relatedServices.map((relService) => (
              <div
                key={relService._id}
                className="related-service-card"
                onClick={() => navigate(`/services/${relService._id}`)}
              >
                <img
                  src={
                    relService.imageUrl ||
                    "https://via.placeholder.com/200x150?text=Service"
                  }
                  alt={relService.title}
                />
                <h4>{relService.title}</h4>
                <p className="related-price">
                  ₹ {relService.price} {relService.priceType}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && contactInfo && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowContactModal(false)}
            >
              ✕
            </button>
            <h3>Contact Provider</h3>
            <div className="contact-info-display">
              <p>
                <strong>Name:</strong> {contactInfo.name}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </p>
              <p>
                <strong>Location:</strong> {contactInfo.location}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
