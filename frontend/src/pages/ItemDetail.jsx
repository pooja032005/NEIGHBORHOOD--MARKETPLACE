import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import client from "../api/api";
import ChatButton from "../components/ChatButton";
import "../styles/itemdetail.css";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, showToast } = useContext(CartContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarItems, setSimilarItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    name: "",
    phone: "",
    email: "",
    houseNumber: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod"
  });

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();
  const isBuyer = currentUser && currentUser.role === 'buyer';
  
  // Check if item is in wishlist
  const isWishlisted = wishlist.some(w => w.item?._id === item?._id);

  useEffect(() => {
    fetchItemDetail();
  }, [id]);

  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/items/${id}`);
      setItem(response.data);

      // Log product view for analytics
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        await client.post('/admin/track-view', {
          productId: id,
          productType: 'Item',
          userId: user?.id || null,
        });
      } catch (err) {
        // Silently fail view tracking; don't break the page
      }

      // Fetch similar items
      if (response.data.category) {
        const similarResponse = await client.get(
          `/items?category=${response.data.category}&limit=5`
        );
        setSimilarItems(
          similarResponse.data.filter((i) => i._id !== id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      showToast("Failed to load item details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      const success = await addToCart(item, 1);
      if (success) {
        showToast("✓ Added to cart!", "success");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await removeFromWishlist(item._id);
      } else {
        await addToWishlist(item);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToast("Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation for phone - only digits, max 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setOrderForm(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }

    // Real-time validation for pincode - only digits, max 6
    if (name === 'pincode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setOrderForm(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }

    // Real-time validation for name - only alphabets and spaces, max 30
    if (name === 'name') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 30);
      setOrderForm(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      return;
    }

    // Real-time validation for city - only alphabets and spaces, max 20
    if (name === 'city') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
      setOrderForm(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      return;
    }

    // Real-time validation for state - only alphabets and spaces, max 20
    if (name === 'state') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
      setOrderForm(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      return;
    }

    // Real-time validation for area - max 25 characters
    if (name === 'area') {
      setOrderForm(prev => ({
        ...prev,
        [name]: value.slice(0, 25)
      }));
      return;
    }

    // Real-time validation for houseNumber - max 10 characters
    if (name === 'houseNumber') {
      setOrderForm(prev => ({
        ...prev,
        [name]: value.slice(0, 10)
      }));
      return;
    }

    // For all other fields
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.phone || !orderForm.city || !orderForm.pincode) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setOrderLoading(true);
      const totalPrice = item.price * orderForm.quantity;

      // If UPI is selected, redirect to payment page
      if (orderForm.paymentMethod === 'upi') {
        navigate('/payment', {
          state: {
            itemId: id,
            quantity: orderForm.quantity,
            totalPrice,
            deliveryAddress: {
              name: orderForm.name,
              phone: orderForm.phone,
              email: orderForm.email,
              houseNumber: orderForm.houseNumber,
              area: orderForm.area,
              city: orderForm.city,
              state: orderForm.state,
              pincode: orderForm.pincode
            },
            paymentMethod: orderForm.paymentMethod
          }
        });
        return;
      }

      // For COD and Card, create order directly
      const response = await client.post("/orders/create", {
        itemId: id,
        quantity: orderForm.quantity,
        totalPrice,
        paymentMethod: orderForm.paymentMethod,
        deliveryAddress: {
          name: orderForm.name,
          phone: orderForm.phone,
          email: orderForm.email,
          houseNumber: orderForm.houseNumber,
          area: orderForm.area,
          city: orderForm.city,
          state: orderForm.state,
          pincode: orderForm.pincode
        }
      });

      showToast("✓ Order placed successfully!", "success");
      setShowOrderModal(false);
      navigate(`/`);
    } catch (error) {
      console.error("Error placing order:", error);
      showToast(error.response?.data?.message || "Failed to place order", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="item-detail-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail-container">
        <div className="not-found">Item not found</div>
      </div>
    );
  }

  const images = item.imageUrl
    ? [item.imageUrl]
    : ["https://via.placeholder.com/600x600?text=No+Image"];

  return (
    <div className="item-detail-container">
      <div className="item-detail-content">
        {/* Left Section - Image */}
        <div className="item-image-section">
          <div className="main-image-wrapper">
            <img
              src={images[currentImageIndex]}
              alt={item.title}
              className="main-image"
            />
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`View ${idx + 1}`}
                  className={`thumbnail ${
                    idx === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Details */}
        <div className="item-info-section">
          <div className="item-header">
            <span className="category-badge">{item.category || "Item"}</span>
            <h1 className="item-title">{item.title}</h1>
          </div>

          <div className="seller-info">
            <div className="seller-avatar">
              {item.owner?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="seller-details">
              <p className="seller-name">{item.owner?.name || "Seller"}</p>
              <p className="seller-location">
                📍 {item.owner?.location || "Location not specified"}
              </p>
            </div>
          </div>

          <div className="item-price-section">
            <p className="price">₹ {item.price}</p>
            <span className="condition-badge">
              {item.condition || "Used"}
            </span>
          </div>

          <div className="item-meta">
            <p>
              <strong>Condition:</strong> {item.condition || "Used"}
            </p>
            <p>
              <strong>Category:</strong> {item.category || "General"}
            </p>
            <p>
              <strong>Location:</strong> {item.location || "India"}
            </p>
          </div>

          <div className="item-description">
            <h3>Description</h3>
            <p>{item.description || "No description provided"}</p>
          </div>

          {/* Sticky Action Buttons */}
          <div className="action-buttons-sticky">
            {isBuyer ? (
              <>
                <button
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Adding..." : "🛒 Add to Cart"}
                </button>
                <button 
                  className="btn-buy-now" 
                  onClick={() => setShowOrderModal(true)}
                >
                  💳 Place Order
                </button>
                <button
                  className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlistLoading ? '⏳' : (isWishlisted ? '❤️' : '🤍')} {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </>
            ) : (
              <div style={{padding: '12px', color: '#a00'}}>Only buyers can purchase items. Please sign in with a buyer account.</div>
            )}
            {/* Chat seller button */}
            {item.owner && (
              <ChatButton userId={item.owner._id || item.owner.id} itemId={item._id}>
                💬 Message Seller
              </ChatButton>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowOrderModal(false)}
            >
              ✕
            </button>
            <h2>Place Your Order</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="order-summary">
                <p><strong>Item:</strong> {item.title}</p>
                <p><strong>Price:</strong> ₹{item.price}</p>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <p className="total-price"><strong>Total: ₹{item.price * orderForm.quantity}</strong></p>
              </div>

              <h3>Delivery Address</h3>
              <div className="form-group">
                <label>Name * (Max 30 characters)</label>
                <input
                  type="text"
                  name="name"
                  value={orderForm.name}
                  onChange={handleOrderFormChange}
                  placeholder="John Doe"
                  maxLength="30"
                  required
                />
                <span className="char-count">{orderForm.name.length}/30</span>
              </div>
              <div className="form-group">
                <label>Phone * (10 digits)</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleOrderFormChange}
                  placeholder="9876543210"
                  maxLength="10"
                  required
                />
                <span className="char-count">{orderForm.phone.length}/10</span>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={orderForm.email}
                  onChange={handleOrderFormChange}
                  disabled
                  required
                />
              </div>
              <div className="form-group">
                <label>House Number * (Max 10 characters)</label>
                <input
                  type="text"
                  name="houseNumber"
                  value={orderForm.houseNumber}
                  onChange={handleOrderFormChange}
                  placeholder="123, A-Wing"
                  maxLength="10"
                  required
                />
                <span className="char-count">{orderForm.houseNumber.length}/10</span>
              </div>
              <div className="form-group">
                <label>Area * (Max 25 characters)</label>
                <input
                  type="text"
                  name="area"
                  value={orderForm.area}
                  onChange={handleOrderFormChange}
                  placeholder="MG Road, Bangalore"
                  maxLength="25"
                  required
                />
                <span className="char-count">{orderForm.area.length}/25</span>
              </div>
              <div className="form-group">
                <label>City * (Max 20 characters)</label>
                <input
                  type="text"
                  name="city"
                  value={orderForm.city}
                  onChange={handleOrderFormChange}
                  placeholder="Bangalore"
                  maxLength="20"
                  required
                />
                <span className="char-count">{orderForm.city.length}/20</span>
              </div>
              <div className="form-group">
                <label>State * (Max 20 characters)</label>
                <input
                  type="text"
                  name="state"
                  value={orderForm.state}
                  onChange={handleOrderFormChange}
                  placeholder="Karnataka"
                  maxLength="20"
                  required
                />
                <span className="char-count">{orderForm.state.length}/20</span>
              </div>
              <div className="form-group">
                <label>Postal Code * (6 digits)</label>
                <input
                  type="text"
                  name="pincode"
                  value={orderForm.pincode}
                  onChange={handleOrderFormChange}
                  placeholder="560001"
                  maxLength="6"
                  required
                />
                <span className="char-count">{orderForm.pincode.length}/6</span>
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

      {/* Similar Items Carousel */}
      {similarItems.length > 0 && (
        <div className="similar-items-section">
          <h3 className="similar-title">Similar Items</h3>
          <div className="similar-items-carousel">
            {similarItems.map((similarItem) => (
              <div
                key={similarItem._id}
                className="similar-item-card"
                onClick={() => navigate(`/items/${similarItem._id}`)}
              >
                <div className="similar-item-image">
                  <img
                    src={
                      similarItem.imageUrl ||
                      "https://via.placeholder.com/150x150?text=Item"
                    }
                    alt={similarItem.title}
                  />
                  <span className="similar-category">
                    {similarItem.category}
                  </span>
                </div>
                <div className="similar-item-info">
                  <p className="similar-title-text">{similarItem.title}</p>
                  <p className="similar-price">₹ {similarItem.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
