import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import {useState, useContext, useEffect } from "react";
import client from "../api/api";
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const { cart, wishlist } = useContext(CartContext);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch (e) {
    user = null;
  }

  // Load wishlist count when user logs in or wishlist changes
  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      loadWishlistCount();
      loadChatUnread();
    } else {
      setWishlistCount(0);
    }
  }, [wishlist, user]);

  const loadChatUnread = async () => {
    if (!user || !localStorage.getItem('token')) return;
    try {
      const res = await client.get('/chat');
      const chats = res.data || [];
      const total = chats.reduce((s, c) => s + (c.unread || 0), 0);
      setChatUnread(total);
    } catch (err) {
      console.error('Error loading chat unread', err);
      setChatUnread(0);
    }
  };

  const loadWishlistCount = async () => {
    if (!user || !localStorage.getItem('token')) return;
    
    try {
      setLoadingWishlist(true);
      const res = await client.get("/users/wishlist/count");
      setWishlistCount(res.data.count || 0);
    } catch (err) {
      console.error("Error loading wishlist count:", err);
      // Fallback to wishlist.length from context
      setWishlistCount(wishlist.length || 0);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setWishlistCount(0);
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        Neighbourhood<span style={{ color: "#ff7b54" }}>Market</span>
      </Link>

      <div style={styles.links}>
        <Link to="/items" style={styles.link}>Items</Link>
        <Link to="/services" style={styles.link}>Services</Link>
        <div style={{ position: "relative" }}
     onMouseEnter={() => setShowMiniCart(true)}
     onMouseLeave={() => setShowMiniCart(false)}
>
  <Link to="/cart" style={styles.link}>
  Cart 🛒 <span className="cart-badge" style={styles.badge}>{cart.length}</span>
</Link>


  {/* MINI CART DROPDOWN */}
  {showMiniCart && cart.length > 0 && (
    <div style={styles.dropdown}>
      {cart.slice(0, 3).map(c => (
        <div key={c.item._id} style={styles.dropItem}>
          <img src={c.item.imageUrl} style={styles.dropImg} alt="item" />
          <span>{c.item.title}</span>
        </div>
      ))}

      <Link to="/cart" style={styles.viewCartBtn}>View full cart →</Link>
    </div>
  )}
</div>


        <Link to="/wishlist" style={styles.link}>
  Wishlist ❤️ <span style={styles.badge}>{wishlistCount}</span>
        </Link>

        {user ? (
          <>
            <Link to="/profile" style={styles.link}>Profile</Link>
            <Link to="/chats" style={styles.link}>Chats 💬 <span style={styles.badge}>{chatUnread}</span></Link>
            {user.role === 'admin' && <Link to="/admin" style={{...styles.link, color: '#667eea', fontWeight: '700'}}>📊 Admin</Link>}
            <ThemeToggle />
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>

            {/* ✔ FIXED register button style merge */}
            <Link
              to="/register"
              style={{ ...styles.link, ...styles.registerBtn }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",  // 💎 glass effect
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "700",
    textDecoration: "none",
    color: "#222",
    letterSpacing: "0.5px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  link: {
    textDecoration: "none",
    fontSize: "18px",
    color: "#333",
    fontWeight: "500",
    transition: "0.25s ease",
  },

  registerBtn: {
    padding: "8px 18px",
    background: "linear-gradient(135deg, #ff7b54, #ff9f68)",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(255, 125, 84, 0.3)",
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  badge: {
  background: "#ff7b54",
  padding: "2px 8px",
  borderRadius: "10px",
  color: "white",
  marginLeft: "4px",
  fontSize: "0.8rem",
  animation: "cartPop 0.3s ease"   // ⭐ ADD THIS LINE
},

dropdown: {
  position: "absolute",
  top: "35px",
  right: 0,
  width: "250px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 8px 26px rgba(0,0,0,0.15)",
  padding: "12px",
  zIndex: 200,
},
dropItem: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
},
dropImg: {
  width: "45px",
  height: "45px",
  objectFit: "cover",
  borderRadius: "8px",
},
viewCartBtn: {
  display: "block",
  background: "#4b8bff",
  color: "white",
  textAlign: "center",
  padding: "10px 0",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  marginTop: "5px",
}


};
