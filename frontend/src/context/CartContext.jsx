// frontend/src/context/CartContext.jsx
import React, { createContext, useEffect, useState } from "react";
import client from "../api/api";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const getToken = () => localStorage.getItem("token");
  const isLoggedIn = () => Boolean(getToken());

  // Show toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // ---------------------------
  // Load cart + wishlist on login
  // ---------------------------
  const loadUserData = async () => {
    if (!isLoggedIn()) {
      setCart([]);
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const cartRes = await client.get("/user-actions/cart", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const wishRes = await client.get("/user-actions/wishlist", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setCart(cartRes.data.cart || []);
      setWishlist(wishRes.data.wishlist || []);
    } catch (err) {
      console.error("LOAD CART/WISHLIST FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // ---------------------------
  // CART ACTIONS
  // ---------------------------

  const addToCart = async (item, qty = 1) => {
    if (!isLoggedIn()) {
      showToast("Please login to add items to cart", 'error');
      return false;
    }

    // Prevent sellers from adding items to cart
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user && user.role === 'seller') {
        showToast('Sellers cannot purchase items. Please use a buyer account to buy.', 'error');
        return false;
      }
    } catch (e) {
      // ignore parse errors
    }

    try {
      const res = await client.post(
        "/user-actions/cart",
        { itemId: item._id, qty },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setCart(res.data.cart);
      showToast("✓ Added to cart!", 'success');
      return true;
    } catch (err) {
      console.error("ADD TO CART FAILED", err);
      showToast("Could not add to cart", 'error');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await client.delete(`/user-actions/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCart(res.data.cart);
      showToast("Removed from cart", 'success');
      return true;
    } catch (err) {
      console.error("REMOVE CART FAILED", err);
      showToast("Could not remove from cart", 'error');
      return false;
    }
  };

  // ---------------------------
  // WISHLIST ACTIONS
  // ---------------------------

  const addToWishlist = async (item) => {
    if (!isLoggedIn()) {
      showToast("Please login to add items to wishlist", 'error');
      return false;
    }

    try {
      const res = await client.post(
        `/user-actions/wishlist/${item._id}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setWishlist(res.data.wishlist);
      showToast("❤️ Added to wishlist!", 'success');
      return true;
    } catch (err) {
      console.error("ADD TO WISHLIST FAILED", err);
      showToast("Could not add to wishlist", 'error');
      return false;
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const res = await client.delete(`/user-actions/wishlist/${itemId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setWishlist(res.data.wishlist);
      showToast("Removed from wishlist", 'success');
      return true;
    } catch (err) {
      console.error("REMOVE WISHLIST FAILED", err);
      showToast("Could not remove from wishlist", 'error');
      return false;
    }
  };

  // Get cart count
  const getCartCount = () => {
    return cart.reduce((total, item) => total + (item.qty || 1), 0);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlist.length || 0;
  };

  // ---------------------------
  // CONTEXT PROVIDER
  // ---------------------------
  return (
    <CartContext.Provider
      value={{
        loading,
        cart,
        wishlist,
        toast,
        showToast,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        getCartCount,
        getWishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

